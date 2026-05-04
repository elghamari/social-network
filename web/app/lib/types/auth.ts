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
  error?: string;
}

export interface RegisterResponse extends BaseResponse {
  fields?: RegisterFieldErrors;
}

export interface LoginResponse extends BaseResponse {
  errors?: LoginFieldErrors;
  user?: User;
}
