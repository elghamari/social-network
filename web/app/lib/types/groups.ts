export type Tab = "discover" | "joined" | "pending";

export type Group = {
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
};

export type GroupData = {
  title: string;
  description: string;
};

export type GroupErrors = {
  title?: string;
  description?: string;
  general?: string;
};

export type State = {
  success: boolean;
  errors?: GroupErrors;
  values?: GroupData;
};
