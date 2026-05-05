import { useState, useEffect, useRef, useCallback } from "react";
import { Contact, Message } from "../../../lib/types/chat";
import {
  getContacts,
  getChatHistory,
  getAvailableUsers,
  markAsRead,
} from "../../../lib/services/contact";

import { useWebSocket } from "@/app/_context/WebSocketContext";
import { useChatWebSocket } from "./useChatWebSocket";
import { useChatScroll } from "./useChatScroll"; 

export function useChatManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Contact[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { socket, isConnected } = useWebSocket();
  const selectedContactRef = useRef(selectedContact);
  const contactsRef = useRef(contacts);

  const lastSendTimeRef = useRef<number>(0);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const fetchContactsList = useCallback(async () => {
    const data = await getContacts();
    setContacts(data || []);
  }, []);

  useEffect(() => {
    fetchContactsList();
  }, []);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !selectedContact || messages.length === 0) return;
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
              scrollContainer.scrollTop = scrollContainer.scrollHeight - prevHeight;
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

  const {
    scrollContainerRef,
    observerTarget,
    scrollToBottom,
    handleTrackScroll,
    hasUnreadBelow,
    setHasUnreadBelow,
  } = useChatScroll({
    messages,
    selectedContactId: selectedContact?.id,
    onLoadMore: () => loadMoreRef.current(),
  });

  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (selectedContact) {
        setHasMore(true);
        setHasUnreadBelow(false);
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
              c.id === selectedContact.id ? { ...c, lastMessage: last.content, unreadCount: 0 } : c
            )
          );
        } else {
          setContacts((prev) =>
            prev.map((c) => (c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c))
          );
        }
        setTimeout(() => scrollToBottom(), 100);
      }
    };
    fetchInitialMessages();
  }, [selectedContact, scrollToBottom, setHasUnreadBelow]);

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

  const handleNewChatToggle = async () => {
    if (!showAvailable) {
      const data = await getAvailableUsers();
      setAvailableUsers(data || []);
    }
    setShowAvailable(!showAvailable);
  };

  const handleSendMessage = (text: string): boolean => {
    const now = Date.now();
    if (now - lastSendTimeRef.current < 500) {
      return false; 
    }

    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length > 500 || !selectedContact || !socket || !isConnected) return false;
    
    socket.send(
      JSON.stringify({
        type: "send_message",
        data: { receiver_id: selectedContact.id, content: trimmedText },
      })
    );

    lastSendTimeRef.current = now;
    setTimeout(() => scrollToBottom(), 100);
    
    return true; 
  };

  const handleSelectContact = (c: Contact) => {
    setSelectedContact(c);
    if (showAvailable) setShowAvailable(false);
  };
  
  return {
    contacts,
    selectedContact,
    messages,
    showAvailable,
    availableUsers,
    isLoadingMore,
    hasUnreadBelow,
    scrollContainerRef,
    handleSelectContact,
    handleNewChatToggle,
    handleSendMessage,
    observerTarget,
    handleTrackScroll,
    scrollToBottom,
  };
}