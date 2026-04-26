import client from "./client"; 
import { Contact } from "../types/chat";


export async function getContacts(): Promise<Contact[]> {
    try {
        const response = await client.get('/chat/contacts');
        return response.data as Contact[];
    } catch (error) {
        console.error('Error fetching contacts:', error);
        console.log('Error details:', error);
        return [];
    }
}

export async function getChatHistory(targetId: string, cursor: number = 0): Promise<any[]> {
    try {
        const response = await client.get(`/chat/history/private?targetId=${targetId}&cursor=${cursor}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return []; 
    }
}


export async function markAsRead(senderId: string): Promise<void> {
    try {
        await client.post('/chat/read/private', { senderId });
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

export async function getAvailableUsers(): Promise<Contact[]> {
    try {
        const response = await client.get('/chat/users');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching available users:', error);
        return [];
    }
}