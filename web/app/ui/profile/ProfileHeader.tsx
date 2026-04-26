
interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  nickname?: string;
  bio?: string;
  avatar?: string;
  children?: React.ReactNode; 
}

export default function ProfileHeader({
  firstName,
  lastName,
  nickname,
  bio,
  avatar,
  children,
}: ProfileHeaderProps) {
  return (
    <div className="profile-header">
      <div className="profile-cover" />

      <div className="profile-info">
        <div className="profile-avatar-wrapper">
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {firstName?.[0]}
              {lastName?.[0]}
            </div>
          )}
        </div>

        <div className="profile-user-details">
          <h1 className="profile-name">
            {firstName} {lastName}
          </h1>
          {nickname && (
            <span className="profile-nickname">@{nickname}</span>
          )}
          {bio && <p className="profile-bio">{bio}</p>}
        </div>

        {children && <div className="profile-actions">{children}</div>}
      </div>
    </div>
  );
}
