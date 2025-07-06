import {
  generateKeyPoints,
  generateSimpleLogicSummary,
} from "../helpers/index.js";

/**
 * Generates a professional PR template with the provided information
 *
 * @param title The PR title
 * @param description The PR description
 * @param changesSummary Summary of files changed
 * @param mainLogicChanges Analysis of main logic changes
 * @param diff Raw diff content for analysis
 * @param screenshots Optional screenshots for visual changes
 * @returns Formatted markdown content for the PR
 */
export function generatePRMarkdown(
  title: string,
  description: string,
  changesSummary: string,
  mainLogicChanges: string,
  diff: string,
  screenshots?: { before?: string; after?: string }
): string {
  try {
    // Input validation with fallbacks
    const safeTitle =
      typeof title === "string" && title.trim() ? title : "Untitled PR";
    const safeDescription =
      typeof description === "string" && description.trim()
        ? description
        : "No description provided";
    const safeChangesSummary =
      typeof changesSummary === "string" && changesSummary.trim()
        ? changesSummary
        : "No changes detected";
    const safeMainLogicChanges =
      typeof mainLogicChanges === "string" && mainLogicChanges.trim()
        ? mainLogicChanges
        : "No logic changes detected";
    const safeDiff = typeof diff === "string" ? diff : "";

    // Generate key points with error handling
    let keyPoints: string;
    try {
      keyPoints = generateKeyPoints(safeDiff);
    } catch (error) {
      console.warn("Error generating key points, using fallback:", error);
      keyPoints = `- [ ] Core functionality changes
- [ ] API modifications
- [ ] Database schema updates
- [ ] Configuration changes
- [ ] Third-party integrations`;
    }

    // Handle screenshots safely
    const hasScreenshots =
      screenshots && (screenshots.before || screenshots.after);
    const beforeScreenshot =
      screenshots?.before && typeof screenshots.before === "string"
        ? screenshots.before
        : "";
    const afterScreenshot =
      screenshots?.after && typeof screenshots.after === "string"
        ? screenshots.after
        : "";

    return `# ${safeTitle}

## 🎯 Overview

${safeDescription}

## 📋 Type of Change

<!-- Please check the appropriate options that apply to this PR -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] ♻️ Code refactoring (no functional changes, no api changes)
- [ ] ⚡ Performance improvements

## 🔍 Changes Description

### What Changed:
${safeChangesSummary}

### Why It Changed:
<!-- Please provide the motivation and context for the changes -->

### Implementation Details:

<!-- This section provides a concise analysis of the key business logic changes -->
${safeMainLogicChanges}

<!-- The analysis above focuses on explaining the purpose and impact of changes rather than showing raw code -->
<!-- Sensitive information like API keys, tokens, and environment variables are automatically excluded -->
<!-- UI component changes include explanations of layout and functionality modifications -->

**Key Implementation Points:**
${keyPoints}

## 🧪 Testing Done

<!-- Please describe the tests that you ran to verify your changes -->

- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Manual Testing

### Test Coverage:
<!-- Describe what scenarios were tested -->

## 📸 Visual Changes

${
  hasScreenshots
    ? `
### Before:
${
  beforeScreenshot
    ? `
![Before Changes](${beforeScreenshot})
`
    : "_No before screenshot provided_"
}

### After:
${
  afterScreenshot
    ? `
![After Changes](${afterScreenshot})
`
    : "_No after screenshot provided_"
}
`
    : "<!-- No visual changes in this PR -->"
}

## ✅ Checklist

<!-- Please check all items that apply -->

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests are passing
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Branch is up to date with main

## 🔗 Related Items

<!-- Link related issues, PRs, or documentation -->

- Related Issue: #
- Closes: #
- Documentation: [Link]()

## 📝 Additional Notes

<!-- Add any other context about the PR here -->

---

## 👥 Reviewers Guide

1. Check implementation approach
2. Verify test coverage
3. Review documentation updates
4. Consider performance implications

<!-- Optional: Add a fun GIF that represents your PR! -->
`;
  } catch (error) {
    console.error("Error generating PR markdown:", error);
    // Return a basic fallback template
    return generateFallbackPRMarkdown(title, description, diff);
  }
}

/**
 * Generates a simple fallback PR template when the main template processing fails
 *
 * @param title The PR title
 * @param description The PR description
 * @param diff Raw diff content for analysis
 * @returns Simplified markdown content for the PR
 */
export function generateFallbackPRMarkdown(
  title: string,
  description: string,
  diff: string
): string {
  try {
    // Input validation with fallbacks
    const safeTitle =
      typeof title === "string" && title.trim() ? title : "Untitled PR";
    const safeDescription =
      typeof description === "string" && description.trim()
        ? description
        : "No description provided";
    const safeDiff = typeof diff === "string" ? diff : "";

    // Generate simple logic summary with error handling
    let logicSummary: string;
    try {
      logicSummary = generateSimpleLogicSummary(safeDiff);
    } catch (error) {
      console.warn(
        "Error generating simple logic summary, using fallback:",
        error
      );
      logicSummary = "Basic functionality changes detected";
    }

    return `# ${safeTitle}

## 🎯 Overview
${safeDescription}

## 🔄 Changes Preview
### Implementation Details:
${logicSummary}

**Key Implementation Points:**
- Core functionality changes detected

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests are passing

## 📝 Additional Notes
This PR was generated using the fallback template due to processing constraints.
`;
  } catch (error) {
    console.error("Error generating fallback PR markdown:", error);
    // Final fallback - minimal template
    const finalTitle = title || "Untitled PR";
    const finalDescription = description || "No description provided";

    return `# ${finalTitle}

## 🎯 Overview
${finalDescription}

## 🔄 Changes Preview
Basic changes detected in the repository.

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests are passing

## 📝 Additional Notes
This is a minimal PR template generated as a fallback.
`;
  }
}
