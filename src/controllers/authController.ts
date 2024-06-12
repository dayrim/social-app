import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users } from "../db";
import { eq } from "drizzle-orm";
import {
  SignupRequest,
  LoginRequest,
  ErrorResponse,
  SuccessResponse,
  LoginResponse,
} from "../types";

export const signup = async (
  req: Request<{}, {}, SignupRequest>,
  res: Response<SuccessResponse | ErrorResponse>
) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .execute();
    res.status(201).send({ message: "User created" });
  } catch (error) {
    res.status(500).send({ error: "Error creating user" });
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<LoginResponse | ErrorResponse>
) => {
  const { username, password } = req.body;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .execute()
      .then((results) => results[0]);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
      res.status(200).send({ token });
    } else {
      res.status(400).send({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).send({ error: "Error logging in" });
  }
};
