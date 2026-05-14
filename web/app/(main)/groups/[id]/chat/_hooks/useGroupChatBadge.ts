import { useState, useEffect } from "react";
import { useWebSocket } from "@/app/_context/WebSocketContext";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/_context/AuthContext"; 
import { getGroupUnreadCount } from "@/app/lib/services/contact"; 

export function useGroupChatBadge(groupId: number | string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useWebSocket();
  const pathname = usePathname();
  const { user } = useAuth(); 

  const isChatActive = pathname?.includes(`/groups/${groupId}/chat`);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!groupId || !user?.id || isChatActive) return;
      const count = await getGroupUnreadCount(groupId);
      setUnreadCount(count);
    };
    fetchUnread();
  }, [groupId, user?.id, isChatActive]);

  useEffect(() => {
    if (!socket || !groupId || !user?.id) return; 

    const handleWsMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "new_message") {
          const m = parsed.data;
          const incomingGroupId = String(m.group_id || m.groupId);
          if (incomingGroupId === String(groupId) && String(m.sender_id) !== String(user.id)) {
            if (!isChatActive) setUnreadCount((prev) => prev + 1);
          }
        }
      } catch (error) { console.error("WS Badge Error:", error); }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => socket.removeEventListener("message", handleWsMessage);
  }, [socket, isChatActive, groupId, user?.id]); 

  useEffect(() => {
    if (isChatActive) setUnreadCount(0);
  }, [isChatActive]);

  return { unreadCount };
}