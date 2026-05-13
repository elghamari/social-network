"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../lib/types/notification';
import { 
    getNotifications, 
    markNotificationAsRead, 
    acceptFollowRequest, 
    declineFollowRequest,
} from '../lib/services/_notification';

import { useWebSocket } from './WebSocketContext'; 
import { acceptGroupInvitation, approveJoinRequest, declineGroupInvitation, rejectJoinRequest } from '../lib/services/group';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => Promise<void>;
    handleAcceptFollow: (targetId: string, notifId: number) => Promise<void>;
    handleDeclineFollow: (targetId: string, notifId: number) => Promise<void>;
    handleAcceptGroupInv: (groupId: string, notifId: number) => Promise<void>;
    handleDeclineGroupInv: (groupId: string, notifId: number) => Promise<void>;
    handleApproveJoinReq: (groupId: string, userId: string, notifId: number) => Promise<void>;
    handleRejectJoinReq: (groupId: string, userId: string, notifId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => {},
    handleAcceptFollow: async () => {},
    handleDeclineFollow: async () => {},
    handleAcceptGroupInv: async () => {},
    handleDeclineGroupInv: async () => {},
    handleApproveJoinReq: async () => {},
    handleRejectJoinReq: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { socket } = useWebSocket();

    const fetchNotifications = useCallback(async () => {
        const data = await getNotifications();
        setNotifications(data || []);
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const channel = new BroadcastChannel('nexus_notif_sync');
        
        channel.onmessage = (event) => {
            if (event.data === 'sync_notifications') {
                fetchNotifications();
            }
        };

        return () => channel.close();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!socket) return;

        const handleWsMessage = (event: MessageEvent) => {
            try {
                const parsed = JSON.parse(event.data);
                if (parsed.type === "new_notification") { 
                    const newNotif: Notification = parsed.data;
                    setNotifications(prev => [newNotif, ...prev]); 
                }
            } catch (error) {
                console.error("Error parsing notification WS message:", error);
            }
        };

        socket.addEventListener("message", handleWsMessage);
        return () => socket.removeEventListener("message", handleWsMessage);
    }, [socket]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const notifyOtherTabs = () => {
        const channel = new BroadcastChannel('nexus_notif_sync');
        channel.postMessage('sync_notifications');
        channel.close();
    };

    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await markNotificationAsRead(id);
        notifyOtherTabs(); 
    };

    const removeNotif = (notifId: number) => {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        notifyOtherTabs();
    };

    const handleAcceptFollow = async (targetId: string, notifId: number) => {
        removeNotif(notifId);
        await acceptFollowRequest(targetId);
    };

    const handleDeclineFollow = async (targetId: string, notifId: number) => {
        removeNotif(notifId);
        await declineFollowRequest(targetId);
    };

    const handleAcceptGroupInv = async (groupId: string, notifId: number) => {
        removeNotif(notifId);
        await acceptGroupInvitation(groupId);
    };

    const handleDeclineGroupInv = async (groupId: string, notifId: number) => {
        removeNotif(notifId);
        await declineGroupInvitation(groupId);
    };

    const handleApproveJoinReq = async (groupId: string, userId: string, notifId: number) => {
        removeNotif(notifId);
        await approveJoinRequest(groupId, userId);
    };

    const handleRejectJoinReq = async (groupId: string, userId: string, notifId: number) => {
        removeNotif(notifId);
        await rejectJoinRequest(groupId, userId);
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            markAsRead, 
            handleAcceptFollow, 
            handleDeclineFollow,
            handleAcceptGroupInv,
            handleDeclineGroupInv,
            handleApproveJoinReq,
            handleRejectJoinReq
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);