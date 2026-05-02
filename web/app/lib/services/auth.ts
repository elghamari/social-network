import { LoginInput, RegisterInput, LoginResponse, RegisterResponse } from "../types/auth";
import client from "./client";

export const authService = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    return await client.post("/login", data);
  },
  register: async (data: FormData): Promise<RegisterResponse> => {
    return await client.postForm("/register", data);
  },
  logout: async () => {
    return await client.post("/auth/logout", {});
  },
  getMe: async () => {
    return await client.get("/auth/me");
  },
};
