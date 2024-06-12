export interface SignupRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface FollowRequestParams {
  id: string;
}

export interface GetUserRequestParams {
  id: string;
}
export interface UnFollowRequestParams {
  id: string;
}

export interface GetUserResponse {
  username: string;
  followersCount: number;
}

export interface SuccessResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
}
