// src/types/index.ts

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

// src/types/index.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  nickname?: string;
}

export interface Group {
  id: string;
  creatorId: string;
  creator?: User;
  title: string;
  description: string;
  memberCount?: number;
  createdAt: string;
}

export type MemberRole = "CREATOR" | "MEMBER";

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  role: MemberRole;
  createdAt: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface GroupInvitation {
  id: string;
  groupId: string;
  inviterId: string;
  inviter?: User;
  userId: string;
  user?: User;
  status: InvitationStatus;
  createdAt: string;
}

export type JoinRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  status: JoinRequestStatus;
  createdAt: string;
}

export interface Event {
  id: string;
  groupId: string;
  creatorId: string;
  creator?: User;
  title: string;
  description: string;
  eventTime: string;
  createdAt: string;
  goingCount?: number;
  notGoingCount?: number;
  userRsvp?: RsvpStatus;
}

export type RsvpStatus = "GOING" | "NOT_GOING";

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  user?: User;
  status: RsvpStatus;
  createdAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}
