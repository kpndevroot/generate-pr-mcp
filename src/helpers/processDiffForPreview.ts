import getLanguageFromExtension from "./getLanguageFromExtension.js";

// Enhanced function to process git diff and extract comprehensive technical information
export default function processDiffForPreview(diff: string): {
  changesSummary: string;
  mainLogicChanges: string;
  technicalMetrics: {
    totalFiles: number;
    linesAdded: number;
    linesRemoved: number;
    functionsModified: number;
    classesModified: number;
    interfacesModified: number;
    complexityScore: string;
  };
  fileAnalysis: Array<{
    file: string;
    changeType: string;
    complexity: string;
    linesAdded: number;
    linesRemoved: number;
    businessImpact: string;
  }>;
} {
  // Input validation
  if (typeof diff !== "string") {
    console.warn(
      "processDiffForPreview: Invalid diff input, using empty string"
    );
    diff = "";
  }

  try {
    if (!diff.trim()) {
      return {
        changesSummary: "No changes detected",
        mainLogicChanges: "No changes detected in the provided diff.",
        technicalMetrics: {
          totalFiles: 0,
          linesAdded: 0,
          linesRemoved: 0,
          functionsModified: 0,
          classesModified: 0,
          interfacesModified: 0,
          complexityScore: "None",
        },
        fileAnalysis: [],
      };
    }

    // Check for extremely large diffs to prevent memory issues
    if (diff.length > 5 * 1024 * 1024) {
      // 5MB limit
      console.warn(
        "processDiffForPreview: Diff is very large, truncating for processing"
      );
      diff = diff.substring(0, 5 * 1024 * 1024); // Keep first 5MB
    }

    const lines = diff.split("\n");
    const modifiedFiles = new Map<
      string,
      { added: string[]; removed: string[]; changes: string[] }
    >();
    let currentFile = "";
    let currentFileType = "";
    let inHunk = false;
    let hunkHeader = "";

    // Enhanced technical metrics tracking
    let totalLinesAdded = 0;
    let totalLinesRemoved = 0;
    let functionsModified = 0;
    let classesModified = 0;
    let interfacesModified = 0;
    const fileAnalysisResults: Array<{
      file: string;
      changeType: string;
      complexity: string;
      linesAdded: number;
      linesRemoved: number;
      businessImpact: string;
    }> = [];

    // Process the diff line by line
    for (const line of lines) {
      try {
        // Track file changes
        if (line.startsWith("diff --git")) {
          const match = line.match(/diff --git a\/(.*?) b\/(.*)/);
          if (match && match[1]) {
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
        // Track added lines with enhanced metrics
        else if (line.startsWith("+") && !line.startsWith("+++")) {
          const content = line.substring(1).trim();
          if (content && currentFile) {
            const fileData = modifiedFiles.get(currentFile);
            if (fileData && fileData.added.length < 1000) {
              // Limit per file to prevent memory issues
              fileData.added.push(content);
              totalLinesAdded++;

              // Track technical elements
              if (
                content.includes("function ") ||
                (content.includes("const ") && content.includes("="))
              ) {
                functionsModified++;
              }
              if (content.includes("class ")) {
                classesModified++;
              }
              if (content.includes("interface ")) {
                interfacesModified++;
              }
            }
          }
        }
        // Track removed lines with enhanced metrics
        else if (line.startsWith("-") && !line.startsWith("---")) {
          const content = line.substring(1).trim();
          if (content && currentFile) {
            const fileData = modifiedFiles.get(currentFile);
            if (fileData && fileData.removed.length < 1000) {
              // Limit per file to prevent memory issues
              fileData.removed.push(content);
              totalLinesRemoved++;

              // Track technical elements
              if (
                content.includes("function ") ||
                (content.includes("const ") && content.includes("="))
              ) {
                functionsModified++;
              }
              if (content.includes("class ")) {
                classesModified++;
              }
              if (content.includes("interface ")) {
                interfacesModified++;
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error processing diff line:", line, error);
        continue; // Skip problematic lines and continue processing
      }
    }

    // Generate the summary of modified files
    const changesSummary =
      Array.from(modifiedFiles.keys())
        .slice(0, 100) // Limit number of files shown
        .map((file) => `- \`${file}\``)
        .join("\n") || "No files detected in diff";

    // Create a focused summary of main logic changes
    let mainLogicChanges = "";
    let processedFiles = 0;
    const maxFilesToProcess = 20; // Limit processing to prevent performance issues

    for (const [file, data] of modifiedFiles.entries()) {
      if (processedFiles >= maxFilesToProcess) {
        mainLogicChanges += `\n*... and ${
          modifiedFiles.size - processedFiles
        } more files not shown for brevity*\n`;
        break;
      }

      try {
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
          try {
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
              (line.includes("const ") &&
                line.includes("=") &&
                line.includes("(")) ||
              line.includes("api.") ||
              line.includes("endpoint") ||
              line.includes("route") ||
              line.includes("schema") ||
              line.includes("model") ||
              line.includes("component") ||
              (line.includes("return") &&
                line.includes("<") &&
                line.includes(">"))
            );
          } catch (error) {
            console.warn(
              "Error filtering logic changes for line:",
              line,
              error
            );
            return false;
          }
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
              const fileExt = file.split(".").pop() || "";
              const language = getLanguageFromExtension(fileExt);

              exampleChanges.forEach((change) => {
                try {
                  // Clean up the line for better readability
                  const cleanedChange = change
                    .trim()
                    .replace(/\s+/g, " ") // Normalize whitespace
                    .replace(/;$/, ""); // Remove trailing semicolons

                  // Use proper syntax highlighting for code blocks
                  mainLogicChanges += `\`\`\`${language}\n${cleanedChange}\n\`\`\`\n\n`;
                } catch (error) {
                  console.warn("Error cleaning change:", change, error);
                  mainLogicChanges += `- \`${change.trim()}\`\n`;
                }
              });
            }
          }
        }

        processedFiles++;
      } catch (error) {
        console.warn("Error processing file changes:", file, error);
        continue; // Skip problematic files and continue
      }
    }

    if (!mainLogicChanges) {
      mainLogicChanges = "No significant business logic changes detected.\n";
    }

    // Generate detailed file analysis
    for (const [file, data] of modifiedFiles.entries()) {
      const linesAdded = data.added.length;
      const linesRemoved = data.removed.length;
      const totalChanges = linesAdded + linesRemoved;

      const complexity =
        totalChanges > 50 ? "High" : totalChanges > 20 ? "Medium" : "Low";
      const changeType =
        linesAdded > linesRemoved * 2
          ? "Addition"
          : linesRemoved > linesAdded * 2
          ? "Deletion"
          : "Modification";

      const businessImpact = determineBusinessImpact(file, data);

      fileAnalysisResults.push({
        file,
        changeType,
        complexity,
        linesAdded,
        linesRemoved,
        businessImpact,
      });
    }

    // Generate statistics
    const filesCount = modifiedFiles.size;

    // Calculate complexity score
    const avgChangesPerFile =
      (totalLinesAdded + totalLinesRemoved) / Math.max(filesCount, 1);
    const complexityScore =
      avgChangesPerFile > 100
        ? "High"
        : avgChangesPerFile > 50
        ? "Medium"
        : "Low";

    const changesSummaryWithStats = `**Files Changed:** ${filesCount} files\n**Additions:** ${totalLinesAdded} lines\n**Deletions:** ${totalLinesRemoved} lines\n**Functions Modified:** ${functionsModified}\n**Classes Modified:** ${classesModified}\n**Interfaces Modified:** ${interfacesModified}\n\n${changesSummary}`;

    return {
      changesSummary: changesSummaryWithStats,
      mainLogicChanges,
      technicalMetrics: {
        totalFiles: filesCount,
        linesAdded: totalLinesAdded,
        linesRemoved: totalLinesRemoved,
        functionsModified: functionsModified,
        classesModified: classesModified,
        interfacesModified: interfacesModified,
        complexityScore: complexityScore,
      },
      fileAnalysis: fileAnalysisResults,
    };
  } catch (error) {
    console.error("Error processing diff for preview:", error);
    return {
      changesSummary: "Error processing changes - unable to generate summary",
      mainLogicChanges:
        "Error analyzing changes - please check the diff format and try again.",
      technicalMetrics: {
        totalFiles: 0,
        linesAdded: 0,
        linesRemoved: 0,
        functionsModified: 0,
        classesModified: 0,
        interfacesModified: 0,
        complexityScore: "None",
      },
      fileAnalysis: [],
    };
  }
}

/**
 * Determines the business impact of changes to a specific file
 */
function determineBusinessImpact(
  file: string,
  data: { added: string[]; removed: string[]; changes: string[] }
): string {
  try {
    const ext = file.split(".").pop()?.toLowerCase() || "";
    const totalChanges = data.added.length + data.removed.length;

    // Analyze file type and content
    if (ext === "ts" || ext === "js") {
      const hasBusinessLogic = data.added.some(
        (line) =>
          line.includes("business") ||
          line.includes("validate") ||
          line.includes("process") ||
          line.includes("calculate") ||
          line.includes("transform")
      );

      const hasAPIChanges = data.added.some(
        (line) =>
          line.includes("router") ||
          line.includes("endpoint") ||
          line.includes("api")
      );

      const hasDataChanges = data.added.some(
        (line) =>
          line.includes("model") ||
          line.includes("schema") ||
          line.includes("database")
      );

      if (hasBusinessLogic && totalChanges > 20) {
        return "High - Core business logic modifications";
      } else if (hasAPIChanges) {
        return "Medium - API interface changes";
      } else if (hasDataChanges) {
        return "Medium - Data structure modifications";
      } else if (totalChanges > 50) {
        return "Medium - Significant code changes";
      } else {
        return "Low - Minor code adjustments";
      }
    } else if (ext === "json") {
      if (file.includes("package.json")) {
        return "Medium - Dependency changes affecting project";
      } else {
        return "Low - Configuration updates";
      }
    } else if (ext === "md") {
      return "Low - Documentation updates";
    } else if (ext === "css" || ext === "scss") {
      return "Low - Styling modifications";
    } else if (ext === "yml" || ext === "yaml") {
      return "Medium - Infrastructure or CI/CD changes";
    }

    return "Unknown - Requires manual assessment";
  } catch (error) {
    console.warn("Error determining business impact for file:", file, error);
    return "Unknown - Analysis error";
  }
}

// Helper function to analyze file changes and provide meaningful context
function analyzeFileChanges(
  file: string,
  data: { added: string[]; removed: string[]; changes: string[] }
): string {
  try {
    // Input validation
    if (!file || typeof file !== "string") {
      return "Unable to analyze file - invalid file name";
    }

    if (!data || typeof data !== "object") {
      return "Unable to analyze file - invalid change data";
    }

    const fileExt = file.split(".").pop() || "";
    let analysis = "";

    // Count meaningful patterns safely
    const functionChanges = (data.added || []).filter(
      (line) =>
        line &&
        typeof line === "string" &&
        line.includes("function") &&
        line.includes("(")
    ).length;

    const componentChanges = (data.added || []).filter(
      (line) =>
        line &&
        typeof line === "string" &&
        (line.includes("component") ||
          (line.includes("return") && line.includes("<") && line.includes(">")))
    ).length;

    const apiChanges = (data.added || []).filter(
      (line) =>
        line &&
        typeof line === "string" &&
        (line.includes("api.") ||
          line.includes("endpoint") ||
          line.includes("route"))
    ).length;

    const dataModelChanges = (data.added || []).filter(
      (line) =>
        line &&
        typeof line === "string" &&
        (line.includes("schema") ||
          line.includes("model") ||
          line.includes("interface "))
    ).length;

    const stateChanges = (data.added || []).filter(
      (line) =>
        line &&
        typeof line === "string" &&
        (line.includes("useState") ||
          line.includes("useReducer") ||
          line.includes("state"))
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
  } catch (error) {
    console.error("Error analyzing file changes:", error);
    return "Error analyzing file changes - please check the file and try again.";
  }
}
