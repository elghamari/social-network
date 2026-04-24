export default function InviteList() {

    

    return (
      <section className="gd-manage__panel">
        <div className="gd-manage__panel-header">
          <h2 className="gd-manage__heading">Invite Users</h2>
          <p className="gd-manage__subtext">
            Send group invitations to users.
          </p>
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
                <span className="gd-manage__sent">Invited</span>
              ) : (
                <button className="gd-manage__invite-btn">Invite</button>
              )}
            </div>
          ))}
        </div>
      </section>)
}