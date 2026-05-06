"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../../chat/chat.module.css";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { Message } from "@/app/lib/types/chat";
import { useGroupContext } from "@/app/(main)/groups/[id]/_context/context";
import { useAuth } from "@/app/_context/AuthContext";
import { useWebSocket } from "@/app/_context/WebSocketContext";
import { getGroupHistory, markGroupAsRead } from "@/app/lib/services/contact";

export default function GroupChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const group = useGroupContext();

  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getGroupHistory(Number(group.id), 0);

      const mapped: Message[] = (data?.messages || []).map((m: any) => ({
        id: m.message_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        avatar: m.avatar,
        content: m.content,
        isRead: true,
        createdAt: m.created_at,
        groupId: Number(group.id),
      }));

      setMessages(mapped);

      if (mapped.length > 0) {
        await markGroupAsRead(Number(group.id), mapped[mapped.length - 1].id);
      }
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    };

    if (group?.id) fetchMessages();
  }, [group.id]);

  const handleSendMessage = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length > 500 || !socket || !isConnected)
      return;

    socket.send(
      JSON.stringify({
        type: "send_message",
        data: { group_id: Number(group.id), content: trimmedText },
      }),
    );
  };

  useEffect(() => {
    if (!socket) return;

    const handleWsMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        if (
          parsed.type === "new_message" &&
          parsed.data.group_id === Number(group.id)
        ) {
          const m = parsed.data;
          const newMsg: Message = {
            id: m.message_id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            avatar: m.avatar,
            content: m.content,
            isRead: true,
            createdAt: m.created_at,
          };

          setMessages((prev) => [...prev, newMsg]);

          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop =
                scrollContainerRef.current.scrollHeight;
            }
          }, 50);
        }
      } catch (e) {
        console.error(e);
      }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => socket.removeEventListener("message", handleWsMessage);
  }, [socket, group.id]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messagesArea} ref={scrollContainerRef}>
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
      {group.role === "member" || group.role === "creator" ? (
        <ChatInput onSendMessage={handleSendMessage} />
      ) : (
        <div style={{ padding: "15px", textAlign: "center", color: "#9ca3af" }}>
          You must join the group to send messages.
        </div>
      )}
    </div>
  );
}
