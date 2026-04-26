import styles from '../chat.module.css';
import { Message, Contact } from '../../../lib/types/chat';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}`;
};

interface Props {
  msg: Message;
  isReceived: boolean;
  contact: Contact;
}

export default function MessageBubble({ msg, isReceived, contact }: Props) {
  const formattedTime = msg.createdAt 
    ? new Date(msg.createdAt.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div className={`${styles.messageWrapper} ${isReceived ? styles.received : styles.sent}`}>
      {isReceived && (
        <div className={styles.messageAvatar}>
          {getInitials(contact.firstName, contact.lastName)}
        </div>
      )}
      <div className={styles.messageContent}>
        <div className={styles.bubble}>{msg.content}</div>
        <span className={styles.time}>{formattedTime}</span>
      </div>
    </div>
  );
}