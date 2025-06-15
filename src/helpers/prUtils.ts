/**
 * Generates key implementation points based on diff content
 *
 * @param diff The git diff content to analyze
 * @returns Formatted markdown string with checkboxes
 */
export function generateKeyPoints(diff: string): string {
  const points = [];

  // Check for core functionality changes
  if (
    diff.includes("function") ||
    diff.includes("class") ||
    diff.includes("interface")
  ) {
    points.push("- [x] Core functionality changes");
  } else {
    points.push("- [ ] Core functionality changes");
  }

  // Check for API modifications
  if (
    diff.includes("api") ||
    diff.includes("endpoint") ||
    diff.includes("route")
  ) {
    points.push("- [x] API modifications");
  } else {
    points.push("- [ ] API modifications");
  }

  // Check for database schema updates
  if (
    diff.includes("schema") ||
    diff.includes("model") ||
    diff.includes("migration")
  ) {
    points.push("- [x] Database schema updates");
  } else {
    points.push("- [ ] Database schema updates");
  }

  // Check for configuration changes
  if (
    diff.includes("config") ||
    diff.includes(".env") ||
    diff.includes("settings")
  ) {
    points.push("- [x] Configuration changes");
  } else {
    points.push("- [ ] Configuration changes");
  }

  // Check for third-party integrations
  if (
    diff.includes("import") ||
    diff.includes("require") ||
    diff.includes("dependency")
  ) {
    points.push("- [x] Third-party integrations");
  } else {
    points.push("- [ ] Third-party integrations");
  }

  return points.join("\n");
}

/**
 * Generates a simple logic summary from diff content
 * Used as a fallback when detailed analysis is not available
 *
 * @param diff The git diff content to analyze
 * @returns Simple string with key code changes
 */
export function generateSimpleLogicSummary(diff: string): string {
  const lines = diff.split("\n");
  const logicChanges = lines
    .filter(
      (line) =>
        line.startsWith("+") &&
        (line.includes("function") ||
          line.includes("class") ||
          line.includes("interface") ||
          line.includes("export") ||
          line.includes("import"))
    )
    .map((line) => line.substring(1).trim())
    .slice(0, 5)
    .join("\n");

  return logicChanges || "Basic functionality changes detected";
}
