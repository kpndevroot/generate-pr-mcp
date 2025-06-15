import getLanguageFromExtension from "./getLanguageFromExtension.js";
import interpretFileChanges from "./interpretFileChanges.js";

// Enhanced function to process git diff and extract meaningful information
export default function processDiffForPreview(diff: string): {
  changesSummary: string;
  mainLogicChanges: string;
} {
  const lines = diff.split("\n");
  const modifiedFiles = new Map<
    string,
    { added: string[]; removed: string[]; changes: string[] }
  >();
  let currentFile = "";
  let currentFileType = "";
  let inHunk = false;
  let hunkHeader = "";

  // Process the diff line by line
  for (const line of lines) {
    // Track file changes
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/(.*?) b\/(.*)/);
      if (match) {
        currentFile = match[1];
        currentFileType = currentFile.split(".").pop() || "";
        if (!modifiedFiles.has(currentFile)) {
          modifiedFiles.set(currentFile, {
            added: [],
            removed: [],
            changes: [],
          });
        }
      }
    }
    // Track hunk headers for context
    else if (line.startsWith("@@")) {
      inHunk = true;
      hunkHeader = line;
      const fileData = modifiedFiles.get(currentFile);
      if (fileData) {
        fileData.changes.push(
          `Changed section: ${hunkHeader
            .replace(/@@\s-\d+,\d+\s\+\d+,\d+\s@@/, "")
            .trim()}`
        );
      }
    }
    // Track added lines
    else if (line.startsWith("+") && !line.startsWith("+++")) {
      const content = line.substring(1).trim();
      if (content && currentFile) {
        const fileData = modifiedFiles.get(currentFile);
        if (fileData) {
          fileData.added.push(content);
        }
      }
    }
    // Track removed lines
    else if (line.startsWith("-") && !line.startsWith("---")) {
      const content = line.substring(1).trim();
      if (content && currentFile) {
        const fileData = modifiedFiles.get(currentFile);
        if (fileData) {
          fileData.removed.push(content);
        }
      }
    }
  }

  // Generate the summary of modified files
  const changesSummary = Array.from(modifiedFiles.keys())
    .map((file) => `- \`${file}\``)
    .join("\n");

  // Create a focused summary of main logic changes
  let mainLogicChanges = "";
  for (const [file, data] of modifiedFiles.entries()) {
    const fileExt = file.split(".").pop() || "";

    // Skip node_modules, env files, and lock files
    if (
      file.includes("node_modules") ||
      file.endsWith(".env") ||
      file.endsWith(".lock") ||
      file.endsWith(".log")
    ) {
      continue;
    }

    // Focus on business logic changes, excluding imports and env values
    const logicRelatedChanges = data.added.filter((line) => {
      // Skip imports
      if (
        line.trim().startsWith("import ") ||
        line.trim().startsWith("require(")
      ) {
        return false;
      }

      // Skip env values and config literals
      if (
        line.includes("API_KEY") ||
        line.includes("SECRET") ||
        line.includes("PASSWORD") ||
        line.includes("TOKEN") ||
        (line.match(/=\s*["'].*["']/) && line.includes("config"))
      ) {
        return false;
      }

      // Focus on meaningful code structures
      return (
        (line.includes("function") && line.includes("(")) ||
        (line.includes("class") && line.includes("{")) ||
        line.includes("interface ") ||
        (line.includes("const ") && line.includes("=") && line.includes("(")) ||
        line.includes("api.") ||
        line.includes("endpoint") ||
        line.includes("route") ||
        line.includes("schema") ||
        line.includes("model") ||
        line.includes("component") ||
        (line.includes("return") && line.includes("<") && line.includes(">"))
      );
    });

    if (logicRelatedChanges.length > 0) {
      mainLogicChanges += `#### ${file}\n\n`;

      // Analyze the changes for this file to provide context
      const fileAnalysis = analyzeFileChanges(file, data);
      mainLogicChanges += `${fileAnalysis}\n\n`;

      // Show only a few representative examples if needed
      if (
        logicRelatedChanges.length > 0 &&
        fileAnalysis.includes("Example changes:")
      ) {
        const exampleChanges = logicRelatedChanges
          .filter((change) => change.trim().length > 0)
          .slice(0, 2);

        if (exampleChanges.length > 0) {
          exampleChanges.forEach((change) => {
            // Clean up the line for better readability
            const cleanedChange = change
              .trim()
              .replace(/\s+/g, " ") // Normalize whitespace
              .replace(/;$/, ""); // Remove trailing semicolons

            mainLogicChanges += `- \`${cleanedChange}\`\n`;
          });
          mainLogicChanges += "\n";
        }
      }
    }
  }

  if (!mainLogicChanges) {
    mainLogicChanges = "No significant business logic changes detected.\n";
  }

  // Generate statistics
  const filesCount = modifiedFiles.size;
  let additionsCount = 0;
  let deletionsCount = 0;

  for (const data of modifiedFiles.values()) {
    additionsCount += data.added.length;
    deletionsCount += data.removed.length;
  }

  return {
    changesSummary,
    mainLogicChanges,
  };
}

// Helper function to analyze file changes and provide meaningful context
function analyzeFileChanges(
  file: string,
  data: { added: string[]; removed: string[]; changes: string[] }
): string {
  const fileExt = file.split(".").pop() || "";
  let analysis = "";

  // Count meaningful patterns
  const functionChanges = data.added.filter(
    (line) => line.includes("function") && line.includes("(")
  ).length;
  const componentChanges = data.added.filter(
    (line) =>
      line.includes("component") ||
      (line.includes("return") && line.includes("<") && line.includes(">"))
  ).length;
  const apiChanges = data.added.filter(
    (line) =>
      line.includes("api.") ||
      line.includes("endpoint") ||
      line.includes("route")
  ).length;
  const dataModelChanges = data.added.filter(
    (line) =>
      line.includes("schema") ||
      line.includes("model") ||
      line.includes("interface ")
  ).length;
  const stateChanges = data.added.filter(
    (line) =>
      line.includes("useState") ||
      line.includes("useReducer") ||
      line.includes("state")
  ).length;

  // Determine the main purpose of the changes
  if (fileExt === "tsx" || fileExt === "jsx" || file.includes("component")) {
    if (componentChanges > 0) {
      analysis += `**UI Component Changes**: Modified UI structure or component logic`;

      // Check for specific UI patterns
      if (
        data.added.some(
          (line) => line.includes("flex") || line.includes("grid")
        )
      ) {
        analysis += ` with layout adjustments`;
      }
      if (
        data.added.some(
          (line) => line.includes("onClick") || line.includes("onChange")
        )
      ) {
        analysis += ` and event handlers`;
      }
      analysis += ".\n\n";

      if (stateChanges > 0) {
        analysis += `Updated component state management or hooks.\n\n`;
      }

      analysis += `Example changes:`;
    }
  } else if (fileExt === "ts" || fileExt === "js") {
    if (functionChanges > 0) {
      if (apiChanges > 0) {
        analysis += `**API Logic Changes**: Modified API endpoints or request handling`;
        analysis += `.\n\n`;
        analysis += `Example changes:`;
      } else {
        analysis += `**Business Logic Changes**: Updated core functionality`;
        if (
          data.added.some(
            (line) => line.includes("async") || line.includes("await")
          )
        ) {
          analysis += ` with asynchronous operations`;
        }
        analysis += `.\n\n`;
        analysis += `Example changes:`;
      }
    } else if (dataModelChanges > 0) {
      analysis += `**Data Model Changes**: Updated data structures or interfaces.\n\n`;
      analysis += `Example changes:`;
    }
  } else if (fileExt === "css" || fileExt === "scss") {
    analysis += `**Styling Changes**: Updated visual appearance or layout.\n\n`;
  } else if (fileExt === "json") {
    analysis += `**Configuration Changes**: Updated project settings or dependencies.\n\n`;
  } else if (fileExt === "md") {
    analysis += `**Documentation Changes**: Updated project documentation.\n\n`;
  }

  // If we couldn't determine a specific pattern
  if (!analysis) {
    analysis = `**Code Changes**: Made ${data.added.length} additions and ${data.removed.length} removals.\n\n`;

    if (data.added.length > 0) {
      analysis += `Example changes:`;
    }
  }

  return analysis;
}
