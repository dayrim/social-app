export interface User {
  id: number;
  username: string;
  password: string;
  followersCount: number;
}
export interface UpdatePasswordRequest {
  password: string;
}

export interface GetCurrentUserResponse {
  username: string;
  followersCount: number;
}

export interface UpdatePasswordResponse {
  message: string;
}
