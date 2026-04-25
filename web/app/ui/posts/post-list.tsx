"use client";
import { PostType } from "@/app/lib/types/feed";
import PostCard from "./post-card";
import "./posts.css";

const mockPosts: PostType[] = [
  {
    id: "1",
    author: {
      name: "Ayoub Outrgua",
      username: "@aoutrgua",
      initials: "AO",
    },
    timeAgo: "2 hours ago",
    privacy: "public",
    title: "Just finished the Real-time Forum project! 🚀",
    description: "It was an amazing journey building this SPA. Using Go for the backend and WebSockets for the live chat alongside Vanilla JS for the frontend DOM manipulation really pushed the performance to the next level. Clean code and layered architecture paid off!",
    likesCount: 124,
    commentsCount: 32,
  },
  {
    id: "2",
    author: {
      name: "Mohamed Elghamari",
      username: "@melghama",
      initials: "ME",
    },
    timeAgo: "5 hours ago",
    privacy: "almost private",
    title: "Optimizing the Lem-in pathfinding algorithm 🐜",
    description: "Graph theory algorithms can get really tricky, especially when managing multiple ants simultaneously. We managed to optimize our Go implementation to find the optimal paths in record time.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    likesCount: 89,
    commentsCount: 15,
  },
  {
    id: "3",
    author: {
      name: "Abdelkafy Bourazza",
      username: "@abourazza",
      initials: "AB",
    },
    timeAgo: "1 day ago",
    privacy: "private",
    title: "Net-Cat: Terminal-based chat application",
    description: "TCP sockets and Goroutines are a match made in heaven. Testing the new server architecture to handle multiple concurrent client connections.",
    likesCount: 45,
    commentsCount: 8,
  }
];

export default function PostList() {
  return (
    <div className="post-list-container">
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}