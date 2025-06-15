// Helper for generic changes
export default function interpretGenericChanges(data: {
  added: string[];
  removed: string[];
  changes: string[];
}): string {
  return `- Made ${
    data.added.length + data.removed.length
  } changes to improve functionality and readability.\n`;
}
