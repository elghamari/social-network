import styles from '../chat.module.css';
import { Message, Contact } from '../../../lib/types/chat';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}`;
};

interface Props {
  msg: Message;
  isReceived: boolean;
  contact?: Contact;       
}

export default function MessageBubble({ msg, isReceived, contact }: Props) {
  const formattedTime = msg.createdAt 
    ? new Date(msg.createdAt.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  const avatarUrl = contact?.avatar || msg.avatar;

  let initials = "U"; 
  if (contact && contact.firstName) {
    initials = getInitials(contact.firstName, contact.lastName || "");
  } else if (msg.senderName) {
    const nameParts = msg.senderName.trim().split(' ');
    initials = getInitials(nameParts[0] || '', nameParts[1] || '');
  }


  const displayName = msg.senderName || (contact ? `${contact.firstName} ${contact.lastName}` : "Unknown");

  return (
    <div className={`${styles.messageWrapper} ${isReceived ? styles.received : styles.sent}`}>
      {isReceived && (
        <div className={styles.messageAvatar}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="avatar" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            initials
          )}
        </div>
      )}
      <div className={styles.messageContent}>
        {isReceived && (
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "4px", fontWeight: "bold", marginLeft: "2px" }}>
                {displayName}
            </div>
        )}
        <div className={styles.bubble}>{msg.content}</div>
        <span className={styles.time}>{formattedTime}</span>
      </div>
    </div>
  );
}