import { NoteEditor } from "@/components/notes/note-editor";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  return <NoteEditor id={id} />;
}
