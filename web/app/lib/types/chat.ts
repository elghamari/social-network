export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    nickName?: string;
    lastMessage?: string; 
    lastTime?: string;    
    unreadCount?: number; 
    isOnline?: boolean;
}

export interface Message {
    id: number;         
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;      
    createdAt: string;
}