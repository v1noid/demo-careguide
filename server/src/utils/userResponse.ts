import type { IUser } from "../models/User.js";

export const userResponse = (user: IUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  interests: user.interests,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
