import request from "supertest";
import express from "express";
import userRoutes from "../src/routes/userRoutes";
import { db, users, followers } from "../src/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { User } from "../src/types";

const app = express();
app.use(express.json());
app.use("/users", userRoutes);

describe("User Routes", () => {
  let user1Token: string;
  let user2Token: string;
  let user1: User;
  let user2: User;

  beforeAll(async () => {
    // Insert initial data
    await db
      .insert(users)
      .values([
        {
          username: "testuser1",
          password: await bcrypt.hash("password1", 10),
          followersCount: 0,
        },
        {
          username: "testuser2",
          password: await bcrypt.hash("password2", 10),
          followersCount: 0,
        },
      ])
      .execute();

    user1 = await db
      .select()
      .from(users)
      .where(eq(users.username, "testuser1"))
      .execute()
      .then((results) => results[0]);

    user2 = await db
      .select()
      .from(users)
      .where(eq(users.username, "testuser2"))
      .execute()
      .then((results) => results[0]);

    user1Token = jwt.sign(
      { id: user1.id, username: user1.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    user2Token = jwt.sign(
      { id: user2.id, username: user2.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await db.delete(followers).execute();
    await db.delete(users).where(eq(users.id, user1.id)).execute();
    await db.delete(users).where(eq(users.id, user2.id)).execute();
  });

  test("GET /me should return current user", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${user1Token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username", "testuser1");
  });

  test("POST /user/:id/follow should follow user", async () => {
    let response = await request(app)
      .post(`/users/user/${user2.id}/follow`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "User followed");

    const user2Details = await db
      .select()
      .from(users)
      .where(eq(users.id, user2.id))
      .execute()
      .then((results) => results[0]);

    expect(user2Details.followersCount).toBe(1);

    // Attempt to follow the same user again
    response = await request(app)
      .post(`/users/user/${user2.id}/follow`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(response.status).toBe(400);
  });

  test("POST /user/:id/unfollow should unfollow user", async () => {
    const response = await request(app)
      .post(`/users/user/${user2.id}/unfollow`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "User unfollowed");

    // Verify that user2 has no followers
    const user2Details = await db
      .select()
      .from(users)
      .where(eq(users.id, user2.id))
      .execute()
      .then((results) => results[0]);

    expect(user2Details.followersCount).toBe(0);
  });

  test("PUT /me/update-password should update password", async () => {
    const response = await request(app)
      .put("/users/me/update-password")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ password: "newpassword" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Password updated");
  });
});
