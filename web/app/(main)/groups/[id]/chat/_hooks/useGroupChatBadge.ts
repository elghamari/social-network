import { useState, useEffect } from "react";
import { useWebSocket } from "@/app/_context/WebSocketContext";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/_context/AuthContext"; 

export function useGroupChatBadge(groupId: number | undefined) {
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window !== "undefined" && groupId) {
      const saved = localStorage.getItem(`group_badge_${groupId}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const { socket } = useWebSocket();
  const pathname = usePathname();
  const { user } = useAuth(); 

  const isChatActive = pathname.endsWith(`/groups/${groupId}/chat`);

  useEffect(() => {
    if (groupId) {
      localStorage.setItem(`group_badge_${groupId}`, unreadCount.toString());
    }
  }, [unreadCount, groupId]);
  
  useEffect(() => {
    if (!socket || !groupId || !user?.id) return; 
    const channel = new BroadcastChannel(`nexus_group_${groupId}_sync`);

    const handleWsMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "new_message" && parsed.data.group_id === groupId) {
          if (parsed.data.sender_id !== user.id) {
            if (!isChatActive) {
              setUnreadCount((prev) => prev + 1);
            } else {
              channel.postMessage("clear_group_badge");
            }
          }
        }
      } catch (error) {
        console.error("WS error in GroupBadge:", error);
      }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => {
      socket.removeEventListener("message", handleWsMessage);
      channel.close();
    };
  }, [socket, isChatActive, groupId, user?.id]); 

  useEffect(() => {
    if (!groupId) return;
    const channel = new BroadcastChannel(`nexus_group_${groupId}_sync`);

    channel.onmessage = (event) => {
      if (event.data === "clear_group_badge") {
        setUnreadCount(0);
        localStorage.setItem(`group_badge_${groupId}`, "0"); 
      }
    };
    if (isChatActive) {
      setUnreadCount(0);
      localStorage.setItem(`group_badge_${groupId}`, "0"); 
      channel.postMessage("clear_group_badge");
    }

    return () => channel.close();
  }, [isChatActive, groupId]);

  return { unreadCount };
}