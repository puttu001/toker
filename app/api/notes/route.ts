import { createNote, listNotes } from "@/lib/notes";
import { createNoteSchema, searchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const q = searchSchema.parse(new URL(request.url).searchParams.get("q") ?? "");
    return Response.json(await listNotes(q));
  } catch (err) {
    console.error("GET /api/notes failed", err);
    return Response.json({ error: "Unable to load notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid note" }, { status: 400 });
  }
  try {
    return Response.json(await createNote(parsed.data), { status: 201 });
  } catch (err) {
    console.error("POST /api/notes failed", err);
    return Response.json({ error: "Unable to create note" }, { status: 500 });
  }
}
