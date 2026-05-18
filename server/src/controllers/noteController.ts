import type { Request, Response } from "express";
import { Note } from "../models/Note.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const noteResponse = (note: any) => ({
  id: note._id?.toString?.() ?? note.id,
  owner: note.owner,
  title: note.title,
  content: note.content,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const canViewNote = (req: Request, owner: unknown) =>
  req.user?.role === "admin" || String(owner) === req.user?.id;

const ownsNote = (req: Request, owner: unknown) =>
  String(owner) === req.user?.id;

export const listNotes = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const adminAll = req.user?.role === "admin" && req.query.scope === "all";
  const filter = adminAll ? {} : { owner: req.user!._id };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    Note.countDocuments(filter),
  ]);

  res.json({
    data: notes.map(noteResponse),
    pagination: paginationMeta(page, limit, total),
  });
};

export const createNote = async (req: Request, res: Response) => {
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title || !content) {
    throw badRequest("Title and content are required");
  }

  const note = await Note.create({ owner: req.user!._id, title, content });
  res.status(201).json({ note: noteResponse(note) });
};

export const getNote = async (req: Request, res: Response) => {
  const note = await Note.findById(req.params.id).lean();
  if (!note) {
    throw notFound("Note not found");
  }

  if (!canViewNote(req, note.owner)) {
    throw forbidden();
  }

  res.json({ note: noteResponse(note) });
};

export const updateNote = async (req: Request, res: Response) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    throw notFound("Note not found");
  }

  if (!ownsNote(req, note.owner)) {
    throw forbidden("Only the note owner can update this note");
  }

  const { title, content } = req.body as { title?: string; content?: string };
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;

  await note.save();
  res.json({ note: noteResponse(note) });
};

export const deleteNote = async (req: Request, res: Response) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    throw notFound("Note not found");
  }

  if (!ownsNote(req, note.owner)) {
    throw forbidden("Only the note owner can delete this note");
  }

  await note.deleteOne();
  res.status(204).send();
};
