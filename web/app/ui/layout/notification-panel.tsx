"use client";

import { useNotifications } from '@/app/_context/NotificationContext';
import { useRouter } from 'next/navigation'; 
import { Notification } from '@/app/lib/types/notification'; 
import { createPortal } from 'react-dom';
import './notification-panel.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: Props) {
    const router = useRouter(); 
    const { 
        notifications, 
        markAsRead, 
        handleAcceptFollow, 
        handleDeclineFollow,
        handleAcceptGroupInv,
        handleDeclineGroupInv,
        handleApproveJoinReq,
        handleRejectJoinReq
    } = useNotifications();

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        if (type.includes('group')) return '👥';
        if (type.includes('event')) return '📅';
        return '👤';
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        onClose();

        console.log("======> : ",notif.type);
        
    
        switch (notif.type) {
            case 'follow_request':
            case 'follow_accept':
            case 'follow':
                router.push(`/profile/${notif.sender_id}`); 
                break;
            case 'group_join_request':
                router.push(`/groups/${notif.entity_id}/manage`);
                break;
            case 'group_event':
                router.push(`/groups/${notif.entity_id}/events`);
                break;
            case 'group_invitation':
                router.push(`/groups/${notif.entity_id}`);
                break;
        }
    };

    return createPortal(
        <>
            <div className="notif-overlay" onClick={onClose} />
            
            <div className="notif-panel">
                <div className="notif-header">
                    <h3 className="notif-title">Notifications</h3>
                    <button className="notif-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="notif-content">
                    {notifications.length === 0 ? (
                        <div className="notif-empty">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)} 
                                className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                            >
                                <div className="notif-body">
                                    <div className="notif-icon">
                                        {getIcon(notif.type)}
                                    </div>
                                    
                                    <div className="notif-text-wrapper">
                                        <p className="notif-message">
                                            {notif.content}
                                        </p>
                                        <span className="notif-time">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </span>

                                        <div className="notif-actions">
                                            {notif.type === 'follow_request' && (
                                                <>
                                                    <button className="notif-btn primary" onClick={(e) => { e.stopPropagation(); handleAcceptFollow(notif.sender_id, notif.id); }}>Accept</button>
                                                    <button className="notif-btn secondary" onClick={(e) => { e.stopPropagation(); handleDeclineFollow(notif.sender_id, notif.id); }}>Decline</button>
                                                </>
                                            )}

                                            {notif.type === 'group_invitation' && (
                                                <>
                                                    <button className="notif-btn primary" onClick={(e) => { e.stopPropagation(); handleAcceptGroupInv(notif.entity_id, notif.id); }}>Join</button>
                                                    <button className="notif-btn secondary" onClick={(e) => { e.stopPropagation(); handleDeclineGroupInv(notif.entity_id, notif.id); }}>Ignore</button>
                                                </>
                                            )}

                                            {notif.type === 'group_join_request' && (
                                                <>
                                                    <button className="notif-btn primary" onClick={(e) => { e.stopPropagation(); handleApproveJoinReq(notif.entity_id, notif.sender_id, notif.id); }}>Approve</button>
                                                    <button className="notif-btn secondary" onClick={(e) => { e.stopPropagation(); handleRejectJoinReq(notif.entity_id, notif.sender_id, notif.id); }}>Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}