"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import type { Note } from "@/lib/utils";
import { EditorToolbar } from "./editor-toolbar";

const SAVE_DELAY = 1000;

type SaveStatus = "saved" | "saving" | "unsaved" | "error";
type Draft = { title: string; content: Record<string, unknown>; plainText: string };

const draftKey = (id: string) => `draft:note:${id}`;

function readDraft(id: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(id));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
function writeDraft(id: string, d: Draft | null) {
  try {
    if (d) localStorage.setItem(draftKey(id), JSON.stringify(d));
    else localStorage.removeItem(draftKey(id));
  } catch {}
}

export function NoteEditor({ id }: { id: string }) {
  const [note, setNote] = useState<Note | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notes/${id}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) return setState("notfound");
        if (!res.ok) throw new Error();
        setNote(await res.json());
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === "ready" && note) return <EditorBody note={note} />;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
      {state === "loading" && <p className="text-muted">Loading note...</p>}
      {state === "notfound" && <p className="mb-3">Note not found.</p>}
      {state === "error" && (
        <p className="mb-3">Something went wrong while loading this note. Please try again.</p>
      )}
      {state !== "loading" && (
        <Link href="/" className="text-accent underline">
          Back to notes
        </Link>
      )}
    </div>
  );
}

function EditorBody({ note }: { note: Note }) {
  const router = useRouter();
  const { id } = note;

  // A leftover local draft (failed/unfinished save) wins over the server copy.
  const [initial] = useState<Draft>(
    () => readDraft(id) ?? { title: note.title, content: note.content, plainText: note.plainText },
  );

  const [title, setTitle] = useState(initial.title);
  const [status, setStatus] = useState<SaveStatus>(readDraft(id) ? "unsaved" : "saved");
  const [words, setWords] = useState(() => countWords(initial.plainText));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pending = useRef<Draft | null>(readDraft(id));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const titleRef = useRef(initial.title);

  const save = useCallback(async function run(): Promise<void> {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const draft = pending.current;
    if (!draft) return;
    if (inFlight.current) {
      // another save is running; try again once it completes
      timer.current = setTimeout(run, 300);
      return;
    }
    inFlight.current = true;
    setStatus("saving");
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error();
      if (pending.current === draft) {
        pending.current = null;
        writeDraft(id, null);
        setStatus("saved");
      } else {
        // edited while saving
        setStatus("unsaved");
        timer.current = setTimeout(run, SAVE_DELAY);
      }
    } catch {
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, [id]);

  const schedule = useCallback(
    (content: Record<string, unknown>, plainText: string) => {
      const draft = { title: titleRef.current, content, plainText };
      pending.current = draft;
      writeDraft(id, draft);
      setStatus("unsaved");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(save, SAVE_DELAY);
    },
    [id, save],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: Object.keys(initial.content).length ? initial.content : undefined,
    editorProps: {
      attributes: { class: "note-body", "aria-label": "Note content" },
    },
    onUpdate: ({ editor }) => {
      const plain = editor.getText({ blockSeparator: "\n" });
      setWords(countWords(plain));
      schedule(editor.getJSON() as Record<string, unknown>, plain);
    },
  });

  // Flush pending changes when leaving / hiding the page.
  useEffect(() => {
    const flush = () => {
      const draft = pending.current;
      if (!draft) return;
      fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
        keepalive: true,
      }).catch(() => {});
    };
    const onVisibility = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  const onTitle = (value: string) => {
    setTitle(value);
    titleRef.current = value;
    if (!editor) return;
    schedule(editor.getJSON() as Record<string, unknown>, editor.getText({ blockSeparator: "\n" }));
  };

  const goBack = async () => {
    // best-effort save before leaving (the draft stays in localStorage if it fails)
    if (pending.current) await save();
    router.push("/");
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteError(false);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error();
      pending.current = null;
      writeDraft(id, null);
      router.push("/");
    } catch {
      setDeleteError(true);
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <button onClick={goBack} className="text-sm text-accent">
          ← My Notes
        </button>
        <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-600">
          Delete
        </button>
      </header>

      <div className="px-4">
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Title"
          aria-label="Title"
          maxLength={300}
          className="w-full bg-transparent py-2 text-2xl font-semibold outline-none sm:text-3xl"
        />
      </div>

      {editor && <EditorToolbar editor={editor} />}

      <div className="flex-1 px-4 py-4">
        <EditorContent editor={editor} />
      </div>

      <footer className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-4 py-2 text-xs text-muted">
        <span aria-live="polite">
          {status === "saved" && "Saved"}
          {status === "saving" && "Saving..."}
          {status === "unsaved" && "Unsaved changes"}
          {status === "error" && (
            <>
              <span className="text-red-600">Unable to save changes. </span>
              <button onClick={save} className="underline">
                Retry
              </button>
            </>
          )}
        </span>
        <span>
          {words} word{words === 1 ? "" : "s"}
        </span>
      </footer>

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-lg bg-surface p-5 shadow-lg">
            <h2 id="del-title" className="font-semibold">
              Delete this note?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Are you sure you want to delete &ldquo;{title || "Untitled Note"}&rdquo;? This action
              cannot be undone.
            </p>
            {deleteError && (
              <p className="mt-2 text-sm text-red-600">
                Unable to delete this note. Please try again.
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={remove}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function countWords(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
