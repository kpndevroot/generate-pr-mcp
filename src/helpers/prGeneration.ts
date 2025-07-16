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
    // Always use AI-powered PR generation
    return await generateAIPoweredPR(
      title,
      description,
      diff,
      screenshots,
      options
    );
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
      metadata
    );

    // Always use AI-suggested title and description when available
    const finalTitle = aiAnalysis.prTitle ? aiAnalysis.prTitle : title;
    const finalDescription = aiAnalysis.prDescription
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
    return "";
  }
}

/**
 * Generates enhanced PR template with comprehensive AI analysis insights
 * Enhanced with detailed technical analysis sections for enterprise-grade documentation
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

${
  aiAnalysis.changeType
    ? `## 📋 Type of Change

<!-- AI-detected change type: ${aiAnalysis.changeType} -->

${getChangeTypeCheckboxes(aiAnalysis.changeType)}`
    : ""
}

${
  aiAnalysis.businessLogicExplanation
    ? `## 🔍 Changes Description

### Why It Changed:
${aiAnalysis.businessLogicExplanation}

### Implementation Details:

${aiAnalysis.businessLogicExplanation}

**Key Implementation Points:**
${generateKeyPointsFromAI(aiAnalysis)}`
    : ""
}

${
  aiAnalysis.businessLogicExplanation
    ? `## 💼 Business Logic Impact

${aiAnalysis.businessLogicExplanation}`
    : ""
}

${
  aiAnalysis.architecturalChanges
    ? `## 🏗️ Architectural Changes & Design Impact

${aiAnalysis.architecturalChanges}`
    : ""
}

${
  aiAnalysis.technicalComplexityAnalysis
    ? `## 🔍 Technical Complexity Analysis

${aiAnalysis.technicalComplexityAnalysis}`
    : ""
}

${
  aiAnalysis.securityComplianceAssessment
    ? `## 🔒 Security & Compliance Assessment

${aiAnalysis.securityComplianceAssessment}`
    : ""
}

${
  aiAnalysis.dependencyIntegrationImpact
    ? `## 📊 Dependency & Integration Impact

${aiAnalysis.dependencyIntegrationImpact}`
    : ""
}

${
  aiAnalysis.riskAssessment
    ? `## ⚠️ Risk Assessment & Recommendations

${aiAnalysis.riskAssessment}`
    : ""
}

${
  aiAnalysis.potentialUnnecessaryFiles &&
  aiAnalysis.potentialUnnecessaryFiles.length > 0
    ? `
## 🔍 File Relevance Review

The following files may contain minimal functional impact:
${aiAnalysis.potentialUnnecessaryFiles
  .map((file) => `- \`${file}\``)
  .join("\n")}`
    : ""
}

${
  hasScreenshots
    ? `## 📸 Visual Changes

### Before:
${beforeScreenshot ? `![Before Changes](${beforeScreenshot})` : ""}

### After:
${afterScreenshot ? `![After Changes](${afterScreenshot})` : ""}`
    : ""
}

${
  aiAnalysis.confidence < 0.7
    ? `> **Note**: This PR was generated with AI assistance but with lower confidence (${Math.round(
        aiAnalysis.confidence * 100
      )}%). Please review the analysis carefully.`
    : ""
}

<!-- Generated with comprehensive AI-powered analysis ${changeTypeEmoji} -->
<!-- Analysis confidence: ${Math.round(aiAnalysis.confidence * 100)}% -->
<!-- Generated on: ${new Date().toISOString()} -->`;
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
  // Convert AI analysis into implementation points based on business logic and architectural changes
  const points = [];

  // Combine analysis sources for comprehensive detection
  const analysisText = (
    aiAnalysis.businessLogicExplanation +
    " " +
    aiAnalysis.architecturalChanges +
    " " +
    aiAnalysis.technicalComplexityAnalysis
  ).toLowerCase();

  if (
    analysisText.includes("function") ||
    analysisText.includes("method") ||
    analysisText.includes("logic") ||
    analysisText.includes("algorithm")
  ) {
    points.push("- [x] Core functionality changes");
  } else {
    points.push("- [ ] Core functionality changes");
  }

  if (
    analysisText.includes("api") ||
    analysisText.includes("endpoint") ||
    analysisText.includes("route") ||
    analysisText.includes("interface")
  ) {
    points.push("- [x] API modifications");
  } else {
    points.push("- [ ] API modifications");
  }

  if (
    analysisText.includes("database") ||
    analysisText.includes("schema") ||
    analysisText.includes("model") ||
    analysisText.includes("migration")
  ) {
    points.push("- [x] Database schema updates");
  } else {
    points.push("- [ ] Database schema updates");
  }

  if (
    analysisText.includes("config") ||
    analysisText.includes("setting") ||
    analysisText.includes("environment") ||
    analysisText.includes("parameter")
  ) {
    points.push("- [x] Configuration changes");
  } else {
    points.push("- [ ] Configuration changes");
  }

  if (
    analysisText.includes("integration") ||
    analysisText.includes("dependency") ||
    analysisText.includes("third-party") ||
    analysisText.includes("external")
  ) {
    points.push("- [x] Third-party integrations");
  } else {
    points.push("- [ ] Third-party integrations");
  }

  return points.join("\n");
}
