"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSession } from "../hooks/useSession";
import { apiRequest } from "../lib/api";
import {
  dangerButtonClass,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../lib/styles";
import type { ListResponse, Note } from "../lib/types";

export default function NotesPage() {
  const { token, currentUser, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState({ title: "", content: "", editingId: "" });
  const [message, setMessage] = useState("");

  const loadNotes = async () => {
    setMessage("");
    try {
      const data = await apiRequest<ListResponse<Note>>("/notes?page=1&limit=20", {}, token);
      setNotes(data.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load notes");
    }
  };

  const saveNote = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      await apiRequest(form.editingId ? `/notes/${form.editingId}` : "/notes", {
        method: form.editingId ? "PATCH" : "POST",
        body: JSON.stringify({ title: form.title, content: form.content }),
      }, token);
      setForm({ title: "", content: "", editingId: "" });
      await loadNotes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save note");
    }
  };

  const deleteNote = async (id: string) => {
    setMessage("");
    try {
      await apiRequest(`/notes/${id}`, { method: "DELETE" }, token);
      await loadNotes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete note");
    }
  };

  if (status === "loading") {
    return <main className="p-6 text-sm text-slate-400">Loading session...</main>;
  }

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <section className={panelClass}>
          <h1 className="text-xl font-semibold">Notes</h1>
          <p className="text-sm text-slate-400">Login to manage your notes.</p>
          <Link className={secondaryButtonClass} href="/login">Go to login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-6 lg:grid-cols-2">
      <form onSubmit={saveNote} className={panelClass}>
        <h1 className="text-xl font-semibold">{form.editingId ? "Update Note" : "Create Note"}</h1>
        <p className="text-sm text-slate-400">Users and admins can create, update, delete, and list their own notes here.</p>
        {message && <p className="text-sm font-medium text-red-300">{message}</p>}
        <input
          className={inputClass}
          placeholder="Title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <textarea
          className={inputClass}
          placeholder="Content"
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
        />
        <div className="flex flex-wrap gap-2">
          <button className={primaryButtonClass}>{form.editingId ? "Save Note" : "Create Note"}</button>
          <button type="button" className={secondaryButtonClass} onClick={loadNotes}>
            Load My Notes
          </button>
        </div>
      </form>

      <section className={panelClass}>
        <h2 className="text-lg font-semibold">My Notes</h2>
        {notes.map((note) => (
          <div key={note.id} className="border-t border-slate-800 pt-3">
            <p className="font-medium">{note.title}</p>
            <p className="text-sm text-slate-300">{note.content}</p>
            <div className="mt-2 flex gap-2">
              <button
                className={secondaryButtonClass}
                onClick={() => setForm({ title: note.title, content: note.content, editingId: note.id })}
                type="button"
              >
                Edit
              </button>
              <button className={dangerButtonClass} onClick={() => deleteNote(note.id)} type="button">
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
