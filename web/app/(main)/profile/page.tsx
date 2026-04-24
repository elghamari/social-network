"use client";
import { useAuth } from "@/app/context/AuthContext";
// import ProfileHeader from "@/ui/profile/ProfileHeader";
// import ProfileStats from "@/ui/profile/ProfileStats";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
     
      
      {/* تجربة بسيطة باش نتأكدوا بلي الداتا دازت */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h1 className="text-2xl font-bold">{user.FirstName} {user.LastName}</h1>
        <p className="text-gray-400">@{user.Nickname || "User"}</p>
      </div>

      {/* هنا غنزيدو الـ Posts من بعد */}
      <div className="mt-8">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-2">My Posts</h2>
        <p className="mt-4 text-gray-400">No posts yet.</p>
      </div>
    </div>
  );
}