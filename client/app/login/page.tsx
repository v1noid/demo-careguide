"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";
import { apiRequest } from "../lib/api";
import { inputClass, primaryButtonClass, panelClass } from "../lib/styles";
import type { User } from "../lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { saveSession } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession(data.token, data.user);
      router.push("/notes");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <form onSubmit={submit} className={panelClass}>
        <h1 className="text-xl font-semibold">Login</h1>
        {message && <p className="text-sm font-medium text-red-300">{message}</p>}
        <input
          className={inputClass}
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <button className={primaryButtonClass}>Login</button>
      </form>
    </main>
  );
}
