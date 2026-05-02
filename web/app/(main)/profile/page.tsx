"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "@/app/ui/profile/ProfileHeader";
import ProfileStats from "@/app/ui/profile/ProfileStats";
import FollowModal from "@/app/ui/profile/FollowModal";
import client from "@/app/lib/services/_client";
import "./profile.css";
import EditProfileModal from "@/app/ui/profile/EditProfileModal";

export default function ProfilePage() {
  const { user } = useAuth();
  console.log(user);
  

  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(user?.is_public ?? true);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false)
  useEffect(() => {
    if (user && user.is_public !== undefined) {
      setIsPublic(user.is_public);
    }
  }, [user]);

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  const handleEditingProfile = () => {
    setIsEditingProfile(!isEditingProfile)
  }
  const handlePrivacyToggle = async () => {
    const newStatus = !isPublic;
    setIsPublic(newStatus);
    try {
      const res = await client.put('/profile/privacy', { is_public: newStatus });
      if (res.status !== 200) {
        setIsPublic(!newStatus);
      }
    } catch (err) {
      console.log("Privacy toggle error:", err);
      setIsPublic(!newStatus);
    }
  };
  const handleAccept = async (reqId: string) => {
    try {
      const res = await client.post(`/follow/accept?target_id=${reqId}`, {});
      if (res.status === 200) {
        window.location.reload(); 
      }
    } catch (err) {
      console.log("Accept error:", err);
    }
  };

  const handleDecline = async (reqId: string) => {
    try {
      const res = await client.post(`/follow/decline?target_id=${reqId}`, {});
      if (res.status === 200) {
        window.location.reload();
      }
    } catch (err) {
      console.log("Decline error:", err);
    }
  };
  return (
    <div className="profile-page">
      <ProfileHeader
        firstName={user.first_name}
        lastName={user.last_name}
        nickname={user.nickname}
        bio={user.about_me}
        avatar={user.avatar}
        email={user.email}
        dateOfBirth={user.date_of_birth}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

          {isEditingProfile && (
            <EditProfileModal
              user={user}
              onClose={() => setIsEditingProfile(false)}
              isPublic={isPublic}
              onPrivacyToggle={handlePrivacyToggle}
            />
          )}
          <button className="profile-btn profile-btn--edit" onClick={handleEditingProfile}>
            Edit Profile
          </button>

        </div>
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
            <PendingRequestItem 
              key={req.id || req.ID} 
              req={req} 
              onAccept={() => handleAccept(req.id || req.ID)}
              onDecline={() => handleDecline(req.id || req.ID)}
            />
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

function PendingRequestItem({ req, onAccept, onDecline }: { req: any, onAccept: () => void, onDecline: () => void }) {
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
          {req.first_name} {req.last_name}
        </span>
      </div>
      
      <div className="profile-pending__actions">
        <button
          className="profile-pending__btn profile-pending__btn--accept"
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          className="profile-pending__btn profile-pending__btn--decline"
          onClick={onDecline}
        >
          Decline
        </button>
      </div>
    </div>
  );
}