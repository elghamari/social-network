// lib/types/auth.ts

// ── Inputs ──

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nickname?: string;
  avatar?: string;
  about_me?: string;
}

// ── Field Errors ──

export type RegisterFieldErrors = {
  [K in keyof RegisterInput]?: string[];
};

export type LoginFieldErrors = {
  [K in keyof LoginInput]?: string[];
};

// ── Responses ──

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_public: boolean;
}

export interface BaseResponse {
  status: number;
  errors?: string;
}

export interface RegisterResponse extends BaseResponse {
  fields?: RegisterFieldErrors;
}

export interface LoginResponse extends BaseResponse {
  error?: LoginFieldErrors;
  user?: User;
}

export interface FollowerInfo {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  nickname: string;
  email: string;
  date_of_birth: string;
  about_me?: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  email: string;
  avatar: string;
  about_me: string;
  is_public: boolean;
  date_of_birth: string;
  follow_status: string;
  followers: FollowerInfo[];
  following: FollowerInfo[];
  pending_requests: FollowerInfo[];
}

export interface GetMeResponse {
  user: UserProfile;
}
