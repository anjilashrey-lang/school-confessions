
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Confession = {
  id: string;
  message: string;
  created_at: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState<Confession[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadPosts() {
    const { data, error } = await supabase
      .from("confessions")
      .select("id, message, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = message.trim();

    if (clean.length < 5) {
      setNotice("Write at least 5 characters.");
      return;
    }

    setLoading(true);
    setNotice("");

    const { error } = await supabase
      .from("confessions")
      .insert({ message: clean, status: "pending" });

    setLoading(false);

    if (error) {
      setNotice("Could not submit. Please try again.");
    } else {
      setMessage("");
      setNotice("Submitted! Your confession awaits moderator approval.");
    }
  }

  return (
    <main className="min-h-screen bg-[#100d1c] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-purple-300">
            Your campus. Your stories.
          </p>
          <h1 className="text-4xl font-black sm:text-6xl">
            LSA <span className="text-purple-400">Confession</span>
          </h1>
          <p className="mt-4 text-gray-300">
            Share your thoughts anonymously. Be kind. Be respectful.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-2 text-xl font-bold">Share a confession</h2>
          <p className="mb-5 text-sm text-gray-400">
            Confessions are reviewed before they appear publicly.
          </p>

          <form onSubmit={submit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write what's on your mind..."
              maxLength={1000}
              rows={5}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-purple-400"
            />
            <p className="mt-2 text-xs text-gray-400">
              Do not include names, phone numbers, or identifying details.
              {` ${message.length}/1000`}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-purple-600 px-5 py-4 font-bold hover:bg-purple-500 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit anonymously"}
            </button>
          </form>

          {notice && (
            <p role="status" className="mt-4 text-center text-purple-200">
              {notice}
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">Confession Wall</h2>
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-white/10 p-6 text-center text-gray-400">
              No approved confessions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="whitespace-pre-wrap break-words">
                    {post.message}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-gray-500">
          LSA Confession · Think before you post.
        </footer>
      </div>
    </main>
  );
}
