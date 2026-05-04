"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import client from "@/app/lib/services/_client";
import ProfileHeader from "@/app/ui/profile/ProfileHeader";
import ProfileStats from "@/app/ui/profile/ProfileStats";
import FollowModal from "@/app/ui/profile/FollowModal";
import { useAuth } from "@/app/_context/AuthContext";
import "../profile.css";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    if (!profileId) return;

    if (currentUser && currentUser.id === profileId) {
      router.push("/profile");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await client.get(`/profile?profile_id=${profileId}`);
        if (res.status === 200) {
          if (res.user.follow_status === "owner") {
            router.push("/profile");
            return;
          }
          setProfile(res.user);
        }
      } catch (err) {
        console.log("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, currentUser, router]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    console.log("profile---------------------------------------", profile);

    try {
      if (profile.follow_status === "following" || profile.follow_status === "pending") {
        const res = await client.delete(`/unfollow?target_id=${profileId}`);
        if (res.status === 200) {
          setProfile((prev: any) => ({
            ...prev,
            follow_status: "none",
            followers: prev.followers?.filter((f: any) => f.id !== currentUser?.id)
          }));
        }
      } else {
        const res = await client.post(`/follow?target_id=${profileId}`, {});
        if (res.status === 200) {
          setProfile((prev: any) => {
            const newStatus = res.follow_status;
            let updatedFollowers = prev.followers || [];


            if (newStatus === "following" && currentUser) {
              updatedFollowers = [
                ...updatedFollowers,
                {
                  id: currentUser.id,
                  first_name: currentUser.first_name,
                  last_name: currentUser.last_name,
                  avatar: currentUser.avatar,
                  nickname: currentUser.nickname,
                  about_me: currentUser.about_me,
                }
              ];
            }

            return {
              ...prev,
              follow_status: newStatus,
              followers: updatedFollowers,
            };
          });
        }
      }
    } catch (err) {
      console.log("Follow toggle error:", err);
    }
  };

  const handleAccept = async (reqId: string) => {
    try {
      const res = await client.post(`/follow/accept?target_id=${reqId}`, {});
      if (res.status === 200) {
        setProfile((prev: any) => {
          const accepted = prev.pending_requests?.find((r: any) => r.id === reqId);
          return {
            ...prev,
            pending_requests: prev.pending_requests?.filter((r: any) => r.id !== reqId),
            followers: accepted ? [...(prev.followers || []), accepted] : prev.followers,
          };
        });
      }
    } catch (err) {
      console.log("Accept error:", err);
    }
  };

  const handleDecline = async (reqId: string) => {
    try {
      const res = await client.post(`/follow/decline?target_id=${reqId}`, {});
      if (res.status === 200) {
        setProfile((prev: any) => ({
          ...prev,
          pending_requests: prev.pending_requests?.filter((r: any) => r.id !== reqId),
        }));
      }
    } catch (err) {
      console.log("Decline error:", err);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!profile) return <div className="profile-error">User not found.</div>;

  const canView =
    profile.is_public ||
    profile.follow_status === "following" ||
    profile.follow_status === "owner";

  const followBtnText =
    profile.follow_status === "following"
      ? "Unfollow"
      : profile.follow_status === "pending"
        ? "Requested"
        : "Follow";

  return (
    <div className="profile-page">
      <ProfileHeader
        firstName={profile.first_name}
        lastName={profile.last_name}
        nickname={profile.nickname}
        bio={profile.about_me}
        avatar={profile.avatar}
        email={profile.email}
        dateOfBirth={profile.date_of_birth}
      >
        {profile.follow_status !== "owner" && (
          <button
            className={`profile-btn ${profile.follow_status === "none"
                ? "profile-btn--follow"
                : "profile-btn--unfollow"
              }`}
            onClick={handleFollowToggle}
          >
            {followBtnText}
          </button>
        )}
      </ProfileHeader>

      {canView ? (
        <>
          <ProfileStats
            followersCount={profile.followers?.length || 0}
            followingCount={profile.following?.length || 0}
            onFollowersClick={() => setModalType("followers")}
            onFollowingClick={() => setModalType("following")}
          />

          <div className="profile-posts">
            <h2 className="profile-posts__title">Posts</h2>
            <div className="profile-posts__empty">No posts yet.</div>
          </div>
        </>
      ) : (
        <div className="profile-private">
          <div className="profile-private__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="profile-private__title">This account is private</p>
          <p className="profile-private__text">
            Follow this account to see their posts and activity.
          </p>
        </div>
      )}

      {/* Pending Requests */}
      {/* {profile.follow_status === "owner" && profile.pending_requests?.length > 0 && (
        <div className="profile-pending">
          <h3 className="profile-pending__title">
            Pending Requests ({profile.pending_requests.length})
          </h3>
          {profile.pending_requests.map((req: any) => {
            const reqId = req.id || req.ID;
            return (
              <div key={reqId} className="profile-pending__item">
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
                    onClick={() => handleAccept(reqId)}
                  >
                    Accept
                  </button>
                  <button
                    className="profile-pending__btn profile-pending__btn--decline"
                    onClick={() => handleDecline(reqId)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )} */}

      {modalType && (
        <FollowModal
          title={modalType === "followers" ? "Followers" : "Following"}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          users={modalType === "followers" ? profile.followers : profile.following}
        />
      )}
      {

      }
    </div>

  );
}