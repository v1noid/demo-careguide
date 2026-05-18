import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  groupedByInterests,
  listUsers,
  updateUser,
  userPosts,
} from "../controllers/userController.js";
import { requireAdmin, authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRouter = Router();

userRouter.get("/:id/posts", asyncHandler(userPosts));

userRouter.use(authMiddleware, requireAdmin);
userRouter.get("/grouped-by-interests", asyncHandler(groupedByInterests));
userRouter.get("/", asyncHandler(listUsers));
userRouter.post("/", asyncHandler(createUser));
userRouter.get("/:id", asyncHandler(getUser));
userRouter.patch("/:id", asyncHandler(updateUser));
userRouter.delete("/:id", asyncHandler(deleteUser));
