interface ProfileStatsProps {
  followersCount: number;
  followingCount: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export default function ProfileStats({
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
}: ProfileStatsProps) {
  return (
    <div className="profile-stats">
      <div
        className="profile-stat-box"
        onClick={onFollowersClick}
        style={{ cursor: onFollowersClick ? "pointer" : "default" }}
      >
        <span className="profile-stat-number">{followersCount}</span>
        <span className="profile-stat-label">Followers</span>
      </div>

      <div
        className="profile-stat-box"
        onClick={onFollowingClick}
        style={{ cursor: onFollowingClick ? "pointer" : "default" }}
      >
        <span className="profile-stat-number">{followingCount}</span>
        <span className="profile-stat-label">Following</span>
      </div>
    </div>
  );
}
