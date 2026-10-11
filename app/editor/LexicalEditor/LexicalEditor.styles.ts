import type { EditorThemeClasses } from "lexical";

export const styles = {
  container:
    "relative flex h-full flex-col overflow-hidden bg-white text-foreground",
  contentEditable:
    "flex-1 min-h-0 overflow-y-auto resize-none px-4 py-3 text-sm bg-white outline-none",
  placeholder:
    "pointer-events-none absolute left-4 top-3 select-none text-sm text-muted-foreground",
};

/** Maps Lexical's built-in node/format classes to Tailwind strings. */
export const editorTheme: EditorThemeClasses = {
  paragraph: "mb-2",
  heading: {
    h1: "mb-2 text-2xl font-bold",
    h2: "mb-2 text-xl font-bold",
    h3: "mb-2 text-lg font-bold",
  },
  quote: "mb-2 border-l-2 border-muted-foreground pl-3 italic text-muted-foreground",
  list: {
    ul: "mb-2 list-disc pl-6",
    ol: "mb-2 list-decimal pl-6",
    listitem: "mb-1",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "rounded bg-muted px-1 py-0.5 font-mono text-xs",
  },
};
