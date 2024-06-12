import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/authRoutes";
import { db, users } from "../src/db";
import { eq } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  afterAll(async () => {
    await db.delete(users).where(eq(users.username, "newuser")).execute();
  });

  test("POST /signup should create a new user", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ username: "newuser", password: "password" });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "User created");
  });

  test("POST /login should login a user", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "newuser", password: "password" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
