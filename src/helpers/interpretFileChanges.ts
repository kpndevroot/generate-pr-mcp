import interpretGenericChanges from "./interpretGenericChanges.js";
import interpretJavaScriptChanges from "./interpretJavaScriptChanges.js";
import interpretJsonChanges from "./interpretJsonChanges.js";
import interpretMarkdownChanges from "./interpretMarkdownChanges.js";

// Helper function to interpret changes based on file type and content
export default function interpretFileChanges(
  file: string,
  data: { added: string[]; removed: string[]; changes: string[] }
): string {
  const fileExt = file.split(".").pop() || "";
  let interpretation = "";

  // Analyze changes based on file type
  switch (fileExt) {
    case "ts":
    case "js":
      interpretation = interpretJavaScriptChanges(data);
      break;
    case "json":
      interpretation = interpretJsonChanges(data);
      break;
    case "md":
      interpretation = interpretMarkdownChanges(data);
      break;
    default:
      interpretation = interpretGenericChanges(data);
  }

  return interpretation;
}
