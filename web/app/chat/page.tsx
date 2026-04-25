import React from 'react';
import styles from './chat.module.css';

export default function ChatPage() {
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatCard}>
        <div className={styles.chatHeader}>
          <div className={styles.headerAvatar}></div>
          <div className={styles.headerInfo}>
            <h3>Bernard Good</h3>
            <span className={styles.statusOffline}>offline</span>
          </div>
        </div>
        <div className={styles.messagesArea}>
          <div className={`${styles.messageWrapper} ${styles.received}`}>
            <div className={styles.messageAvatar}></div>
            <div className={styles.messageContent}>
              <span className={styles.senderName}>Bernard Good</span>
              <div className={styles.bubble}>Hello there! How are you?</div>
              <span className={styles.time}>1:11 AM</span>
            </div>
          </div>

          <div className={`${styles.messageWrapper} ${styles.sent}`}>
            <div className={styles.messageContent}>
              <span className={styles.senderName}>Damon Langley</span>
              <div className={styles.bubble}>hjhgj</div>
              <span className={styles.time}>1:12 AM</span>
            </div>
            <div className={styles.messageAvatar}></div>
          </div>
        </div>
        <div className={styles.inputArea}>
          <button className={styles.iconButton}>😊</button>
          
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className={styles.messageInput} 
            />
          </div>
          <button className={styles.sendArrowBtn}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
      </div> 
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarHeader}>
          <h2>ONLINE FRIENDS</h2>
        </div>
        
        <div className={styles.contactsList}>
          <div className={styles.contactItem}>
            <div className={styles.avatarContainer}>
              <div className={styles.contactAvatar}></div>
              <div className={styles.onlineDot}></div>
            </div>
            <span className={styles.contactName}>Bernard Good</span>
          </div>
        </div>
      </div>

    </div>
  );
}