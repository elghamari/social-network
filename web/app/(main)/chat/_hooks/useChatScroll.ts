import { useRef, useState, useCallback, useEffect } from "react";
import { Message } from "../../../lib/types/chat";

interface UseChatScrollProps {
  messages: Message[];
  selectedContactId?: string;
  onLoadMore: () => void;
}

export function useChatScroll({ messages, selectedContactId, onLoadMore }: UseChatScrollProps) {
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onLoadMore();
    });
    if (node) observer.current.observe(node);
  }, [onLoadMore]);

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
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const lastMessageSenderId = messages.length > 0 ? messages[messages.length - 1].senderId : null;

  useEffect(() => {
    if (!lastMessageId) return;
    if (isAtBottomRef.current) {
      scrollToBottom();
    } else if (lastMessageSenderId === selectedContactId) {
      setHasUnreadBelow(true);
    }
  }, [lastMessageId, lastMessageSenderId, selectedContactId, scrollToBottom]);

  return {
    scrollContainerRef,
    observerTarget,
    scrollToBottom,
    handleTrackScroll,
    hasUnreadBelow,
    setHasUnreadBelow
  };
}