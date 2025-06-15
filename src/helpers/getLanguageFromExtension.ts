// Helper to determine language from file extension
export default function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    java: "java",
    go: "go",
    php: "php",
    cs: "csharp",
    rs: "rust",
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
    less: "less",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    ps1: "powershell",
  };

  return languageMap[ext] || "text";
}
