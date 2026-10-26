"use client";

export function SearchNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search notes..."
      aria-label="Search notes"
      className="mt-4 w-full rounded-md border border-border bg-surface px-3 py-2 text-base outline-none focus:border-accent"
    />
  );
}
