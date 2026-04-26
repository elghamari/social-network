"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './chat.module.css';
import { Contact, Message } from '../../lib/types/chat';
import { 
  getContacts, 
  getChatHistory, 
  getAvailableUsers, 
  markAsRead 
} from '../../lib/services/contactService';
import { throttle } from '../../lib/utils/throttle';

import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';




export default function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Contact[]>([]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      const data = await getContacts();
      setContacts(data || []);
    };
    fetchContacts();
  }, []);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !selectedContact || messages.length === 0) return;

    setIsLoadingMore(true);
    const oldestId = messages[0].id;

    try {
      const data = await getChatHistory(selectedContact.id, oldestId);
      const safeData = data || []; 
      
      if (safeData.length < 20) {
        setHasMore(false); 
      }

      if (safeData.length > 0) {
        const mapped: Message[] = safeData.map((m: any) => ({
          id: m.message_id,        
          senderId: m.sender_id,   
          receiverId: m.receiver_id,
          content: m.content,
          isRead: m.is_read === 1, 
          createdAt: m.created_at
        }));

        setMessages(prev => [...mapped, ...prev]);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const throttledLoadMore = throttle(loadMoreMessages, 800);

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
          createdAt: m.created_at
        }));

        setMessages(mapped);

        if ((selectedContact.unreadCount ?? 0) > 0) {
          await markAsRead(selectedContact.id);
          setContacts(prev => (prev || []).map(c => 
            c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
          ));
        }
      }
    };
    fetchInitialMessages();
  }, [selectedContact]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0) {
      throttledLoadMore();
    }
  };

  const handleNewChatToggle = async () => {
    if (!showAvailable) {
      const data = await getAvailableUsers();
      setAvailableUsers(data || []);
    }
    setShowAvailable(!showAvailable);
  };

  const handleSendMessage = (text: string) => {
    console.log("Sending message...", text);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
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