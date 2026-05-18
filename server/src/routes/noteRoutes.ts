import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "../controllers/noteController.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const noteRouter = Router();

noteRouter.use(authMiddleware);
noteRouter.get("/", asyncHandler(listNotes));
noteRouter.post("/", asyncHandler(createNote));
noteRouter.get("/:id", asyncHandler(getNote));
noteRouter.patch("/:id", asyncHandler(updateNote));
noteRouter.delete("/:id", asyncHandler(deleteNote));
