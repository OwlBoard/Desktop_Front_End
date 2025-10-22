// src/types/AuthResponse.ts

export interface AuthResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
  id?: number;
  user_id?: number;
  name?: string;
  username?: string;
  user?: {
    id?: number;
    name?: string;
    username?: string;
  };
  data?: {
    token?: string;
    access_token?: string;
    jwt?: string;
    user_id?: number;
  };
  message?: string;
  detail?: string;
}

export interface ProfileResponse {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
}
