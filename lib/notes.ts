import "server-only";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { notes } from "@/db/schema";

const PREVIEW_LENGTH = 180;

const escapeLike = (s: string) => s.replace(/[\\%_]/g, "\\$&");

export async function listNotes(search = "") {
  const db = getDb();
  const q = search.trim();
  const where = q
    ? or(
        ilike(notes.title, `%${escapeLike(q)}%`),
        ilike(notes.plainText, `%${escapeLike(q)}%`),
      )
    : undefined;

  return db
    .select({
      id: notes.id,
      title: notes.title,
      preview: sql<string>`left(${notes.plainText}, ${PREVIEW_LENGTH})`,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(where)
    .orderBy(desc(notes.updatedAt));
}

export async function getNote(id: string) {
  const [row] = await getDb().select().from(notes).where(eq(notes.id, id));
  return row ?? null;
}

export async function createNote(input: {
  title: string;
  content: Record<string, unknown>;
  plainText: string;
}) {
  const [row] = await getDb()
    .insert(notes)
    .values(input)
    .returning({ id: notes.id, title: notes.title });
  return row;
}

export async function updateNote(
  id: string,
  input: Partial<{ title: string; content: Record<string, unknown>; plainText: string }>,
) {
  const [row] = await getDb()
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning({ id: notes.id, updatedAt: notes.updatedAt });
  return row ?? null;
}

export async function deleteNote(id: string) {
  const rows = await getDb().delete(notes).where(eq(notes.id, id)).returning({ id: notes.id });
  return rows.length > 0;
}
