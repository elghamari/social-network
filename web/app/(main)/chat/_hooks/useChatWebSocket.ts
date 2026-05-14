import { useEffect } from 'react';
import { Contact, Message } from '../../../lib/types/chat';
import { markAsRead } from '../../../lib/services/contact';
import { showToast } from '@/app/ui/layout/toast-store'; 

interface UseChatWebSocketProps {
  socket: WebSocket | null;
  selectedContactRef: React.RefObject<Contact | null>;
  contactsRef: React.RefObject<Contact[]>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setSelectedContact: React.Dispatch<React.SetStateAction<Contact | null>>;
  fetchContactsList: () => Promise<void>;
}

export const useChatWebSocket = ({
  socket,
  selectedContactRef,
  contactsRef,
  scrollContainerRef,
  setMessages,
  setContacts,
  setSelectedContact,
  fetchContactsList
}: UseChatWebSocketProps) => {

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);

        // 1. التعامل مع الأخطاء (Security & Permissions)
        if (parsed.type === "error") {
          const { status, error } = parsed;

          // حالة اليوزر ممسوح من الداتابيز (Unauthorized)
          if (status === 401) {
            localStorage.clear();
            window.location.href = '/login?reason=deleted';
            return;
          }

          // حالة قطع الـ Follow أو المنع (Forbidden)
          if (status === 403) {
            showToast(error || "You don't have permission to message this user.");
            return;
          }

          showToast(error || "An unexpected error occurred.");
          return;
        }

        // 2. التعامل مع الميساجات الجديدة
        if (parsed.type === "new_message") {
          const m = parsed.data;
          
          // 🚨 تصفية: إيلا كان ميساج ديال ݣروب، تجاهله هنا (بلاصتو فـ useGroupChatManager)
          if (m.group_id || m.groupId) return; 

          const newMsg: Message = {
            id: m.message_id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            content: m.content,
            isRead: m.is_read === 1,
            createdAt: m.created_at
          };

          const currentContact = selectedContactRef.current;
          const currentContactsList = contactsRef.current;

          // تحديث واجهة الشات إيلا كان مفتوح مع نفس الشخص
          if (currentContact && (newMsg.senderId === currentContact.id || newMsg.receiverId === currentContact.id)) {
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.senderId === currentContact.id) markAsRead(currentContact.id);
            
            setTimeout(() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              }
            }, 100);
          }

          // تحديث قائمة الـ Contacts (Sidebar)
          const isKnown = currentContactsList.some(c => c.id === newMsg.senderId || c.id === newMsg.receiverId);
          if (!isKnown) {
            fetchContactsList();
          } else {
            setContacts(prev => {
              const otherContacts: Contact[] = [];
              let targetContact: Contact | null = null;
              prev.forEach(c => {
                if (c.id === newMsg.senderId || c.id === newMsg.receiverId) {
                  targetContact = {
                    ...c,
                    lastMessage: newMsg.content,
                    unreadCount: (newMsg.senderId === c.id && currentContact?.id !== c.id) ? (c.unreadCount || 0) + 1 : c.unreadCount
                  };
                } else {
                  otherContacts.push(c);
                }
              });
              return targetContact ? [targetContact, ...otherContacts] : prev;
            });
          }
        }
      } catch (error) { 
        console.error("WS Parse Error:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, selectedContactRef, contactsRef, scrollContainerRef, setMessages, setContacts, setSelectedContact, fetchContactsList]);
};