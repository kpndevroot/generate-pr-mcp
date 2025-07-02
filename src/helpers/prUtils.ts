/**
 * Generates key implementation points based on diff content
 *
 * @param diff The git diff content to analyze
 * @returns Formatted markdown string with checkboxes
 */
export function generateKeyPoints(diff: string): string {
  // Input validation
  if (typeof diff !== "string") {
    console.warn("generateKeyPoints: Invalid diff input, using empty string");
    diff = "";
  }

  try {
    const points = [];

    // Normalize diff for consistent checking
    const normalizedDiff = diff.toLowerCase();

    // Check for core functionality changes
    if (
      normalizedDiff.includes("function") ||
      normalizedDiff.includes("class") ||
      normalizedDiff.includes("interface")
    ) {
      points.push("- [x] Core functionality changes");
    } else {
      points.push("- [ ] Core functionality changes");
    }

    // Check for API modifications
    if (
      normalizedDiff.includes("api") ||
      normalizedDiff.includes("endpoint") ||
      normalizedDiff.includes("route")
    ) {
      points.push("- [x] API modifications");
    } else {
      points.push("- [ ] API modifications");
    }

    // Check for database schema updates
    if (
      normalizedDiff.includes("schema") ||
      normalizedDiff.includes("model") ||
      normalizedDiff.includes("migration")
    ) {
      points.push("- [x] Database schema updates");
    } else {
      points.push("- [ ] Database schema updates");
    }

    // Check for configuration changes
    if (
      normalizedDiff.includes("config") ||
      normalizedDiff.includes(".env") ||
      normalizedDiff.includes("settings")
    ) {
      points.push("- [x] Configuration changes");
    } else {
      points.push("- [ ] Configuration changes");
    }

    // Check for third-party integrations
    if (
      normalizedDiff.includes("import") ||
      normalizedDiff.includes("require") ||
      normalizedDiff.includes("dependency")
    ) {
      points.push("- [x] Third-party integrations");
    } else {
      points.push("- [ ] Third-party integrations");
    }

    return points.join("\n");
  } catch (error) {
    console.error("Error generating key points:", error);
    return `- [ ] Core functionality changes
- [ ] API modifications
- [ ] Database schema updates
- [ ] Configuration changes
- [ ] Third-party integrations`;
  }
}

/**
 * Generates a simple logic summary from diff content
 * Used as a fallback when detailed analysis is not available
 *
 * @param diff The git diff content to analyze
 * @returns Simple string with key code changes
 */
export function generateSimpleLogicSummary(diff: string): string {
  // Input validation
  if (typeof diff !== "string") {
    console.warn(
      "generateSimpleLogicSummary: Invalid diff input, using empty string"
    );
    diff = "";
  }

  try {
    if (!diff.trim()) {
      return "No changes detected in the provided diff";
    }

    const lines = diff.split("\n");

    // Filter and process lines safely
    const logicChanges = lines
      .filter((line) => {
        if (!line || typeof line !== "string") return false;

        return (
          line.startsWith("+") &&
          (line.includes("function") ||
            line.includes("class") ||
            line.includes("interface") ||
            line.includes("export") ||
            line.includes("import"))
        );
      })
      .map((line) => {
        try {
          return line.substring(1).trim();
        } catch (error) {
          console.warn("Error processing line:", line, error);
          return "";
        }
      })
      .filter((line) => line.length > 0) // Remove empty lines
      .slice(0, 5)
      .join("\n");

    return logicChanges || "Basic functionality changes detected";
  } catch (error) {
    console.error("Error generating simple logic summary:", error);
    return "Error analyzing changes - basic functionality changes detected";
  }
}
