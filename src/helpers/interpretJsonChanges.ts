// Helper for JSON changes
export default function interpretJsonChanges(data: {
  added: string[];
  removed: string[];
  changes: string[];
}): string {
  let interpretation = "";

  // Look for property additions/removals
  const addedProps = data.added.filter((line) => line.includes(":"));
  const removedProps = data.removed.filter((line) => line.includes(":"));

  if (addedProps.length > 0) {
    interpretation += `- Added ${addedProps.length} new configuration propert${
      addedProps.length !== 1 ? "ies" : "y"
    }.\n`;
  }

  if (removedProps.length > 0) {
    interpretation += `- Removed ${removedProps.length} configuration propert${
      removedProps.length !== 1 ? "ies" : "y"
    }.\n`;
  }

  // If we couldn't identify specific changes, provide a generic summary
  if (!interpretation) {
    interpretation = `- Modified JSON structure with ${data.added.length} additions and ${data.removed.length} removals.\n`;
  }

  return interpretation;
}
