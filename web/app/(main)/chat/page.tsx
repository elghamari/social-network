"use client";

import styles from "./chat.module.css";
import ChatSidebar from "./_components/ChatSidebar";
import ChatWindow from "./_components/ChatWindow";
import ChatInput from "./_components/ChatInput";
import { useChatManager } from "./_hooks/useChatManager";

export default function ChatPage() {
  const {
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
  } = useChatManager();

  return (
    <div className={styles.chatContainer}>
      {selectedContact ? (
        <ChatWindow
          selectedContact={selectedContact}
          messages={messages}
          isLoadingMore={isLoadingMore}
          scrollRef={scrollContainerRef}
          observerTarget={observerTarget}
          onScroll={handleTrackScroll}
          hasUnreadBelow={hasUnreadBelow}
          onScrollToBottom={scrollToBottom}
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