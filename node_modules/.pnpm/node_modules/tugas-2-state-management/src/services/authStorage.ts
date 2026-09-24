import type { LoginPayload, UserProfile } from "@/types/auth";

const AUTH_TOKEN_KEY = "token";
const LEGACY_AUTH_TOKEN_KEY = "app_auth_token";
const AUTH_USER_KEY = "app_auth_user";

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    user.role === "admin"
  );
}

function readUser(): UserProfile | null {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(rawUser);
    if (isUserProfile(parsedUser)) {
      return parsedUser;
    }
  } catch {}

  localStorage.removeItem(AUTH_USER_KEY);
  return null;
}

export const authStorage = {
  validateCredentials(payload: LoginPayload): UserProfile {
    const email = payload.email.trim().toLowerCase();
    const isValidAdmin =
      (email === "admin@example.com" || email === "admin") && payload.password === "admin123";

    if (!isValidAdmin) {
      throw new Error("Invalid email or password. Use admin / admin123.");
    }

    return {
      id: "admin-01",
      name: "System Admin",
      email: "admin@example.com",
      role: "admin",
    };
  },

  getSession(): { token: string | null; user: UserProfile | null } {
    return {
      token: localStorage.getItem(AUTH_TOKEN_KEY),
      user: readUser(),
    };
  },

  setSession(token: string, user: UserProfile): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
