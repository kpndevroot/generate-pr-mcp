import countCodeBlocks from "./countCodeBlocks.js";

// Helper for Markdown changes
export default function interpretMarkdownChanges(data: {
  added: string[];
  removed: string[];
  changes: string[];
}): string {
  let interpretation = "";

  // Look for headings
  const addedHeadings = data.added.filter((line) => line.startsWith("#"));
  const removedHeadings = data.removed.filter((line) => line.startsWith("#"));

  if (addedHeadings.length > 0) {
    interpretation += `- Added ${addedHeadings.length} new section${
      addedHeadings.length !== 1 ? "s" : ""
    } to the documentation.\n`;
  }

  if (removedHeadings.length > 0) {
    interpretation += `- Removed ${removedHeadings.length} section${
      removedHeadings.length !== 1 ? "s" : ""
    } from the documentation.\n`;
  }

  // Look for code blocks
  const addedCodeBlocks = countCodeBlocks(data.added);
  const removedCodeBlocks = countCodeBlocks(data.removed);

  if (addedCodeBlocks > 0) {
    interpretation += `- Added ${addedCodeBlocks} code example${
      addedCodeBlocks !== 1 ? "s" : ""
    }.\n`;
  }

  if (removedCodeBlocks > 0) {
    interpretation += `- Removed ${removedCodeBlocks} code example${
      removedCodeBlocks !== 1 ? "s" : ""
    }.\n`;
  }

  // If we couldn't identify specific changes, provide a generic summary
  if (!interpretation) {
    interpretation = `- Updated documentation with ${data.added.length} additions and ${data.removed.length} removals.\n`;
  }

  return interpretation;
}
