import processDiffForPreview from "./index.js";
import {
  generatePRMarkdown,
  generateFallbackPRMarkdown,
} from "../templates/pr-template.js";
import {
  detectProjectType,
  analyzeCodeChangesWithAI,
  type ProjectMetadata,
  type AIAnalysisResult,
} from "./aiAnalysis.js";

/**
 * Enhanced PR generation options
 */
export interface PRGenerationOptions {
  useAI?: boolean;
  llmApiCall?: (prompt: string) => Promise<string>;
  projectDirectory?: string;
  targetBranch?: string;
  baseBranch?: string;
}

/**
 * Helper function to load and populate the PR template
 * @param title PR title
 * @param description PR description
 * @param diff Git diff content
 * @param screenshots Optional screenshots for visual changes
 * @param options Optional AI analysis and configuration
 * @returns Generated PR markdown content
 */
export async function generatePRFromTemplate(
  title: string,
  description: string,
  diff: string,
  screenshots?: { before?: string; after?: string },
  options?: PRGenerationOptions
): Promise<string> {
  try {
    // If AI analysis is requested and available
    if (options?.useAI && options?.llmApiCall) {
      return await generateAIPoweredPR(
        title,
        description,
        diff,
        screenshots,
        options
      );
    }

    // Fallback to traditional analysis
    return await generateTraditionalPR(title, description, diff, screenshots);
  } catch (error) {
    console.error("Error in PR generation:", error);
    // Ultimate fallback to simple template
    return generateFallbackPRMarkdown(title, description, diff);
  }
}

/**
 * Generates PR using AI-powered analysis
 */
async function generateAIPoweredPR(
  title: string,
  description: string,
  diff: string,
  screenshots?: { before?: string; after?: string },
  options?: PRGenerationOptions
): Promise<string> {
  try {
    // Detect project type
    const projectType = detectProjectType(
      diff,
      options?.projectDirectory || ""
    );

    // Prepare metadata for AI analysis
    const metadata: ProjectMetadata = {
      projectType,
      targetBranch: options?.targetBranch || "main",
      baseBranch: options?.baseBranch || "HEAD",
    };

    // Perform AI analysis
    const aiAnalysis: AIAnalysisResult = await analyzeCodeChangesWithAI(
      diff,
      metadata,
      options?.llmApiCall
    );

    // Use AI-suggested title and description if confidence is high
    const finalTitle =
      aiAnalysis.confidence > 0.7 && aiAnalysis.prTitle
        ? aiAnalysis.prTitle
        : title;

    const finalDescription =
      aiAnalysis.confidence > 0.7 && aiAnalysis.prDescription
        ? aiAnalysis.prDescription
        : description;

    // Generate enhanced PR template with AI insights
    return generateEnhancedPRMarkdown(
      finalTitle,
      finalDescription,
      diff,
      aiAnalysis,
      screenshots
    );
  } catch (error) {
    console.error(
      "Error in AI-powered PR generation, falling back to traditional:",
      error
    );
    return await generateTraditionalPR(title, description, diff, screenshots);
  }
}

/**
 * Generates PR using traditional analysis
 */
async function generateTraditionalPR(
  title: string,
  description: string,
  diff: string,
  screenshots?: { before?: string; after?: string }
): Promise<string> {
  // Generate markdown content using the existing modular template
  const { changesSummary, mainLogicChanges } = processDiffForPreview(diff);

  return generatePRMarkdown(
    title,
    description,
    changesSummary,
    mainLogicChanges,
    diff,
    screenshots
  );
}

/**
 * Generates enhanced PR template with AI analysis insights
 */
function generateEnhancedPRMarkdown(
  title: string,
  description: string,
  diff: string,
  aiAnalysis: AIAnalysisResult,
  screenshots?: { before?: string; after?: string }
): string {
  try {
    // Handle screenshots safely
    const hasScreenshots =
      screenshots && (screenshots.before || screenshots.after);
    const beforeScreenshot = screenshots?.before || "";
    const afterScreenshot = screenshots?.after || "";

    // Determine change type emoji
    const changeTypeEmoji = getChangeTypeEmoji(aiAnalysis.changeType);

    // Generate confidence indicator
    const confidenceIndicator = getConfidenceIndicator(aiAnalysis.confidence);

    return `# ${title}

${confidenceIndicator}

## 🎯 Overview

${description}

## 📋 Type of Change

<!-- AI-detected change type: ${aiAnalysis.changeType} -->

${getChangeTypeCheckboxes(aiAnalysis.changeType)}

## 🔍 Changes Description

### What Changed:
${aiAnalysis.summaryOfKeyChanges}

### Why It Changed:
${aiAnalysis.businessLogicExplanation}

### Implementation Details:

<!-- AI-Enhanced Analysis -->
${aiAnalysis.businessLogicExplanation}

**Key Implementation Points:**
${generateKeyPointsFromAI(aiAnalysis)}

${
  aiAnalysis.potentialUnnecessaryFiles.length > 0
    ? `
## ⚠️ Potential Unnecessary Changes

The following files may contain minimal functional impact:
${aiAnalysis.potentialUnnecessaryFiles
  .map((file) => `- \`${file}\``)
  .join("\n")}

*Please review these files to confirm if they're essential for this PR.*
`
    : ""
}

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
    ? `![Before Changes](${beforeScreenshot})`
    : "_No before screenshot provided_"
}

### After:
${
  afterScreenshot
    ? `![After Changes](${afterScreenshot})`
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

${
  aiAnalysis.confidence < 0.7
    ? `
> **Note**: This PR was generated with AI assistance but with lower confidence (${Math.round(
        aiAnalysis.confidence * 100
      )}%). Please review the analysis carefully.
`
    : ""
}

---

## 👥 Reviewers Guide

1. Check implementation approach
2. Verify test coverage  
3. Review documentation updates
4. Consider performance implications
${
  aiAnalysis.potentialUnnecessaryFiles.length > 0
    ? `5. Review flagged files for necessity`
    : ""
}

<!-- Generated with AI-powered analysis ${changeTypeEmoji} -->
`;
  } catch (error) {
    console.error("Error generating enhanced PR markdown:", error);
    // Fallback to regular template
    return generatePRMarkdown(title, description, "", "", diff, screenshots);
  }
}

/**
 * Helper functions for enhanced template generation
 */
function getChangeTypeEmoji(changeType: string): string {
  const emojiMap: Record<string, string> = {
    bugfix: "🐛",
    feature: "✨",
    refactor: "♻️",
    docs: "📚",
    performance: "⚡",
    security: "🔒",
    testing: "🧪",
    style: "💄",
    chore: "🔧",
  };
  return emojiMap[changeType.toLowerCase()] || "🔄";
}

function getConfidenceIndicator(confidence: number): string {
  if (confidence >= 0.9) {
    return "<!-- 🤖 High-confidence AI analysis -->";
  } else if (confidence >= 0.7) {
    return "<!-- 🤖 AI-assisted analysis -->";
  } else {
    return "<!-- 🤖 AI analysis with manual review recommended -->";
  }
}

function getChangeTypeCheckboxes(changeType: string): string {
  const types = [
    {
      key: "bugfix",
      label: "🐛 Bug fix (non-breaking change which fixes an issue)",
    },
    {
      key: "feature",
      label: "✨ New feature (non-breaking change which adds functionality)",
    },
    {
      key: "breaking",
      label:
        "💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)",
    },
    { key: "docs", label: "📚 Documentation update" },
    {
      key: "refactor",
      label: "♻️ Code refactoring (no functional changes, no api changes)",
    },
    { key: "performance", label: "⚡ Performance improvements" },
  ];

  return types
    .map((type) => {
      const isChecked = type.key === changeType.toLowerCase() ? "[x]" : "[ ]";
      return `- ${isChecked} ${type.label}`;
    })
    .join("\n");
}

function generateKeyPointsFromAI(aiAnalysis: AIAnalysisResult): string {
  // Convert AI analysis into implementation points
  const points = [];

  if (
    aiAnalysis.summaryOfKeyChanges.includes("function") ||
    aiAnalysis.summaryOfKeyChanges.includes("method")
  ) {
    points.push("- [x] Core functionality changes");
  } else {
    points.push("- [ ] Core functionality changes");
  }

  if (
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("api") ||
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("endpoint")
  ) {
    points.push("- [x] API modifications");
  } else {
    points.push("- [ ] API modifications");
  }

  if (
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("database") ||
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("schema")
  ) {
    points.push("- [x] Database schema updates");
  } else {
    points.push("- [ ] Database schema updates");
  }

  if (
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("config") ||
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("setting")
  ) {
    points.push("- [x] Configuration changes");
  } else {
    points.push("- [ ] Configuration changes");
  }

  if (
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("integration") ||
    aiAnalysis.summaryOfKeyChanges.toLowerCase().includes("dependency")
  ) {
    points.push("- [x] Third-party integrations");
  } else {
    points.push("- [ ] Third-party integrations");
  }

  return points.join("\n");
}
