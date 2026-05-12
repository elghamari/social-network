// ===== Groups
export type GroupTab = "discover" | "joined" | "requests" | "invitations";

export type GroupRole =
  | "creator"
  | "member"
  | "pending_request"
  | "pending_invitation"
  | "none";

export type Group = {
  id: string;
  title: string;
  description: string;
  coverPath?: string;
  createdAt: string;
  creatorId: string;
  memberCount: number;
  role: GroupRole;
};

// ===== Group Create form
export type GroupFormInput = {
  title: string;
  description: string;
  coverImage?: File | null;
};

export type GroupFormErrors = {
  title?: string[];
  description?: string[];
  coverImage?: string[];
};

// ===== Group Details
export type GroupSection = "posts" | "events" | "chat" | "invite";

// ===== Group Manage
export type InvitableUser = {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  avatarPath?: string;
  isInvited: boolean;
};

export type JoinRequestUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarPath?: string;
};

// Group Event
export type EventResponse = "GOING" | "NOT_GOING" | null;

export type EventFormInput = {
  title: string;
  description: string;
  date: string;
};

export type EventFormErrors = {
  title?: string;
  description?: string;
  date?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  response: EventResponse;
  goingCnt: number;
  notGoingCnt: number;
};
