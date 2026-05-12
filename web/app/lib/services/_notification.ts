import client from "./_client";
import { Notification } from "../types/notification";

export async function getNotifications(): Promise<Notification[]> {
    try {
        const response = await client.get('/notifications');
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
    try {
        await client.post('/notifications/read', { notification_id: notificationId });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// --- Follow Actions ---
export async function acceptFollowRequest(targetId: string): Promise<boolean> {
    try {
        const response = await client.post(`/follow/accept?target_id=${targetId}`, {});
        return response !== null;
    } catch (error) { return false; }
}

export async function declineFollowRequest(targetId: string): Promise<boolean> {
    try {
        const response = await client.post(`/follow/decline?target_id=${targetId}`, {});
        return response !== null;
    } catch (error) { return false; }
}
