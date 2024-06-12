import { Request as ExpressRequest } from "express";

declare module "express" {
  export interface Request extends ExpressRequest {
    user?: {
      id: number;
      username: string;
    };
  }
}

export interface ErrorResponse {
  error: string;
}

export * from "./user";
export * from "./auth";
