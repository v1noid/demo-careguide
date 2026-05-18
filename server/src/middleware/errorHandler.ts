import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  if (typeof error === "object" && error && "code" in error && error.code === 11000) {
    res.status(409).json({ message: "Duplicate value" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
