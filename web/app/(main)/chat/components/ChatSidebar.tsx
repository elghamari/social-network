import styles from '../chat.module.css';
import { Contact } from '../../../lib/types/chat';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0).toUpperCase() || ''}${lastName?.charAt(0).toUpperCase() || ''}`;
};

interface Props {
  showAvailable: boolean;
  contacts: Contact[];
  availableUsers: Contact[];
  onToggleAvailable: () => void;
  onSelectContact: (c: Contact) => void;
}

export default function ChatSidebar({ showAvailable, contacts, availableUsers, onToggleAvailable, onSelectContact }: Props) {
  return (
    <div className={styles.sidebarCard}>
      <div className={styles.sidebarHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{showAvailable ? 'NEW CHAT' : 'RECENT'}</h2>
        <button onClick={onToggleAvailable} className={styles.iconButton}>{showAvailable ? '✕' : '＋'}</button>
      </div>
      <div className={styles.contactsList}>
        {((showAvailable ? availableUsers : contacts) || []).map((c) => (
          <div key={c.id} className={styles.contactItem} onClick={() => onSelectContact(c)}>
            <div className={styles.avatarContainer}>
              <div className={styles.contactAvatar}>{getInitials(c.firstName, c.lastName)}</div>
              {c.isOnline && <div className={styles.onlineDot}></div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.contactName}>{c.firstName} {c.lastName}</span>
                {(c.unreadCount ?? 0) > 0 && !showAvailable && <span className={styles.unreadBadge}>{c.unreadCount}</span>}
              </div>
              {!showAvailable && <span className={styles.lastMsgText}>{c.lastMessage}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}