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
  return `# ${title}

## 🎯 Overview

${description}

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
${changesSummary}

### Why It Changed:
<!-- Please provide the motivation and context for the changes -->

### Implementation Details:

<!-- This section provides a concise analysis of the key business logic changes -->
${mainLogicChanges}

<!-- The analysis above focuses on explaining the purpose and impact of changes rather than showing raw code -->
<!-- Sensitive information like API keys, tokens, and environment variables are automatically excluded -->
<!-- UI component changes include explanations of layout and functionality modifications -->

**Key Implementation Points:**
${generateKeyPoints(diff)}

## 🧪 Testing Done

<!-- Please describe the tests that you ran to verify your changes -->

- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Manual Testing

### Test Coverage:
<!-- Describe what scenarios were tested -->

## 📸 Visual Changes

${
  screenshots?.before || screenshots?.after
    ? `
### Before:
${
  screenshots?.before
    ? `
![Before Changes](${screenshots.before})
`
    : "_No before screenshot provided_"
}

### After:
${
  screenshots?.after
    ? `
![After Changes](${screenshots.after})
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
  return `# ${title}

## 🎯 Overview
${description}

## 🔄 Changes Preview
### Implementation Details:
${generateSimpleLogicSummary(diff)}

**Key Implementation Points:**
- Core functionality changes detected
`;
}
