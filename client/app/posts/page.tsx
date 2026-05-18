"use client";

import { FormEvent, useState } from "react";
import { useSession } from "../hooks/useSession";
import { apiRequest } from "../lib/api";
import { inputClass, panelClass, primaryButtonClass, secondaryButtonClass } from "../lib/styles";
import type { ListResponse, Post } from "../lib/types";

export default function PostsPage() {
  const { token, currentUser } = useSession();
  const [postForm, setPostForm] = useState({ title: "", content: "" });
  const [lookupUserId, setLookupUserId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [lookupPosts, setLookupPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");

  const loadPosts = async () => {
    setMessage("");
    try {
      const data = await apiRequest<ListResponse<Post>>("/posts?page=1&limit=20");
      setPosts(data.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load posts");
    }
  };

  const createPost = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify(postForm),
      }, token);
      setPostForm({ title: "", content: "" });
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create post");
    }
  };

  const loadUserPosts = async () => {
    if (!lookupUserId) return;
    setMessage("");

    try {
      const data = await apiRequest<ListResponse<Post>>(`/users/${lookupUserId}/posts?page=1&limit=20`);
      setLookupPosts(data.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load user posts");
    }
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-6 lg:grid-cols-2">
      <form onSubmit={createPost} className={panelClass}>
        <h1 className="text-xl font-semibold">Posts</h1>
        {message && <p className="text-sm font-medium text-red-300">{message}</p>}
        <input
          className={inputClass}
          placeholder="Post title"
          value={postForm.title}
          onChange={(event) => setPostForm({ ...postForm, title: event.target.value })}
        />
        <textarea
          className={inputClass}
          placeholder="Post content"
          value={postForm.content}
          onChange={(event) => setPostForm({ ...postForm, content: event.target.value })}
        />
        <div className="flex flex-wrap gap-2">
          <button disabled={!currentUser} className={primaryButtonClass}>Create Post</button>
          <button type="button" className={secondaryButtonClass} onClick={loadPosts}>
            Load Public Posts
          </button>
        </div>
        {!currentUser && <p className="text-sm text-slate-400">Login to create posts. Public posts can still be listed.</p>}
        {posts.map((post) => (
          <p key={post.id ?? post._id} className="border-t border-slate-800 pt-2 text-sm">
            {post.title}: {post.content}
          </p>
        ))}
      </form>

      <section className={panelClass}>
        <h2 className="text-lg font-semibold">User Posts Lookup</h2>
        <input
          className={inputClass}
          placeholder="User id"
          value={lookupUserId}
          onChange={(event) => setLookupUserId(event.target.value)}
        />
        <button className={secondaryButtonClass} onClick={loadUserPosts} type="button">
          Run $lookup Aggregation
        </button>
        {lookupPosts.map((post) => (
          <p key={post.id ?? post._id} className="border-t border-slate-800 pt-2 text-sm">
            {post.title}: {post.content}
          </p>
        ))}
      </section>
    </main>
  );
}
