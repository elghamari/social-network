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

// --- Group Actions ---
export async function acceptGroupInvitation(groupId: string): Promise<boolean> {
    try {
        const response = await client.post(`/groups/${groupId}/invites/accept`, {});
        return response !== null;
    } catch (error) { return false; }
}

export async function declineGroupInvitation(groupId: string): Promise<boolean> {
    try {
        const response = await client.post(`/groups/${groupId}/invites/decline`, {});
        return response !== null;
    } catch (error) { return false; }
}

export async function approveGroupJoinRequest(groupId: string, userId: string): Promise<boolean> {
    try {
        const response = await client.post(`/groups/${groupId}/join-requests/${userId}/approve`, {});
        return response !== null;
    } catch (error) { return false; }
}

export async function rejectGroupJoinRequest(groupId: string, userId: string): Promise<boolean> {
    try {
        const response = await client.post(`/groups/${groupId}/join-requests/${userId}/reject`, {});
        return response !== null;
    } catch (error) { return false; }
}