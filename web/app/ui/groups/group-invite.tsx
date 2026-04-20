export default function GroupInvite({ groupId }: { groupId: string }) {
  return (
    <div className="gp-section">
      <div className="gp-section__header">
        <h2 className="gp-section__title">Invite People</h2>
      </div>

      <div className="gp-section__body">
        <input
          className="gp-invite-input"
          type="text"
          placeholder="Search users to invite..."
        />
        <p className="gp-invite-hint">
          Any group member can invite others to join.
        </p>
      </div>
    </div>
  );
}
