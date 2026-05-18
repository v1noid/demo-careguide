import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { forbidden, HttpError, unauthorized } from "../utils/httpError.js";
import { verifyToken } from "../utils/auth.js";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.header("Authorization");
    const [scheme, token] = header?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw unauthorized();
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw unauthorized("Invalid authentication token");
    }

    req.user = user;
    next();
  } catch (error) {
    next(
      error instanceof HttpError
        ? error
        : unauthorized("Invalid authentication token"),
    );
  }
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "admin") {
    next(forbidden("Admin access required"));
    return;
  }

  next();
};
