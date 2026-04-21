export type Tab = "discover" | "joined" | "pending";

export type Group = {
  id: string;
  title: string;
  description: string;
  coverPath?: string;
  createdAt: string;
  creatorId: string;
  memberCount: number;
  role: string;
};

// ── Detail page ──────────────────────────────────────────────
export type GroupRole = "CREATOR" | "MEMBER";

export type GroupMember = {
  id: string;
  name: string;
  avatarUrl?: string;
  role: "CREATOR" | "MEMBER";
  joinedAt: string;
};

export type GroupPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
};

export type RSVPStatus = "going" | "not-going" | null;

export type GroupEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendeesCount: number;
  rsvp: RSVPStatus;
};

export type GroupSection = "about" | "posts" | "members" | "events";

// ── Form / action types ──────────────────────────────────────
export type GroupData = {
  title: string;
  description: string;
  coverImage?: File | null;
};

export type GroupErrors = {
  title?: string;
  description?: string;
  coverImage?: string;
};

export type GroupState = {
  success: boolean;
  errors?: GroupErrors;
  values?: GroupData;
};

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}
