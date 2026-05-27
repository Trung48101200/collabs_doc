import { Extension } from "@tiptap/core";

export function createEditorKeyboardShortcuts() {
  return Extension.create({
    name: "editorKeyboardShortcuts",

    addKeyboardShortcuts() {
      const runEditableCommand = (command: () => boolean) => {
        if (!this.editor.isEditable) return false;
        return command();
      };

      return {
        "Mod-a": () => this.editor.chain().focus().selectAll().run(),
        "Mod-b": () => runEditableCommand(() => this.editor.chain().focus().toggleBold().run()),
        "Mod-i": () => runEditableCommand(() => this.editor.chain().focus().toggleItalic().run()),
        "Mod-u": () => runEditableCommand(() => this.editor.chain().focus().toggleUnderline().run()),
        "Mod-k": () => runEditableCommand(() => {
          const previousUrl = this.editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Nhap URL", previousUrl || "https://");
          if (url === null) return true;
          if (url === "") {
            return this.editor.chain().focus().extendMarkRange("link").unsetLink().run();
          }
          return this.editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }),
        "Mod-Alt-0": () => runEditableCommand(() => this.editor.chain().focus().setParagraph().run()),
        "Mod-Alt-1": () => runEditableCommand(() => this.editor.chain().focus().toggleHeading({ level: 1 }).run()),
        "Mod-Alt-2": () => runEditableCommand(() => this.editor.chain().focus().toggleHeading({ level: 2 }).run()),
        "Mod-Alt-3": () => runEditableCommand(() => this.editor.chain().focus().toggleHeading({ level: 3 }).run())
      };
    }
  });
}
