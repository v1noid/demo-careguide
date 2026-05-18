import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.js";

interface JwtPayload {
  sub: string;
}

export const signToken = (user: IUser) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign({ sub: user.id } satisfies JwtPayload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.verify(token, secret) as JwtPayload;
};
