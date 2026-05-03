import React from 'react';
import styles from '../chat.module.css';
import { Contact, Message } from '../../../lib/types/chat';
import MessageBubble from './MessageBubble';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}`;
};

interface Props {
  selectedContact: Contact;
  messages: Message[];
  isLoadingMore: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>; 
  
  children: React.ReactNode;
}

export default function ChatWindow({ selectedContact, messages, isLoadingMore, onScroll, scrollRef, children }: Props) {
  return (
    <div className={styles.chatCard}>
      <div className={styles.chatHeader}>
        {selectedContact.avatar ? (
           <img 
             src={selectedContact.avatar} 
             alt="avatar" 
             className={styles.headerAvatar} 
             style={{ objectFit: 'cover' }} 
           />
        ) : (
           <div className={styles.headerAvatar}>
             {getInitials(selectedContact.firstName, selectedContact.lastName)}
           </div>
        )}
        <div className={styles.headerInfo}>
          <h3>{selectedContact.firstName} {selectedContact.lastName}</h3>
          <span style={{ color: selectedContact.isOnline ? '#10b981' : '#9ca3af', fontSize: '12px' }}>
            {selectedContact.isOnline ? 'online' : 'offline'}
          </span>
        </div>
      </div>

      <div 
        className={styles.messagesArea} 
        onScroll={onScroll} 
        ref={scrollRef}
        style={{ overflowAnchor: 'auto' }} 
      >
        {isLoadingMore && <div className={styles.loaderSmall}>Loading older messages...</div>}

        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              msg={msg} 
              isReceived={msg.senderId === selectedContact.id} 
              contact={selectedContact} 
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>No messages yet. 👋</div>
        )}
      </div>
      
      {children}
    </div>
  );
}