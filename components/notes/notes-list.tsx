"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createEmptyNote, type NoteSummary } from "@/lib/utils";
import { NoteCard } from "./note-card";
import { SearchNotes } from "./search-notes";

export function NotesList() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<NoteSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        setNotes(await res.json());
        setError(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(true);
      }
    }, query ? 250 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const newNote = useCallback(async () => {
    setCreating(true);
    try {
      router.push(`/notes/${await createEmptyNote()}`);
    } catch {
      setCreating(false);
      setError(true);
    }
  }, [router]);

  const searching = query.trim() !== "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Notes</h1>
        <button
          onClick={newNote}
          disabled={creating}
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          + New Note
        </button>
      </header>

      <SearchNotes value={query} onChange={setQuery} />

      <main className="mt-4 space-y-3">
        {error ? (
          <p className="text-sm text-red-600">
            Something went wrong while loading your notes. Please try again.
          </p>
        ) : notes === null ? (
          <p className="text-sm text-muted">Loading notes...</p>
        ) : notes.length === 0 ? (
          searching ? (
            <p className="text-sm text-muted">No notes found.</p>
          ) : (
            <div className="py-16 text-center">
              <h2 className="text-lg font-medium">No notes yet</h2>
              <p className="mt-1 text-sm text-muted">
                Create your first note and start writing.
              </p>
              <button
                onClick={newNote}
                disabled={creating}
                className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white"
              >
                + Create Note
              </button>
            </div>
          )
        ) : (
          <>
            {searching && (
              <p className="text-sm text-muted">
                {notes.length} result{notes.length === 1 ? "" : "s"}
              </p>
            )}
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
