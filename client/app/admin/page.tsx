"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSession } from "../hooks/useSession";
import { apiRequest } from "../lib/api";
import { interestsArray } from "../lib/forms";
import {
  dangerButtonClass,
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../lib/styles";
import type { InterestGroup, ListResponse, Note, User } from "../lib/types";

export default function AdminPage() {
  const { token, isAdmin, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<InterestGroup[]>([]);
  const [openGroup, setOpenGroup] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "user",
    interests: "",
  });

  const loadUsers = async () => {
    setMessage("");
    try {
      const data = await apiRequest<ListResponse<User>>("/users?page=1&limit=30", {}, token);
      setUsers(data.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load users");
    }
  };

  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      await apiRequest(form.id ? `/users/${form.id}` : "/users", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          role: form.role,
          interests: interestsArray(form.interests),
        }),
      }, token);
      setForm({ id: "", name: "", email: "", password: "", role: "user", interests: "" });
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save user");
    }
  };

  const editUser = (user: User) => {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      interests: user.interests.join(", "),
    });
  };

  const deleteUser = async (id: string) => {
    setMessage("");
    try {
      await apiRequest(`/users/${id}`, { method: "DELETE" }, token);
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete user");
    }
  };

  const loadAllNotes = async () => {
    setMessage("");
    try {
      const data = await apiRequest<ListResponse<Note>>("/notes?scope=all&page=1&limit=20", {}, token);
      setAllNotes(data.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load all notes");
    }
  };

  const loadGroups = async () => {
    setMessage("");
    try {
      const data = await apiRequest<ListResponse<InterestGroup>>("/users/grouped-by-interests?page=1&limit=30", {}, token);
      setGroups(data.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load groups");
    }
  };

  if (status === "loading") {
    return <main className="p-6 text-sm text-slate-400">Loading session...</main>;
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <section className={panelClass}>
          <h1 className="text-xl font-semibold">Admin Management</h1>
          <p className="text-sm text-slate-400">Login with an admin account to access this page.</p>
          <Link className={secondaryButtonClass} href="/login">Go to login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-6 lg:grid-cols-2">
      <form onSubmit={saveUser} className={panelClass}>
        <h1 className="text-xl font-semibold">Admin User Management</h1>
        {message && <p className="text-sm font-medium text-red-300">{message}</p>}
        <input className={inputClass} placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className={inputClass} placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input className={inputClass} placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <select className={inputClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <input className={inputClass} placeholder="Interests comma separated" value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} />
        <div className="flex flex-wrap gap-2">
          <button className={primaryButtonClass}>{form.id ? "Update User" : "Create User"}</button>
          <button type="button" className={secondaryButtonClass} onClick={loadUsers}>Load Users</button>
        </div>
        {users.map((user) => (
          <div key={user.id} className="border-t border-slate-800 pt-2 text-sm">
            <p>{user.name} · {user.email} · {user.role} · {user.id}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => editUser(user)}>Edit</button>
              <button type="button" className={dangerButtonClass} onClick={() => deleteUser(user.id)}>Delete</button>
            </div>
          </div>
        ))}
      </form>

      <section className={panelClass}>
        <h2 className="text-lg font-semibold">Admin Views</h2>
        <p className="text-sm text-slate-400">
          Admins manage users and can view everyone&apos;s notes. Note updates and deletes stay on the Notes page for each note owner.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButtonClass} onClick={loadAllNotes} type="button">
            Load Everyone&apos;s Notes
          </button>
          <button className={secondaryButtonClass} onClick={loadGroups} type="button">
            Group Users By Interests
          </button>
        </div>
        <div>
          <h3 className="font-medium">All Notes</h3>
          {allNotes.map((note) => (
            <div key={note.id} className="border-t border-slate-800 py-2 text-sm">
              <p className="font-medium">{note.title}</p>
              <p className="text-slate-300">{note.content}</p>
              <p className="text-xs text-slate-500">Owner: {note.owner}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-medium">Interest Groups</h3>
          {groups.map((group) => (
            <div key={group.interest} className="border-t border-slate-800 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p>{group.interest}: {group.userCount} user(s)</p>
                <button
                  className={secondaryButtonClass}
                  onClick={() => setOpenGroup(openGroup === group.interest ? "" : group.interest)}
                  type="button"
                >
                  {openGroup === group.interest ? "Hide Users" : "Show Users"}
                </button>
              </div>
              {openGroup === group.interest && (
                <p className="mt-2 text-slate-300">
                  {group.users.map((user) => user.name).join(", ") || "No users"}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
