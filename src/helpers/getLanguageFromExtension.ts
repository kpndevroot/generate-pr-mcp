// Helper to determine language from file extension
export default function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    md: "markdown",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
    html: "html",
    css: "css",
    scss: "scss",
    sql: "sql",
    sh: "bash",
    bash: "bash",
  };

  return languageMap[ext] || "text";
}
