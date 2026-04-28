import { useEffect } from 'react';
import { Contact, Message } from '../../../lib/types/chat';
import { markAsRead } from '../../../lib/services/contactService';

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

        if (parsed.type === "user_status_change") {
          const { user_id, status } = parsed.data;

          setContacts(prev => prev.map(c => 
            c.id === user_id ? { ...c, isOnline: status } : c
          ));

          if (selectedContactRef.current?.id === user_id) {
            setSelectedContact(prev => prev ? { ...prev, isOnline: status } : null);
          }
        }

        if (parsed.type === "new_message") {
          const m = parsed.data;
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
          if (currentContact && (newMsg.senderId === currentContact.id || newMsg.receiverId === currentContact.id)) {
            setMessages(prev => [...prev, newMsg]);
            
            if (newMsg.senderId === currentContact.id) {
              markAsRead(currentContact.id);
            }
            
            setTimeout(() => {
              if (scrollContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
                if (isNearBottom) {
                  scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
              }
            }, 100);
          }

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
                    unreadCount: (newMsg.senderId === c.id && currentContact?.id !== c.id) 
                                  ? (c.unreadCount || 0) + 1 
                                  : c.unreadCount
                  };
                } else {
                  otherContacts.push(c);
                }
              });

              if (targetContact) {
                return [targetContact, ...otherContacts];
              }
              
              return prev;
            });
          }
        }

        if (parsed.type === "messages_read") {
          const readSenderId = parsed.data.senderId;
          setContacts(prev => prev.map(c => 
            c.id === readSenderId ? { ...c, unreadCount: 0 } : c
          ));
        }

      } catch (error) {
        console.error("WS Parse Error:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, selectedContactRef, contactsRef, scrollContainerRef, setMessages, setContacts, setSelectedContact, fetchContactsList]);
};