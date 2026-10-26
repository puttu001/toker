import { getCurrentUser, unauthorized } from "@/lib/auth/server";
import { deleteNote, getNote, updateNote } from "@/lib/notes";
import { idSchema, updateNoteSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx) {
  const parsed = idSchema.safeParse((await ctx.params).id);
  return parsed.success ? parsed.data : null;
}

const notFound = () => Response.json({ error: "Note not found" }, { status: 404 });

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await getCurrentUser())) return unauthorized();
  const id = await parseId(ctx);
  if (!id) return notFound();
  try {
    const note = await getNote(id);
    return note ? Response.json(note) : notFound();
  } catch (err) {
    console.error("GET /api/notes/[id] failed", err);
    return Response.json({ error: "Unable to load note" }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await getCurrentUser())) return unauthorized();
  const id = await parseId(ctx);
  if (!id) return notFound();
  const body = await request.json().catch(() => null);
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid note" }, { status: 400 });
  }
  try {
    const row = await updateNote(id, parsed.data);
    return row ? Response.json(row) : notFound();
  } catch (err) {
    console.error("PATCH /api/notes/[id] failed", err);
    return Response.json({ error: "Unable to save note" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await getCurrentUser())) return unauthorized();
  const id = await parseId(ctx);
  if (!id) return notFound();
  try {
    return (await deleteNote(id)) ? Response.json({ ok: true }) : notFound();
  } catch (err) {
    console.error("DELETE /api/notes/[id] failed", err);
    return Response.json({ error: "Unable to delete note" }, { status: 500 });
  }
}
