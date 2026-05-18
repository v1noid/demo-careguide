import { Router } from "express";
import { createPost, listPosts } from "../controllers/postController.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const postRouter = Router();

postRouter.get("/", asyncHandler(listPosts));
postRouter.post("/", authMiddleware, asyncHandler(createPost));
