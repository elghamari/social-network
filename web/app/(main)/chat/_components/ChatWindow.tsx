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
  scrollRef: React.RefObject<HTMLDivElement | null>; 
  observerTarget: (node: HTMLDivElement | null) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void; 
  hasUnreadBelow: boolean;
  onScrollToBottom: () => void; 
  children: React.ReactNode;
}

export default function ChatWindow({ 
  selectedContact, 
  messages, 
  isLoadingMore, 
  scrollRef, 
  observerTarget, 
  onScroll,
  hasUnreadBelow,
  onScrollToBottom,
  children 
}: Props) {
  
  return (
    <div className={styles.chatCard} style={{ position: 'relative' }}> 
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
        ref={scrollRef} 
        onScroll={onScroll} 
        style={{ overflowAnchor: 'auto' }} 
      >
        <div ref={observerTarget} style={{ height: '1px' }} />

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
      {hasUnreadBelow && (
        <div className={styles.newMessageToast} onClick={onScrollToBottom}>
          ⬇️ New Message
        </div>
      )}
      
      {children}
    </div>
  );
}