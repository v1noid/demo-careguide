import Link from "next/link";

const cards = [
  { href: "/login", title: "Login", body: "Sign in with an existing JWT-backed account." },
  { href: "/register", title: "Register", body: "Create a normal user with interests." },
  { href: "/notes", title: "Notes", body: "Create, update, delete, and list only your own notes." },
  { href: "/posts", title: "Posts", body: "Create public posts and retrieve posts for a user via lookup." },
  { href: "/admin", title: "Admin Management", body: "Manage users and view everyone's notes." },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold">Secure Notes API Console</h1>
        <p className="text-sm text-slate-400">
          Minimal frontend pages for testing the Express, JWT, RBAC, notes, posts, and aggregation APIs.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col gap-2 border border-slate-800 bg-slate-900 p-4"
          >
            <span className="text-lg font-semibold">{card.title}</span>
            <span className="text-sm text-slate-400">{card.body}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
