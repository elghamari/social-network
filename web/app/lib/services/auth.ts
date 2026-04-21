import { LoginInput, RegisterInput, LoginResponse, RegisterResponse } from "../types/auth";
import client from "./client";

export const authService = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    return await client.post("/login", data);
  },
  register: async (data: RegisterInput): Promise<RegisterResponse> => {
    return await client.post("/register", data);
  },
  logout: async () => {
    return await client.post("/logout", {});
  }
};