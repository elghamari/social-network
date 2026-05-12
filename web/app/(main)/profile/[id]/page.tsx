"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import client from "@/app/lib/services/_client";
import ProfileHeader from "@/app/ui/profile/ProfileHeader";
import ProfileStats from "@/app/ui/profile/ProfileStats";
import FollowModal from "@/app/ui/profile/FollowModal";
import { useAuth } from "@/app/_context/AuthContext";
import "../profile.css";
import PostList from "@/app/ui/feed/post-list";
import { GetProfilePosts } from "@/app/lib/services/feed";

export default function UserProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(
    null,
  );

  useEffect(() => {
    if (!profileId) return;

    if (currentUser && currentUser.id === profileId) {
      router.push("/profile");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await client.get(`/profile?profile_id=${profileId}`);
        if (res) {
          const profileData = res.user || res;

          if (profileData.follow_status === "owner") {
            router.push("/profile");
            return;
          }
          setProfile(profileData);
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

    try {
      if (
        profile.follow_status === "following" ||
        profile.follow_status === "pending"
      ) {
        const res = await client.delete(`/unfollow?target_id=${profileId}`);
        if (res) {
          console.log(res);

          setProfile((prev: any) => ({
            ...prev,
            follow_status: "none",
            followers: prev.followers?.filter(
              (f: any) => f.id !== currentUser?.id,
            ),
          }));
        }
      } else {
        const res = await client.post(`/follow?target_id=${profileId}`, {});
        if (res) {
          setProfile((prev: any) => {
            const newStatus = res.follow_status || "pending";
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
                },
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
            className={`profile-btn ${
              profile.follow_status === "none"
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
            <PostList
              fetchData={async (cursor) =>
                await GetProfilePosts(cursor, profileId)
              }
            />
          </div>
        </>
      ) : (
        <div className="profile-private">
          <div className="profile-private__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="48"
              height="48"
            >
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

      {modalType && (
        <FollowModal
          title={modalType === "followers" ? "Followers" : "Following"}
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          users={
            modalType === "followers" ? profile.followers : profile.following
          }
        />
      )}
    </div>
  );
}
