import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  followersCount: integer("followersCount").default(0).notNull(),
});

export const followers = pgTable(
  "followers",
  {
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    };
  }
);
