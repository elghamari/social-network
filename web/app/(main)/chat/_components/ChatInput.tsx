import { useState, useRef, useEffect } from 'react';
import styles from '../chat.module.css';

interface Props {
  onSendMessage: (msg: string) => void;
}

const EMOJI_LIST = [
  "😀", "😂", "🤣", "😊", "🥰", "😍", "😎", "😭", "😡", "🥺",
  "👍", "👎", "🙏", "🤝", "👏", "🙌", "🔥", "❤️", "💔", "✨",
  "🎉", "🤔", "👀", "💯", "✅", "❌", "🚀", "💡", "🌙", "⭐"
];

export default function ChatInput({ onSendMessage }: Props) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length > 500) return;
    
    onSendMessage(trimmedText);
    setText(""); 
    setShowEmoji(false); 
  };

  const handleEmojiClick = (emoji: string) => {
    if (text.length + emoji.length <= 500) {
      setText(prev => prev + emoji);
    }
  };

  return (
    <div className={styles.inputArea} style={{ position: 'relative' }}>
      {showEmoji && (
        <div 
          ref={pickerRef}
          style={{
            position: 'absolute',
            bottom: '100%', 
            left: '0',
            marginBottom: '10px',
            backgroundColor: '#1f2937', 
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '10px',
            width: '280px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '10px',
            maxHeight: '160px', 
            overflowY: 'auto'
          }}
        >
          {EMOJI_LIST.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s' 
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button 
        type="button" 
        onClick={() => setShowEmoji(!showEmoji)}
        style={{ 
          marginRight: '10px', 
          fontSize: '24px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          padding: '5px'
        }}
        title="Emojis"
      >
        😀
      </button>

      <input 
        type="text" 
        placeholder="Type a message..." 
        className={styles.messageInput} 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
        maxLength={500} 
      />
      
      <button 
        className={styles.sendArrowBtn} 
        onClick={handleSend}
        disabled={!text.trim() || text.trim().length > 500} 
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </button>
    </div>
  );
}