"use client";

import styles from "../../chat/chat.module.css"; 
import ChatInput from "./ChatInput"; 
import MessageBubble from "./MessageBubble"; 
import { useGroupChatManager } from "../../groups/_hooks/useGroupChatManager";
export default function GroupChatWindow() {
  const {
    messages,
    isLoadingMore,
    hasUnreadBelow,
    scrollContainerRef,
    observerTarget,
    handleTrackScroll,
    scrollToBottom,
    handleSendMessage,
    group,
    user
  } = useGroupChatManager(); 

  return (
    <div className={styles.chatWindow} style={{ position: 'relative' }}>
      
      <div 
        className={styles.messagesArea} 
        ref={scrollContainerRef}
        onScroll={handleTrackScroll} 
        style={{ overflowAnchor: 'auto' }}
      >
        <div ref={observerTarget} style={{ height: '1px' }} />

        {isLoadingMore && <div className={styles.loaderSmall}>Loading older messages...</div>}

        {messages.map((msg, index) => {
          const isMine = msg.senderId === user?.id; 
          return (
            <MessageBubble 
               key={msg.id || index}
               msg={msg}
               isReceived={!isMine} 
            />
          );
        })}
      </div>
      {hasUnreadBelow && (
        <div className={styles.newMessageToast} onClick={scrollToBottom}>
          ⬇️ New Message
        </div>
      )}
      {group.role === "MEMBER" || group.role === "CREATOR" ? (
        <ChatInput onSendMessage={handleSendMessage} /> 
      ) : (
        <div style={{ padding: "15px", textAlign: "center", color: "#9ca3af" }}>
          You must join the group to send messages.
        </div>
      )}
    </div>
  );
}