// Helper to count code blocks in markdown
export default function countCodeBlocks(lines: string[]): number {
  let count = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      if (!inCodeBlock) {
        count++;
      }
    }
  }

  return count;
}
