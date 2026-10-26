export function timeAgo(iso: string | Date): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export type NoteSummary = {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: Record<string, unknown>;
  plainText: string;
  createdAt: string;
  updatedAt: string;
};

export async function createEmptyNote(): Promise<string> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Untitled Note" }),
  });
  if (!res.ok) throw new Error("create failed");
  return (await res.json()).id;
}
