import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db, followers, users } from "../db";
import { and, eq, sql } from "drizzle-orm";
import {
  UpdatePasswordRequest,
  GetCurrentUserResponse,
  UpdatePasswordResponse,
  ErrorResponse,
  FollowRequestParams,
  SuccessResponse,
  GetUserResponse,
  UnFollowRequestParams,
} from "../types";

export const getCurrentUser = async (
  req: Request,
  res: Response<GetCurrentUserResponse | ErrorResponse>
) => {
  try {
    const id = req.user?.id;

    if (!id) {
      return res
        .status(400)
        .send({ error: "Invalid argument: id is required" });
    }
    const user = await db
      .select({
        username: users.username,
        followersCount: users.followersCount,
      })
      .from(users)
      .where(eq(users.id, id))
      .execute()
      .then((results) => results[0]);

    if (user) {
      const response: GetCurrentUserResponse = {
        username: user.username,
        followersCount: user.followersCount,
      };
      res.status(200).send(response);
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).send({ error: "Error fetching user data" });
  }
};

export const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordRequest>,
  res: Response<UpdatePasswordResponse | ErrorResponse>
) => {
  try {
    const id = req.user?.id;
    const { password } = req.body;

    if (!id) {
      return res
        .status(400)
        .send({ error: "Invalid argument: id is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .execute();

    res.status(200).send({ message: "Password updated" });
  } catch (error) {
    res.status(500).send({ error: "Error updating password" });
  }
};

export const followUser = async (
  req: Request<FollowRequestParams>,
  res: Response<SuccessResponse | ErrorResponse>
) => {
  const followingId = Number(req.params.id);
  const followerId = req.user?.id;

  if (!followerId) {
    return res
      .status(400)
      .send({ error: "Invalid argument: followerId is required" });
  }

  try {
    await db.insert(followers).values({ followerId, followingId }).execute();
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, followingId))
      .execute();
    res.status(200).send({ message: "User followed" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return res.status(400).send({ error: "User is already followed" });
    }
    res.status(500).send({ error: "Error following user" });
  }
};

export const unfollowUser = async (
  req: Request<UnFollowRequestParams>,
  res: Response<SuccessResponse | ErrorResponse>
) => {
  const followingId = parseInt(req.params.id, 10);
  const followerId = req.user?.id;

  if (!followerId) {
    return res
      .status(400)
      .send({ error: "Invalid argument: followerId is required" });
  }

  try {
    await db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      )
      .execute();
    await db
      .update(users)
      .set({
        followersCount: sql`${users.followersCount} - 1`,
      })
      .where(eq(users.id, followingId))
      .execute();
    res.status(200).send({ message: "User unfollowed" });
  } catch (error) {
    res.status(500).send({ error: "Error unfollowing user" });
  }
};

export const getUser = async (
  req: Request<FollowRequestParams>,
  res: Response<GetUserResponse | ErrorResponse>
) => {
  const { id } = req.params;

  try {
    const user = await db
      .select({
        username: users.username,
        followersCount: users.followersCount,
      })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .execute()
      .then((results) => results[0]);

    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).send({ error: "Error fetching user data" });
  }
};
