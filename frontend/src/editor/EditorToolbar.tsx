import { Bold, Highlighter, Italic, Link, List, ListOrdered, Redo2, Underline, Undo2, AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

function ToolbarButton({ title, active, disabled, onClick, children }: { title: string; active?: boolean; disabled: boolean; onClick: () => void; children: ReactNode; }) {
  return (
    <button
      className="button secondary icon"
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={active ? { borderColor: "#60a5fa", color: "#60a5fa" } : undefined}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
  if (!editor) return <div className="toolbar" />;

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="toolbar">
      <span className="toolbar-group">
        <ToolbarButton title="Undo" disabled={disabled} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={17} />
        </ToolbarButton>
        <ToolbarButton title="Redo" disabled={disabled} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={17} />
        </ToolbarButton>
      </span>
      <span className="toolbar-group">
        <ToolbarButton title="Bold" active={editor.isActive("bold")} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={17} />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={17} />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={17} />
        </ToolbarButton>
        <ToolbarButton title="Highlight" disabled={disabled} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fff3a3" }).run()}>
          <Highlighter size={17} />
        </ToolbarButton>
      </span>
      <span className="toolbar-group">
        <button className="button secondary" disabled={disabled} type="button" onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
        <button className="button secondary" disabled={disabled} type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button className="button secondary" disabled={disabled} type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button className="button secondary" disabled={disabled} type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
      </span>
      <span className="toolbar-group">
        <ToolbarButton title="Align left" disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={17} />
        </ToolbarButton>
        <ToolbarButton title="Align center" disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={17} />
        </ToolbarButton>
        <ToolbarButton title="Align right" disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={17} />
        </ToolbarButton>
        <ToolbarButton title="Justify" disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify size={17} />
        </ToolbarButton>
      </span>
      <span className="toolbar-group">
        <ToolbarButton title="Bullet list" disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={17} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={17} />
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive("link")} disabled={disabled} onClick={setLink}>
          <Link size={17} />
        </ToolbarButton>
      </span>
    </div>
  );
}
