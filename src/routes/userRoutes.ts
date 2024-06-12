import { Router } from "express";
import {
  followUser,
  getCurrentUser,
  unfollowUser,
  updatePassword,
  getUser,
} from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import {
  FollowRequestParams,
  GetUserRequestParams,
  UnFollowRequestParams,
} from "types";

const router = Router();

router.get("/me", authenticate<{}>, getCurrentUser);
router.put("/me/update-password", authenticate<{}>, updatePassword);
router.get("/user/:id", authenticate<GetUserRequestParams>, getUser);
router.post("/user/:id/follow", authenticate<FollowRequestParams>, followUser);
router.post(
  "/user/:id/unfollow",
  authenticate<UnFollowRequestParams>,
  unfollowUser
);

export default router;
