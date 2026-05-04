import "./right-sidebar.css";

const suggestedUsers = [
  { id: 1, name: "Ali Ahmed", initials: "AA" },
  { id: 2, name: "Sara Lee", initials: "SL" },
  { id: 3, name: "Mounir X", initials: "MX" },
];

export default function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <div className="right-sidebar__header">
        <h3>Suggested for you</h3>
      </div>
<<<<<<< HEAD

      <div className="right-sidebar__content">
        {/* <ul className="right-sidebar__list">
          {suggestedUsers.map((user) => (
            <li key={user.id} className="suggestion-item">
              <div className="suggestion-avatar">{user.initials}</div>

              <div className="suggestion-info">
                <span className="suggestion-name">{user.name}</span>
              </div>

              <button className="follow-btn">Follow</button>
            </li>
          ))}
        </ul> */}
      </div>
    </aside>
  );
}
=======
      
      <div className="right-sidebar__content">
        <ul className="right-sidebar__list">
          {suggestedUsers.map((user) => (
            <li key={user.id} className="suggestion-item">
              <div className="suggestion-avatar">{user.initials}</div>
              
              <div className="suggestion-info">
                <span className="suggestion-name">{user.name}</span>
              </div>
              
              <button className="follow-btn">Follow</button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
>>>>>>> WebSocket
