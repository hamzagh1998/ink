import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  BlockNoteView,
  useCreateBlockNote,
  useEditorChange,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import "./styles.css";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
}

export default function Editor({ onChange, initialContent }: EditorProps) {
  const { resolvedTheme } = useTheme();

  const handleUpload = async (results: any) => {
    if (!results) return;

    return results.info.original_filename;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  // Handle editor content changes
  useEditorChange(() => {
    onChange(JSON.stringify(editor.document));
  }, editor);

  return (
    <div className="w-full h-full">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        data-theming-css-variables-demo
      />
    </div>
  );
}
