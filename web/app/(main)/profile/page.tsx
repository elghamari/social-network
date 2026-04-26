"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "@/app/ui/profile/ProfileHeader";
import ProfileStats from "@/app/ui/profile/ProfileStats";
import FollowModal from "@/app/ui/profile/FollowModal";
import "./profile.css";

export default function ProfilePage() {
  const { user } = useAuth();

  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">

      <ProfileHeader
        firstName={user.first_name}
        lastName={user.last_name}
        nickname={user.nickname}
        bio={user.about_me}
        avatar={user.avatar}
      >
        <button className="profile-btn profile-btn--edit">
          Edit Profile
        </button>
      </ProfileHeader>

      <ProfileStats
        followersCount={user.followers?.length || 0}
        followingCount={user.following?.length || 0}
        onFollowersClick={() => setModalType("followers")}
        onFollowingClick={() => setModalType("following")}
      />

      {user.pending_requests?.length > 0 && (
        <div className="profile-pending">
          <h3 className="profile-pending__title">
            Pending Requests ({user.pending_requests.length})
          </h3>
          {user.pending_requests.map((req: any) => (
            <PendingRequestItem key={req.id || req.ID} req={req} />
          ))}
        </div>
      )}

      <div className="profile-posts">
        <h2 className="profile-posts__title">My Posts</h2>
        <div className="profile-posts__empty">No posts yet.</div>
      </div>

      {modalType && (
        <FollowModal
          title={modalType === "followers" ? "Followers" : "Following"}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          users={modalType === "followers" ? user.followers : user.following}
        />
      )}
    </div>
  );
}

function PendingRequestItem({ req }: { req: any }) {
  return (
    <div className="profile-pending__item">
      <div className="profile-pending__user">
        <div className="profile-pending__avatar">
          {req.avatar ? (
            <img src={req.avatar} alt="avatar" />
          ) : (
            (req.first_name)?.[0]
          )}
        </div>
        <span className="profile-pending__name">
          {req.first_name } {req.last_name }
        </span>
      </div>
    </div>
  );
}
