"use client";

import styles from "@/app/(main)/chat/chat.module.css"; 
import ChatInput from "../../../../chat/_components/ChatInput"; 
import MessageBubble from "../../../../chat/_components/MessageBubble"; 
import { useGroupChatManager } from "../_hooks/useGroupChatManager";
import { useGroupContext } from "../../_context/context";
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
    user
  } = useGroupChatManager(); 

  const ctx  = useGroupContext()
  const {role} = ctx.group

  return (
    <div className={styles.chatCard} style={{ position: "relative" }}>
      <div
        className={styles.messagesArea}
        ref={scrollContainerRef}
        onScroll={handleTrackScroll}
        style={{ overflowAnchor: "auto" }}
      >
        <div ref={observerTarget} style={{ height: "1px" }} />

        {isLoadingMore && (
          <div className={styles.loaderSmall}>Loading older messages...</div>
        )}

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
      {role === "member" || role === "creator" ? (
        <ChatInput onSendMessage={handleSendMessage} />
      ) : (
        <div style={{ padding: "15px", textAlign: "center", color: "#9ca3af" }}>
          You must join the group to send messages.
        </div>
      )}
    </div>
  );
}