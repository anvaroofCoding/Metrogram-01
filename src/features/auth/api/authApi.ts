import { apiFetch } from "@/lib/api-client";
import type { AuthUser } from "@/features/auth/auth-session";

export interface LoginInput {
  phone: string;
  password: string;
}

export async function loginRequest(input: LoginInput): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
