import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { badRequest, unauthorized } from "../utils/httpError.js";
import { signToken } from "../utils/auth.js";
import { userResponse } from "../utils/userResponse.js";

const parseInterests = (value: unknown) =>
  Array.isArray(value)
    ? value.map((interest) => String(interest).trim()).filter(Boolean)
    : [];

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    interests?: string[];
  };

  if (!name || !email || !password) {
    throw badRequest("Name, email, and password are required");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
    interests: parseInterests(req.body.interests),
  });

  res.status(201).json({ token: signToken(user), user: userResponse(user) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw badRequest("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized("Invalid email or password");
  }

  res.json({ token: signToken(user), user: userResponse(user) });
};

export const me = async (req: Request, res: Response) => {
  res.json({ user: userResponse(req.user!) });
};
