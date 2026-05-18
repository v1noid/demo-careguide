import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import type { Request, Response } from "express";
import { User, type UserRole } from "../models/User.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { userResponse } from "../utils/userResponse.js";

const parseInterests = (value: unknown) =>
  Array.isArray(value)
    ? value.map((interest) => String(interest).trim()).filter(Boolean)
    : [];

const parseRole = (value: unknown): UserRole =>
  value === "admin" ? "admin" : "user";

export const listUsers = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);

  const [users, total] = await Promise.all([
    User.find().sort({ email: 1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    data: users.map(userResponse),
    pagination: paginationMeta(page, limit, total),
  });
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    throw badRequest("Name, email, and password are required");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: parseRole(req.body.role),
    interests: parseInterests(req.body.interests),
  });

  res.status(201).json({ user: userResponse(user) });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw notFound("User not found");
  }

  res.json({ user: userResponse(user) });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw notFound("User not found");
  }

  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (req.body.role !== undefined) user.role = parseRole(req.body.role);
  if (req.body.interests !== undefined)
    user.interests = parseInterests(req.body.interests);
  if (password !== undefined && password.length > 0) {
    user.passwordHash = await bcrypt.hash(password, 12);
  }

  await user.save();
  res.json({ user: userResponse(user) });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (id === req.user!.id) {
    throw forbidden("Admins cannot delete their own account");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw notFound("User not found");
  }

  res.status(204).send();
};

export const groupedByInterests = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);

  const [result] = await User.aggregate([
    { $unwind: "$interests" },
    {
      $group: {
        _id: "$interests",
        users: {
          $push: {
            id: "$_id",
            name: "$name",
            email: "$email",
            role: "$role",
          },
        },
        userCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const total = result?.total?.[0]?.count ?? 0;
  res.json({
    data: (result?.data ?? []).map((group: any) => ({
      interest: group._id,
      userCount: group.userCount,
      users: group.users,
    })),
    pagination: paginationMeta(page, limit, total),
  });
};

export const userPosts = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (!Types.ObjectId.isValid(id)) {
    throw badRequest("Invalid user id");
  }

  const { page, limit, skip } = getPagination(req);
  const userId = new Types.ObjectId(id);

  const [result] = await User.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: "posts",
        let: { userId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$author", "$$userId"] } } },
          { $sort: { _id: -1 } },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              total: [{ $count: "count" }],
            },
          },
        ],
        as: "postsResult",
      },
    },
    {
      $set: {
        postsBundle: {
          $ifNull: [
            { $arrayElemAt: ["$postsResult", 0] },
            { data: [], total: [] },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        user: {
          id: "$_id",
          name: "$name",
          email: "$email",
          role: "$role",
          interests: "$interests",
        },
        posts: "$postsBundle.data",
        totalCount: {
          $ifNull: [{ $arrayElemAt: ["$postsBundle.total.count", 0] }, 0],
        },
      },
    },
  ]);

  if (!result) {
    throw notFound("User not found");
  }

  res.json({
    user: result.user,
    data: result.posts,
    pagination: paginationMeta(page, limit, result.totalCount ?? 0),
  });
};
