export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}
