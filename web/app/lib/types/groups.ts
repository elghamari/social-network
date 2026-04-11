export interface Group {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  creatorId: string;
  memberCount: number;
  isJoined?: boolean;
  isPending?: boolean;
  role?: "creator" | "member" | null;
}

export interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface FormData {
  title: string;
  description: string;
  // coverImage: string;
}

export interface FormErrors {
  title?: string;
  description?: string;
}

export type Tab = "discover" | "joined" | "pending";
