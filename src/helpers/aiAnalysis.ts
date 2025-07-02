/**
 * AI-powered code change analysis using the LLM prompt template
 * Provides intelligent PR summaries with business logic understanding
 */

export interface ProjectMetadata {
  projectType: string;
  targetBranch: string;
  baseBranch: string;
}

export interface AIAnalysisResult {
  prTitle: string;
  prDescription: string;
  summaryOfKeyChanges: string;
  businessLogicExplanation: string;
  potentialUnnecessaryFiles: string[];
  changeType: string;
  confidence: number;
}

/**
 * Detects project type based on file structure and dependencies
 */
export function detectProjectType(diff: string, projectDir: string): string {
  try {
    const diffLower = diff.toLowerCase();

    // Check for package.json to identify Node.js projects
    if (
      diffLower.includes("package.json") ||
      diffLower.includes("node_modules")
    ) {
      if (
        diffLower.includes("react") ||
        diffLower.includes("jsx") ||
        diffLower.includes("tsx")
      ) {
        return "React Frontend";
      } else if (
        diffLower.includes("express") ||
        diffLower.includes("fastify") ||
        diffLower.includes("koa")
      ) {
        return "Node.js Backend";
      } else if (diffLower.includes("next") || diffLower.includes("nuxt")) {
        return "Full-stack Framework";
      } else {
        return "Node.js Application";
      }
    }

    // Check for Python projects
    if (
      diffLower.includes("requirements.txt") ||
      diffLower.includes("pyproject.toml") ||
      diffLower.includes("setup.py") ||
      diffLower.includes(".py")
    ) {
      if (
        diffLower.includes("django") ||
        diffLower.includes("flask") ||
        diffLower.includes("fastapi")
      ) {
        return "Python Web Backend";
      } else if (
        diffLower.includes("jupyter") ||
        diffLower.includes("pandas") ||
        diffLower.includes("numpy")
      ) {
        return "Python Data Science";
      } else {
        return "Python Application";
      }
    }

    // Check for Java projects
    if (
      diffLower.includes("pom.xml") ||
      diffLower.includes("build.gradle") ||
      diffLower.includes(".java")
    ) {
      if (diffLower.includes("spring") || diffLower.includes("springboot")) {
        return "Java Spring Backend";
      } else {
        return "Java Application";
      }
    }

    // Check for .NET projects
    if (
      diffLower.includes(".csproj") ||
      diffLower.includes(".sln") ||
      diffLower.includes(".cs")
    ) {
      return ".NET Application";
    }

    // Check for Go projects
    if (
      diffLower.includes("go.mod") ||
      diffLower.includes("go.sum") ||
      diffLower.includes(".go")
    ) {
      return "Go Application";
    }

    // Check for Rust projects
    if (diffLower.includes("cargo.toml") || diffLower.includes(".rs")) {
      return "Rust Application";
    }

    // Check for mobile projects
    if (
      diffLower.includes("ios") ||
      diffLower.includes(".swift") ||
      diffLower.includes("xcode")
    ) {
      return "iOS Mobile App";
    } else if (
      diffLower.includes("android") ||
      diffLower.includes(".kt") ||
      diffLower.includes(".java")
    ) {
      return "Android Mobile App";
    } else if (diffLower.includes("flutter") || diffLower.includes(".dart")) {
      return "Flutter Mobile App";
    }

    // Default fallback
    return "Software Project";
  } catch (error) {
    console.warn("Error detecting project type:", error);
    return "Software Project";
  }
}

/**
 * Generates the AI analysis prompt with populated template variables
 */
export function generateAIAnalysisPrompt(
  gitDiff: string,
  metadata: ProjectMetadata
): string {
  return `# 🧠 AI-Powered Code Change Analysis

You are an expert software architect and reviewer. Analyze the following git diff and provide a comprehensive summary for a pull request. Go beyond line-by-line changes and explain the higher-level intent and business logic.

## 🔍 Goals:
- Summarize what changed and why (intent)
- Describe the impact on business logic
- Identify key functions/classes affected
- Suggest files or code blocks that may be unrelated or unnecessary
- Classify the type of change (bugfix, refactor, feature, docs, etc.)
- Recommend a possible PR title and description

## 📂 Project Metadata:
- Project type: ${metadata.projectType}
- Target branch: \`${metadata.targetBranch}\`
- Base branch: \`${metadata.baseBranch}\`

## 📝 Code Diff:
\`\`\`diff
${gitDiff}
\`\`\`

Now return the output in the following structure:

**PR Title:**
[Provide a concise, descriptive title]

**PR Description:**
[Provide a comprehensive description explaining the changes and their purpose]

**Summary of Key Changes:**
[List the main changes made in bullet points]

**Business Logic Explanation:**
[Explain how these changes affect the application's business logic and user experience]

**Potential Unnecessary Files or No-op Changes:**
[List any files that seem to have minimal or no functional impact]

**Change Type:**
[Classify as: bugfix, feature, refactor, docs, performance, security, etc.]`;
}

/**
 * Parses the AI response into structured data
 */
export function parseAIAnalysisResponse(response: string): AIAnalysisResult {
  try {
    const sections = response.split("**").filter((section) => section.trim());

    const result: AIAnalysisResult = {
      prTitle: "",
      prDescription: "",
      summaryOfKeyChanges: "",
      businessLogicExplanation: "",
      potentialUnnecessaryFiles: [],
      changeType: "",
      confidence: 0.8, // Default confidence
    };

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();

      if (section.startsWith("PR Title:")) {
        result.prTitle = section.replace("PR Title:", "").trim();
      } else if (section.startsWith("PR Description:")) {
        result.prDescription = section.replace("PR Description:", "").trim();
      } else if (section.startsWith("Summary of Key Changes:")) {
        result.summaryOfKeyChanges = section
          .replace("Summary of Key Changes:", "")
          .trim();
      } else if (section.startsWith("Business Logic Explanation:")) {
        result.businessLogicExplanation = section
          .replace("Business Logic Explanation:", "")
          .trim();
      } else if (section.startsWith("Potential Unnecessary Files")) {
        const filesText = section
          .replace(/Potential Unnecessary Files[^:]*:/, "")
          .trim();
        // Parse bullet points or comma-separated files
        result.potentialUnnecessaryFiles = filesText
          .split(/[,\n-]/)
          .map((file) => file.trim())
          .filter((file) => file.length > 0);
      } else if (section.startsWith("Change Type:")) {
        result.changeType = section.replace("Change Type:", "").trim();
      }
    }

    return result;
  } catch (error) {
    console.error("Error parsing AI analysis response:", error);
    return {
      prTitle: "Code Changes",
      prDescription: "Multiple code changes detected",
      summaryOfKeyChanges: "Various file modifications",
      businessLogicExplanation: "Business logic impact analysis unavailable",
      potentialUnnecessaryFiles: [],
      changeType: "refactor",
      confidence: 0.3,
    };
  }
}

/**
 * Filters out large binary files and unnecessary content from diff
 */
export function cleanDiffForAI(diff: string): string {
  try {
    const lines = diff.split("\n");
    const cleanedLines: string[] = [];
    let skipBinaryFile = false;

    for (const line of lines) {
      // Skip binary files
      if (line.includes("Binary files") || line.includes("GIT binary patch")) {
        skipBinaryFile = true;
        continue;
      }

      // Reset binary file flag on new file
      if (line.startsWith("diff --git")) {
        skipBinaryFile = false;
      }

      if (skipBinaryFile) continue;

      // Skip very long lines (likely minified code or generated content)
      if (line.length > 500) continue;

      // Skip package-lock.json and yarn.lock changes (too verbose)
      if (line.includes("package-lock.json") || line.includes("yarn.lock")) {
        skipBinaryFile = true;
        continue;
      }

      cleanedLines.push(line);
    }

    const cleanedDiff = cleanedLines.join("\n");

    // Limit total size to prevent token overflow (approximate 100KB limit)
    if (cleanedDiff.length > 100000) {
      return (
        cleanedDiff.substring(0, 100000) +
        "\n\n... (diff truncated for analysis)"
      );
    }

    return cleanedDiff;
  } catch (error) {
    console.error("Error cleaning diff for AI:", error);
    return diff;
  }
}

/**
 * Main function to perform AI-powered analysis of code changes
 * This would integrate with your preferred LLM API (OpenAI, Anthropic, etc.)
 */
export async function analyzeCodeChangesWithAI(
  diff: string,
  metadata: ProjectMetadata,
  llmApiCall?: (prompt: string) => Promise<string>
): Promise<AIAnalysisResult> {
  try {
    // Clean the diff for AI processing
    const cleanedDiff = cleanDiffForAI(diff);

    // Generate the analysis prompt
    const prompt = generateAIAnalysisPrompt(cleanedDiff, metadata);

    // If no LLM API provided, return a structured fallback analysis
    if (!llmApiCall) {
      return generateFallbackAnalysis(diff, metadata);
    }

    // Call the LLM API
    const aiResponse = await llmApiCall(prompt);

    // Parse and return the structured result
    return parseAIAnalysisResponse(aiResponse);
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return generateFallbackAnalysis(diff, metadata);
  }
}

/**
 * Generates a fallback analysis when AI is not available
 */
function generateFallbackAnalysis(
  diff: string,
  metadata: ProjectMetadata
): AIAnalysisResult {
  const lines = diff.split("\n");
  const addedLines = lines.filter((line) => line.startsWith("+")).length;
  const removedLines = lines.filter((line) => line.startsWith("-")).length;
  const modifiedFiles = [
    ...new Set(
      lines
        .filter((line) => line.startsWith("diff --git"))
        .map((line) => line.split(" ")[3]?.replace("b/", "") || "")
        .filter((file) => file)
    ),
  ];

  // Determine change type based on patterns
  let changeType = "refactor";
  if (diff.includes("test") || diff.includes("spec")) {
    changeType = "testing";
  } else if (diff.includes("README") || diff.includes(".md")) {
    changeType = "docs";
  } else if (diff.includes("fix") || diff.includes("bug")) {
    changeType = "bugfix";
  } else if (addedLines > removedLines * 2) {
    changeType = "feature";
  }

  return {
    prTitle: `${
      changeType.charAt(0).toUpperCase() + changeType.slice(1)
    }: Update ${metadata.projectType.toLowerCase()}`,
    prDescription: `This PR includes changes to ${modifiedFiles.length} files with ${addedLines} additions and ${removedLines} deletions.`,
    summaryOfKeyChanges: `• Modified ${modifiedFiles.length} files\n• Added ${addedLines} lines\n• Removed ${removedLines} lines`,
    businessLogicExplanation: `Changes affect core functionality in ${metadata.projectType.toLowerCase()} project.`,
    potentialUnnecessaryFiles: modifiedFiles.filter(
      (file) =>
        file.includes("lock") ||
        file.includes("log") ||
        file.endsWith(".min.js")
    ),
    changeType,
    confidence: 0.6,
  };
}
