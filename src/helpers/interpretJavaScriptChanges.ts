import interpretGenericChanges from "./interpretGenericChanges.js";

// Helper for JavaScript/TypeScript changes
export default function interpretJavaScriptChanges(data: {
  added: string[];
  removed: string[];
  changes: string[];
}): string {
  let interpretation = "";

  // Check for imports
  const addedImports = data.added.filter((line) => line.includes("import "));
  const removedImports = data.removed.filter((line) =>
    line.includes("import ")
  );

  if (addedImports.length > 0) {
    interpretation += `- Added ${addedImports.length} new import${
      addedImports.length !== 1 ? "s" : ""
    }, enhancing functionality with external modules.\n`;
  }

  if (removedImports.length > 0) {
    interpretation += `- Removed ${removedImports.length} import${
      removedImports.length !== 1 ? "s" : ""
    }, simplifying dependencies.\n`;
  }

  // Check for functions
  const addedFunctions = data.added.filter(
    (line) => line.includes("function ") || line.match(/\w+\s*\([^)]*\)\s*{/)
  );
  const removedFunctions = data.removed.filter(
    (line) => line.includes("function ") || line.match(/\w+\s*\([^)]*\)\s*{/)
  );

  if (addedFunctions.length > 0) {
    interpretation += `- Added ${addedFunctions.length} new function${
      addedFunctions.length !== 1 ? "s" : ""
    }, improving code organization and reusability.\n`;
  }

  if (removedFunctions.length > 0) {
    interpretation += `- Removed ${removedFunctions.length} function${
      removedFunctions.length !== 1 ? "s" : ""
    }, streamlining the codebase.\n`;
  }

  // Check for variables
  const addedVars = data.added.filter(
    (line) =>
      line.includes("const ") || line.includes("let ") || line.includes("var ")
  );
  const removedVars = data.removed.filter(
    (line) =>
      line.includes("const ") || line.includes("let ") || line.includes("var ")
  );

  if (addedVars.length > 0) {
    interpretation += `- Declared ${addedVars.length} new variable${
      addedVars.length !== 1 ? "s" : ""
    }, enhancing data management.\n`;
  }

  if (removedVars.length > 0) {
    interpretation += `- Removed ${removedVars.length} variable${
      removedVars.length !== 1 ? "s" : ""
    }, cleaning up the code.\n`;
  }

  // If we couldn't identify specific changes, provide a generic summary
  if (!interpretation) {
    interpretation = interpretGenericChanges(data);
  }

  return interpretation;
}
