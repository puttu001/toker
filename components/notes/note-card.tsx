import Link from "next/link";
import { timeAgo, type NoteSummary } from "@/lib/utils";

export function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="block rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
    >
      <h2 className="truncate font-medium">{note.title || "Untitled Note"}</h2>
      {note.preview && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{note.preview}</p>
      )}
      <p className="mt-2 text-xs text-muted" suppressHydrationWarning>
        Updated {timeAgo(note.updatedAt)}
      </p>
    </Link>
  );
}
