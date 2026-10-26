"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";

type Item = {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

function Btn({ label, title, active, disabled, onClick, className = "" }: Item) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // keep editor focus/selection when clicking toolbar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 rounded px-2 py-1.5 text-sm disabled:opacity-40 ${
        active ? "bg-accent text-white" : "hover:bg-border"
      } ${className}`}
    >
      {label}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

export function EditorToolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      code: e.isActive("code"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      task: e.isActive("taskList"),
      link: e.isActive("link"),
      codeBlock: e.isActive("codeBlock"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const c = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background px-2 py-1.5"
    >
      <Btn label="B" title="Bold (Ctrl+B)" active={s.bold} onClick={() => c().toggleBold().run()} className="font-bold" />
      <Btn label="I" title="Italic (Ctrl+I)" active={s.italic} onClick={() => c().toggleItalic().run()} className="italic" />
      <Btn label="U" title="Underline (Ctrl+U)" active={s.underline} onClick={() => c().toggleUnderline().run()} className="underline" />
      <Sep />
      <Btn label="H1" title="Heading 1" active={s.h1} onClick={() => c().toggleHeading({ level: 1 }).run()} />
      <Btn label="H2" title="Heading 2" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()} />
      <Btn label="H3" title="Heading 3" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()} />
      <Sep />
      <Btn label="• List" title="Bullet list" active={s.bullet} onClick={() => c().toggleBulletList().run()} />
      <Btn label="1. List" title="Numbered list" active={s.ordered} onClick={() => c().toggleOrderedList().run()} />
      <Btn label="☑" title="Checklist" active={s.task} onClick={() => c().toggleTaskList().run()} />
      <Sep />
      <Btn label="Link" title="Link (Ctrl+K)" active={s.link} onClick={setLink} />
      <Btn label="</>" title="Inline code" active={s.code} onClick={() => c().toggleCode().run()} className="font-mono" />
      <Btn label="{ }" title="Code block" active={s.codeBlock} onClick={() => c().toggleCodeBlock().run()} className="font-mono" />
      <Btn label="❝" title="Blockquote" active={s.quote} onClick={() => c().toggleBlockquote().run()} />
      <Btn label="—" title="Horizontal rule" onClick={() => c().setHorizontalRule().run()} />
      <Sep />
      <Btn label="↶" title="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => c().undo().run()} />
      <Btn label="↷" title="Redo (Ctrl+Shift+Z)" disabled={!s.canRedo} onClick={() => c().redo().run()} />
    </div>
  );
}
