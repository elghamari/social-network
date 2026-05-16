import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/app/lib/types/chat";
import { useGroupContext } from "@/app/(main)/groups/[id]/_context/context";
import { useAuth } from "@/app/_context/AuthContext";
import { useWebSocket } from "@/app/_context/WebSocketContext";
import { getGroupHistory, markGroupAsRead } from "@/app/lib/services/contact";
import { useChatScroll } from "@/app/(main)/chat/_hooks/useChatScroll";

export function useGroupChatManager() {
  const { group } = useGroupContext();
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);

  const isAtBottomRef = useRef(true);
  const loadMoreRef = useRef<() => Promise<void>>(async () =>
    Promise.resolve(),
  );

  const { scrollContainerRef, observerTarget } = useChatScroll({
    messages,
    selectedContactId: String(group?.id || ""),
    onLoadMore: () => loadMoreRef.current(),
  });

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
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

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore || messages.length === 0 || !group?.id)
      return;

    setIsLoadingMore(true);
    const oldestMessageId = messages[0].id;

    try {
      const data = await getGroupHistory(Number(group.id), oldestMessageId);
      const moreMessages: Message[] = (data?.messages || []).map((m: any) => ({
        id: m.message_id || m.messageId,
        senderId: m.sender_id || m.senderId,
        senderName: m.sender_name || m.senderName,
        avatar: m.avatar,
        content: m.content,
        isRead: true,
        createdAt: m.created_at || m.createdAt,
        groupId: Number(group.id),
      }));

      if (moreMessages.length < 20) {
        setHasMore(false);
      }

      if (moreMessages.length > 0) {
        const scrollContainer = scrollContainerRef.current;
        const previousHeight = scrollContainer?.scrollHeight || 0;

        setMessages((prev) => {
          const combined = [...moreMessages, ...prev];
          setTimeout(() => {
            if (scrollContainer) {
              scrollContainer.scrollTop =
                scrollContainer.scrollHeight - previousHeight;
            }
          }, 0);
          return combined;
        });
      }
    } catch (error) {
      console.error("Error loading older group messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [group?.id, hasMore, isLoadingMore, messages]);

  useEffect(() => {
    loadMoreRef.current = loadMoreMessages;
  }, [loadMoreMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!group?.id) return;
      setHasMore(true);
      setHasUnreadBelow(false);

      const data = await getGroupHistory(Number(group.id), 0);
      const mapped: Message[] = (data?.messages || []).map((m: any) => ({
        id: m.message_id || m.messageId,
        senderId: m.sender_id || m.senderId,
        senderName: m.sender_name || m.senderName,
        avatar: m.avatar,
        content: m.content,
        isRead: true,
        createdAt: m.created_at || m.createdAt,
        groupId: Number(group.id),
      }));

      setMessages(mapped);
      if (mapped.length < 20) setHasMore(false);
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
        if (parsed.type === "new_message") {
          const m = parsed.data;
          const incomingGroupId = String(m.group_id || m.groupId);
          const currentGroupId = String(group.id);
          if (
            incomingGroupId !== "undefined" &&
            incomingGroupId === currentGroupId
          ) {
            const newMsg: Message = {
              id: m.message_id || m.messageId,
              senderId: m.sender_id || m.senderId,
              senderName: m.sender_name || m.senderName,
              avatar: m.avatar,
              content: m.content,
              isRead: true,
              createdAt: m.created_at || m.createdAt,
              groupId: Number(group.id),
            };
            setMessages((prev) => [...prev, newMsg]);
            if (isAtBottomRef.current) setTimeout(() => scrollToBottom(), 50);
            else if (String(newMsg.senderId) !== String(user?.id))
              setHasUnreadBelow(true);
          }
        }
      } catch (e) {
        console.error("WS Parse Error:", e);
      }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => socket.removeEventListener("message", handleWsMessage);
  }, [socket, group?.id, user?.id, scrollToBottom]);

  const handleSendMessage = (text: string): boolean => {
    if (!text.trim() || !socket || !isConnected) return false;
    socket.send(
      JSON.stringify({
        type: "send_message",
        data: { group_id: Number(group.id), content: text.trim() },
      }),
    );
    return true;
  };

  return {
    messages,
    isLoadingMore,
    hasUnreadBelow,
    scrollContainerRef,
    handleTrackScroll,
    scrollToBottom,
    handleSendMessage,
    user,
    observerTarget,
  };
}
