export interface Notification {
    id: number;
    type: string;
    sender_id: string;
    receiver_id: string;
    entity_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}