"use client";

import { useNotifications } from '@/app/_context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: Props) {
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

    return (
        <>
            <div 
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                    zIndex: 998, 
                    cursor: 'default'
                }}
            />
            <div style={{
                position: 'fixed', 
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px', 
                backgroundColor: '#111827', 
                border: '1px solid #1f2937',
                borderRadius: '16px', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                zIndex: 999, 
                maxHeight: '80vh', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ 
                    padding: '20px', 
                    borderBottom: '1px solid #1f2937', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#111827',
                    zIndex: 1
                }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>Notifications</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>

                <div style={{ padding: '15px' }}>
                    {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: '14px' }}>
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                                style={{
                                    padding: '14px',
                                    marginBottom: '10px',
                                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid',
                                    borderColor: notif.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.2)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', 
                                        backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                                        border: '1px solid #374151'
                                    }}>
                                        {getIcon(notif.type)}
                                    </div>
                                    
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#f3f4f6', lineHeight: '1.5' }}>
                                            {notif.content}
                                        </p>
                                        <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginTop: '6px' }}>
                                            {new Date(notif.created_at).toLocaleString()}
                                        </span>

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                            {notif.type === 'follow_request' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleAcceptFollow(notif.sender_id, notif.id); }} style={btnStyle(true)}>Accept</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeclineFollow(notif.sender_id, notif.id); }} style={btnStyle(false)}>Decline</button>
                                                </>
                                            )}

                                            {notif.type === 'group_invitation' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleAcceptGroupInv(notif.entity_id, notif.id); }} style={btnStyle(true)}>Join</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeclineGroupInv(notif.entity_id, notif.id); }} style={btnStyle(false)}>Ignore</button>
                                                </>
                                            )}

                                            {notif.type === 'join_request' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleApproveJoinReq(notif.entity_id, notif.sender_id, notif.id); }} style={btnStyle(true)}>Approve</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleRejectJoinReq(notif.entity_id, notif.sender_id, notif.id); }} style={btnStyle(false)}>Reject</button>
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
        </>
    );
}

const btnStyle = (isPrimary: boolean) => ({
    padding: '7px 14px',
    backgroundColor: isPrimary ? '#3b82f6' : 'rgba(55, 65, 81, 0.5)',
    color: isPrimary ? 'white' : '#d1d5db',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 600 as const
});