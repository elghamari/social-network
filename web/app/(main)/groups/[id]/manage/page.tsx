import "./page.css";

const MOCK_USERS = [
  {
    id: "u1",
    firstName: "Emma",
    lastName: "Wilson",
    initials: "EW",
    invited: false,
  },
  {
    id: "u2",
    firstName: "James",
    lastName: "Park",
    initials: "JP",
    invited: false,
  },
  {
    id: "u3",
    firstName: "Lily",
    lastName: "Chen",
    initials: "LC",
    invited: true,
  },
  {
    id: "u4",
    firstName: "Marcus",
    lastName: "Taylor",
    initials: "MT",
    invited: false,
  },
  {
    id: "u5",
    firstName: "Zara",
    lastName: "Ahmed",
    initials: "ZA",
    invited: true,
  },
  {
    id: "u6",
    firstName: "Noah",
    lastName: "Lee",
    initials: "NL",
    invited: false,
  },
  {
    id: "u7",
    firstName: "Sophia",
    lastName: "Chen",
    initials: "SC",
    invited: false,
  },
];

const MOCK_REQUESTS = [
  {
    id: "r1",
    firstName: "Daniel",
    lastName: "Kim",
    initials: "DK",
    requestedAt: "2h ago",
  },
  {
    id: "r2",
    firstName: "Olivia",
    lastName: "Stone",
    initials: "OS",
    requestedAt: "5h ago",
  },
  {
    id: "r3",
    firstName: "Ethan",
    lastName: "Brooks",
    initials: "EB",
    requestedAt: "1d ago",
  },
];

export default function ManagePage() {
  return (
    <div className={`gd-manage gd-manage--split`}>
      {/* Invite */}
      <section className="gd-manage__panel">
        <div className="gd-manage__panel-header">
          <h2 className="gd-manage__heading">Invite Users</h2>
          <p className="gd-manage__subtext">Send group invitations to users.</p>
        </div>

        <input
          className="gd-manage__search"
          type="text"
          placeholder="Filter by name..."
        />

        <div className="gd-manage__list">
          {MOCK_USERS.map((user) => (
            <div key={user.id} className="gd-manage__row">
              <div className="gd-avatar">{user.initials}</div>

              <div className="gd-manage__user">
                <span className="gd-manage__name">
                  {user.firstName} {user.lastName}
                </span>
              </div>

              {user.invited ? (
                <span className="gd-manage__status">Invited</span>
              ) : (
                <button className="gd-manage__invite-btn">Invite</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Requests — creator only */}
      {/* {IS_CREATOR && (
        <section className="gd-manage__panel">
          <div className="gd-manage__panel-header">
            <h2 className="gd-manage__heading">Join Requests</h2>
            <p className="gd-manage__subtext">
              Accept or decline pending requests.
            </p>
          </div>

          {MOCK_REQUESTS.length === 0 ? (
            <div className="gd-empty">No pending requests.</div>
          ) : (
            <div className="gd-manage__list">
              {MOCK_REQUESTS.map((req) => (
                <div key={req.id} className="gd-manage__row">
                  <div className="gd-avatar">{req.initials}</div>

                  <div className="gd-manage__user">
                    <span className="gd-manage__name">
                      {req.firstName} {req.lastName}
                    </span>
                    <span className="gd-manage__time">{req.requestedAt}</span>
                  </div>

                  <div className="gd-manage__actions">
                    <button className="gd-manage__accept">Accept</button>
                    <button className="gd-manage__decline">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section> */}
      {/* )} */}
    </div>
  );
}
