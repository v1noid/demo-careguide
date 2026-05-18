import type { Request, Response } from "express";
import { Post } from "../models/Post.js";
import { badRequest } from "../utils/httpError.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const postResponse = (post: any) => ({
  id: post._id?.toString?.() ?? post.id,
  author: post.author,
  title: post.title,
  content: post.content,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

export const createPost = async (req: Request, res: Response) => {
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title || !content) {
    throw badRequest("Title and content are required");
  }

  const post = await Post.create({ author: req.user!._id, title, content });
  res.status(201).json({ post: postResponse(post) });
};

export const listPosts = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const [posts, total] = await Promise.all([
    Post.find().sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(),
  ]);

  res.json({
    data: posts.map(postResponse),
    pagination: paginationMeta(page, limit, total),
  });
};
