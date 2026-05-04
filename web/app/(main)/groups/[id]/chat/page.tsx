<<<<<<< HEAD
import "./page.css";

const MOCK_MESSAGES = [
  {
    id: "m1",
    author: "Ava Morgan",
    initials: "AM",
    content: "Hey everyone! Excited for the critique session this week 🎨",
    time: "2:34 PM",
    isOwn: false,
  },
  {
    id: "m2",
    author: "You",
    initials: "YO",
    content: "Same here! I have a new dashboard layout to share.",
    time: "2:36 PM",
    isOwn: true,
  },
  {
    id: "m3",
    author: "Noah Lee",
    initials: "NL",
    content:
      "Can we also look at some icon systems? Found a great set recently.",
    time: "2:38 PM",
    isOwn: false,
  },
  {
    id: "m4",
    author: "Sophia Chen",
    initials: "SC",
    content: "Yes please! Drop the link when you can 🙌",
    time: "2:39 PM",
    isOwn: false,
  },
  {
    id: "m5",
    author: "You",
    initials: "YO",
    content: "I'll set up the agenda tonight and share it here.",
    time: "2:41 PM",
    isOwn: true,
  },
];

const IS_MEMBER = true;

export default function ChatPage() {
  if (!IS_MEMBER) {
    return (
      <div className="gd-locked">
        <p className="gd-locked__title">Members only</p>
        <p className="gd-locked__text">
          Join this group to access the chat room.
        </p>
      </div>
    );
  }

  return (
    <div className="gd-chat">
      <div className="gd-chat__messages">
        {MOCK_MESSAGES.map((msg) => (
          <div
            key={msg.id}
            className={`gd-chat__row ${msg.isOwn ? "gd-chat__row--own" : ""}`}
          >
            {!msg.isOwn && <div className="gd-avatar">{msg.initials}</div>}

            <div className="gd-chat__bubble-wrap">
              {!msg.isOwn && (
                <span className="gd-chat__author">{msg.author}</span>
              )}
              <div
                className={`gd-chat__bubble ${
                  msg.isOwn ? "gd-chat__bubble--own" : ""
                }`}
              >
                {msg.content}
              </div>
              <span className="gd-chat__time">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="gd-chat__input-area">
        <input
          className="gd-chat__input"
          type="text"
          placeholder="Type a message..."
        />
        <button className="gd-chat__send">Send</button>
      </div>
    </div>
  );
}
=======
import GroupChatWindow from "@/app/(main)/chat/components/GroupChatWindow";

export default function GroupChatPage() {
  return <GroupChatWindow />;
}
>>>>>>> WebSocket
