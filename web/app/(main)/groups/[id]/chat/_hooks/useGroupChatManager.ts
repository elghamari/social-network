import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/app/lib/types/chat";
import { useGroupContext } from "@/app/(main)/groups/[id]/_context/context";
import { useAuth } from "@/app/_context/AuthContext";
import { useWebSocket } from "@/app/_context/WebSocketContext";
import { getGroupHistory, markGroupAsRead } from "@/app/lib/services/contact";

export function useGroupChatManager() {
  const group = useGroupContext();
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const lastSendTimeRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      isAtBottomRef.current = true;
      setHasUnreadBelow(false);
    }
  }, []);

 
  const handleTrackScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = isBottom;
    if (isBottom && hasUnreadBelow) setHasUnreadBelow(false);
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !group?.id || messages.length === 0) return;
    setIsLoadingMore(true);
    const oldestId = messages[0].id;

    try {
      const data = await getGroupHistory(Number(group.id), oldestId);
      const safeData = data?.messages || [];
      if (safeData.length < 20) setHasMore(false);

      if (safeData.length > 0) {
        const mapped: Message[] = safeData.map((m: any) => ({
          id: m.message_id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          avatar: m.avatar,
          content: m.content,
          isRead: true,
          createdAt: m.created_at,
          groupId: Number(group.id)
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
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreRef = useRef(loadMoreMessages);
  useEffect(() => { loadMoreRef.current = loadMoreMessages; }, [loadMoreMessages]);

  const observer = useRef<IntersectionObserver | null>(null);
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreRef.current();
    });
    if (node) observer.current.observe(node);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!group?.id) return;
      setHasMore(true);
      setHasUnreadBelow(false);

      const data = await getGroupHistory(Number(group.id), 0);
      const mapped: Message[] = (data?.messages || []).map((m: any) => ({
        id: m.message_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        avatar: m.avatar,
        content: m.content,
        isRead: true,
        createdAt: m.created_at,
        groupId: Number(group.id)
      }));

      setMessages(mapped);

      if (mapped.length > 0) {
        await markGroupAsRead(Number(group.id), mapped[mapped.length - 1].id);
      }
      setTimeout(() => scrollToBottom(), 100);
    };

    fetchMessages();
  }, [group?.id, scrollToBottom]);

  useEffect(() => {
    if (!socket || !group?.id) return;

    const handleWsMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "new_message" && parsed.data.group_id === Number(group.id)) {
          const m = parsed.data;
          const newMsg: Message = {
            id: m.message_id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            avatar: m.avatar,
            content: m.content,
            isRead: true,
            createdAt: m.created_at,
            groupId: Number(group.id)
          };

          setMessages((prev) => [...prev, newMsg]);
          if (isAtBottomRef.current) {
            setTimeout(() => scrollToBottom(), 50);
          } else if (newMsg.senderId !== user?.id) {
            setHasUnreadBelow(true);
          }
        }
      } catch (e) { console.error(e); }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => socket.removeEventListener("message", handleWsMessage);
  }, [socket, group?.id, user?.id, scrollToBottom]);

  const handleSendMessage = (text: string): boolean => {
    const now = Date.now();
    if (now - lastSendTimeRef.current < 500) return false;

    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length > 500 || !socket || !isConnected) return false;

    socket.send(
      JSON.stringify({
        type: "send_message",
        data: { group_id: Number(group.id), content: trimmedText },
      })
    );

    lastSendTimeRef.current = now;
    setTimeout(() => scrollToBottom(), 100);
    return true;
  };

  return {
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
  };
}