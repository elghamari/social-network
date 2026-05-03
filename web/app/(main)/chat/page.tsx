"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./chat.module.css";
import { Contact, Message } from "../../lib/types/chat";
import {
  getContacts,
  getChatHistory,
  getAvailableUsers,
  markAsRead,
} from "../../lib/services/contactService";
import { throttle } from "../../lib/utils/throttle";

import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { useWebSocket } from "../../context/WebSocketContext";
import { useChatWebSocket } from "./hooks/useChatWebSocket";

export default function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Contact[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useWebSocket();
  const selectedContactRef = useRef(selectedContact);
  const contactsRef = useRef(contacts);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const fetchContactsList = async () => {
    const data = await getContacts();
    setContacts(data || []);
  };

  useEffect(() => {
    fetchContactsList();
  }, []);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !selectedContact || messages.length === 0)
      return;

    setIsLoadingMore(true);
    const oldestId = messages[0].id;

    try {
      const data = await getChatHistory(selectedContact.id, oldestId);
      const safeData = data || [];

      if (safeData.length < 20) setHasMore(false);

      if (safeData.length > 0) {
        const mapped: Message[] = safeData.map((m: any) => ({
          id: m.message_id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content,
          isRead: m.is_read === 1,
          createdAt: m.created_at,
        }));

        const scrollContainer = scrollContainerRef.current;
        const prevHeight = scrollContainer?.scrollHeight || 0;

        setMessages((prev) => {
          const combined = [...mapped, ...prev];
          setTimeout(() => {
            if (scrollContainer) {
              scrollContainer.scrollTop =
                scrollContainer.scrollHeight - prevHeight;
            }
          }, 0);
          return combined;
        });
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreRef = useRef(loadMoreMessages);
  useEffect(() => {
    loadMoreRef.current = loadMoreMessages;
  }, [loadMoreMessages]);

  const throttledLoadMore = useCallback(
    throttle(() => loadMoreRef.current(), 800),
    []
  );

  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (selectedContact) {
        setHasMore(true);
        const data = await getChatHistory(selectedContact.id, 0);
        const safeData = data || [];
        const mapped: Message[] = safeData.map((m: any) => ({
          id: m.message_id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          content: m.content,
          isRead: m.is_read === 1,
          createdAt: m.created_at,
        }));

        setMessages(mapped);

        await markAsRead(selectedContact.id);
        if (mapped.length > 0) {
          const last = mapped[mapped.length - 1];
          setContacts((prev) =>
            prev.map((c) =>
              c.id === selectedContact.id
                ? { ...c, lastMessage: last.content, unreadCount: 0 }
                : c
            )
          );
        } else {
          setContacts((prev) =>
            prev.map((c) =>
              c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
            )
          );
        }

        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop =
              scrollContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    };
    fetchInitialMessages();
  }, [selectedContact]);

  useChatWebSocket({
    socket,
    selectedContactRef,
    contactsRef,
    scrollContainerRef,
    setMessages,
    setContacts,
    setSelectedContact,
    fetchContactsList,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) throttledLoadMore();
  };

  const handleNewChatToggle = async () => {
    if (!showAvailable) {
      const data = await getAvailableUsers();
      setAvailableUsers(data || []);
    }
    setShowAvailable(!showAvailable);
  };

  const handleSendMessage = (text: string) => {
    const trimmedText = text.trim();
    // 🔴 الحماية من جهة الشات الفردي
    if (!trimmedText || trimmedText.length > 500 || !selectedContact || !socket || !isConnected) return;
    
    socket.send(
      JSON.stringify({
        type: "send_message",
        data: { receiver_id: selectedContact.id, content: trimmedText },
      })
    );
  };

  const handleSelectContact = (c: Contact) => {
    setSelectedContact(c);
    if (showAvailable) setShowAvailable(false);
  };

  return (
    <div className={styles.chatContainer}>
      {selectedContact ? (
        <ChatWindow
          selectedContact={selectedContact}
          messages={messages}
          isLoadingMore={isLoadingMore}
          onScroll={handleScroll}
          scrollRef={scrollContainerRef}
        >
          <ChatInput onSendMessage={handleSendMessage} />
        </ChatWindow>
      ) : (
        <div className={styles.chatCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#9ca3af",
            }}
          >
            Select a conversation to start chatting
          </div>
        </div>
      )}

      <ChatSidebar
        showAvailable={showAvailable}
        contacts={contacts}
        availableUsers={availableUsers}
        onToggleAvailable={handleNewChatToggle}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
}