"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './chat.module.css';
import { Contact, Message } from '../lib/types/chat'; 
import { 
  getContacts, 
  getChatHistory, 
  getAvailableUsers, 
  markAsRead 
} from '../lib/services/contactService';
import { throttle } from '../lib/utils/throttle'; 

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}`;
};

export default function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Contact[]>([]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      const data = await getContacts();
      setContacts(data);
    };
    fetchContacts();
  }, []);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !selectedContact || messages.length === 0) return;

    setIsLoadingMore(true);
    const oldestId = messages[0].id;

    try {
      const data = await getChatHistory(selectedContact.id, oldestId);
      
      if (data.length < 20) {
        setHasMore(false); 
      }

      if (data.length > 0) {
        
        const mapped: Message[] = data.map((m: any) => ({
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
        
        const mapped: Message[] = data.map((m: any) => ({
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
          setContacts(prev => prev.map(c => 
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
      setAvailableUsers(data);
    }
    setShowAvailable(!showAvailable);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    console.log("Sending message...", newMessage);
    setNewMessage("");
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatCard}>
        {selectedContact ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.headerAvatar}>{getInitials(selectedContact.firstName, selectedContact.lastName)}</div>
              <div className={styles.headerInfo}>
                <h3>{selectedContact.firstName} {selectedContact.lastName}</h3>
                <span style={{ color: selectedContact.isOnline ? '#10b981' : '#9ca3af', fontSize: '12px' }}>
                  {selectedContact.isOnline ? 'online' : 'offline'}
                </span>
              </div>
            </div>

            <div 
              className={styles.messagesArea} 
              onScroll={handleScroll} 
              ref={scrollContainerRef}
              style={{ overflowAnchor: 'auto' }} 
            >
              {isLoadingMore && <div className={styles.loaderSmall}>Loading older messages...</div>}

              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isReceived = msg.senderId === selectedContact.id;
                  const formattedTime = msg.createdAt 
                    ? new Date(msg.createdAt.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "";

                  return (
                    <div key={msg.id} className={`${styles.messageWrapper} ${isReceived ? styles.received : styles.sent}`}>
                      {isReceived && (
                        <div className={styles.messageAvatar}>{getInitials(selectedContact.firstName, selectedContact.lastName)}</div>
                      )}
                      <div className={styles.messageContent}>
                        <div className={styles.bubble}>{msg.content}</div>
                        <span className={styles.time}>{formattedTime}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>No messages yet. 👋</div>
              )}
            </div>
            
            <div className={styles.inputArea}>
              <input type="text" placeholder="Type a message..." className={styles.messageInput} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button className={styles.sendArrowBtn} onClick={handleSendMessage}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>Select a conversation to start chatting</div>
        )}
      </div> 

      {/* Sidebar (Recent Chats) */}
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{showAvailable ? 'NEW CHAT' : 'RECENT'}</h2>
          <button onClick={handleNewChatToggle} className={styles.iconButton}>{showAvailable ? '✕' : '＋'}</button>
        </div>
        <div className={styles.contactsList}>
          {(showAvailable ? availableUsers : contacts).map((c) => (
            <div key={c.id} className={styles.contactItem} onClick={() => { setSelectedContact(c); if(showAvailable) setShowAvailable(false); }}>
              <div className={styles.avatarContainer}>
                <div className={styles.contactAvatar}>{getInitials(c.firstName, c.lastName)}</div>
                {c.isOnline && <div className={styles.onlineDot}></div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.contactName}>{c.firstName} {c.lastName}</span>
                  {(c.unreadCount ?? 0) > 0 && !showAvailable && <span className={styles.unreadBadge}>{c.unreadCount}</span>}
                </div>
                {!showAvailable && <span className={styles.lastMsgText}>{c.lastMessage}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}