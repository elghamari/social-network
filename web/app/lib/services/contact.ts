import client from "./_client"; 
import { Contact } from "../types/chat";



export async function getContacts(): Promise<Contact[]> {
    try {
        const response = await client.get('/chat/contacts');
        return response.data || []; 
    } catch (error) {
        console.log('Error fetching contacts:', JSON.stringify(error));
        return [];
    }
}



export async function getChatHistory(targetId: string, cursor: number = 0): Promise<any[]> {
    try {
        const response = await client.get(`/chat/history/private?targetId=${targetId}&cursor=${cursor}`);
        return response.data || [];
    } catch (error) {
        console.log('Error fetching chat history:', error);
        return []; 
    }
}


export async function markAsRead(senderId: string): Promise<void> {
    try {
        await client.post('/chat/read/private', { senderId });
    } catch (error) {
        console.log('Error marking as read:', error);
    }
}

export async function getAvailableUsers(): Promise<Contact[]> {
    try {
        const response = await client.get('/chat/users');
        return response.data || [];
    } catch (error) {
        console.log('Error fetching available users:', error);
        return [];
    }
}


export async function getGroupHistory(groupId: number, cursor: number = 0): Promise<any> {
    try {
        const response = await client.get(`/chat/history/group?groupId=${groupId}&cursor=${cursor}`);
        return response.data || { messages: [] };
    } catch (error) {
        console.log('Error fetching group history:', error);
        return { messages: [] }; 
    }
}

export async function markGroupAsRead(groupId: number, lastMessageId: number): Promise<void> {
    try {
        await client.post('/chat/read/group', { 
            groupId: groupId,
            lastMessageId: lastMessageId 
        });
    } catch (error) {
        console.log('Error marking group as read:', error);
    }
}


export async function getGroupUnreadCount(groupId: string | number) {
    try {
        const response = await client.get(`/chat/groups/unread?groupId=${groupId}`);
        return response?.unreadCount || response?.data?.unreadCount || 0;
    } catch (error) {
        console.error('Error fetching group unread count:', error);
        return 0;
    }
}