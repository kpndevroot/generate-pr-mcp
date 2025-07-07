/**
 * Cursor AI Integration for MCP
 * Leverages Cursor's built-in AI capabilities through MCP sampling
 * No API keys or external configuration required!
 */

import {
  generateAIAnalysisPrompt,
  parseAIAnalysisResponse,
  cleanDiffForAI,
  type ProjectMetadata,
  type AIAnalysisResult,
} from "./aiAnalysis.js";

/**
 * Interface for MCP sampling capabilities
 * This allows us to request AI analysis from the MCP client (Cursor)
 */
export interface MCPSamplingRequest {
  method: string;
  maxTokens?: number;
  stopSequences?: string[];
  temperature?: number;
  includeContext?: string;
}

/**
 * Analyzes code changes using Cursor's AI through MCP sampling
 * This is much easier for users - no API keys needed!
 */
export async function analyzeWithCursorAI(
  diff: string,
  metadata: ProjectMetadata,
  samplingFunction?: (
    prompt: string,
    options?: MCPSamplingRequest
  ) => Promise<string>
): Promise<AIAnalysisResult> {
  try {
    // If no sampling function provided, fall back to traditional analysis
    if (!samplingFunction) {
      console.log("📝 Cursor AI not available, using traditional analysis");
      return generateFallbackAnalysis(diff, metadata);
    }

    // Clean the diff for AI processing
    const cleanedDiff = cleanDiffForAI(diff);

    // Generate the AI analysis prompt using our template
    const prompt = generateAIAnalysisPrompt(cleanedDiff, metadata);

    // Request analysis from Cursor's AI through MCP sampling
    const aiResponse = await samplingFunction(prompt, {
      method: "cursor-ai-analysis",
      maxTokens: 2000,
      temperature: 0.3,
      stopSequences: ["---", "END_ANALYSIS"],
      includeContext: "code-analysis",
    });

    // Parse the AI response into structured data
    const result = parseAIAnalysisResponse(aiResponse);

    // Mark as high confidence since it's from Cursor's AI
    result.confidence = 0.9;

    return result;
  } catch (error) {
    console.error("Error in Cursor AI analysis:", error);
    console.log("🔄 Falling back to traditional analysis");
    return generateFallbackAnalysis(diff, metadata);
  }
}

/**
 * Enhanced project type detection that works with Cursor's context
 */
export function detectProjectTypeWithContext(
  diff: string,
  projectDir: string,
  cursorContext?: string
): string {
  try {
    // If Cursor provides context about the project, use it
    if (cursorContext) {
      const contextLower = cursorContext.toLowerCase();

      // Check Cursor's understanding of the project
      if (contextLower.includes("react") || contextLower.includes("jsx")) {
        return "React Frontend Application";
      } else if (
        contextLower.includes("next.js") ||
        contextLower.includes("nextjs")
      ) {
        return "Next.js Full-stack Application";
      } else if (
        contextLower.includes("node.js") ||
        contextLower.includes("express")
      ) {
        return "Node.js Backend Application";
      } else if (
        contextLower.includes("typescript") ||
        contextLower.includes("ts")
      ) {
        return "TypeScript Application";
      } else if (
        contextLower.includes("python") ||
        contextLower.includes("django") ||
        contextLower.includes("flask")
      ) {
        return "Python Web Application";
      } else if (
        contextLower.includes("java") ||
        contextLower.includes("spring")
      ) {
        return "Java Enterprise Application";
      }
    }

    // Fall back to diff-based detection
    const diffLower = diff.toLowerCase();

    // Enhanced detection based on file patterns in diff
    if (
      diffLower.includes("package.json") ||
      diffLower.includes("node_modules")
    ) {
      if (
        diffLower.includes("react") ||
        diffLower.includes("jsx") ||
        diffLower.includes("tsx")
      ) {
        return "React Frontend Application";
      } else if (diffLower.includes("next") || diffLower.includes("nuxt")) {
        return "Full-stack Framework Application";
      } else if (
        diffLower.includes("express") ||
        diffLower.includes("fastify") ||
        diffLower.includes("koa")
      ) {
        return "Node.js Backend Application";
      } else if (
        diffLower.includes("typescript") ||
        diffLower.includes('.ts"')
      ) {
        return "TypeScript Application";
      } else {
        return "Node.js Application";
      }
    }

    // Check for other project types
    if (
      diffLower.includes("requirements.txt") ||
      diffLower.includes("pyproject.toml") ||
      diffLower.includes('.py"')
    ) {
      if (
        diffLower.includes("django") ||
        diffLower.includes("flask") ||
        diffLower.includes("fastapi")
      ) {
        return "Python Web Application";
      } else {
        return "Python Application";
      }
    }

    if (
      diffLower.includes("pom.xml") ||
      diffLower.includes("build.gradle") ||
      diffLower.includes('.java"')
    ) {
      return "Java Application";
    }

    if (
      diffLower.includes(".csproj") ||
      diffLower.includes(".sln") ||
      diffLower.includes('.cs"')
    ) {
      return ".NET Application";
    }

    if (diffLower.includes("go.mod") || diffLower.includes('.go"')) {
      return "Go Application";
    }

    if (diffLower.includes("cargo.toml") || diffLower.includes('.rs"')) {
      return "Rust Application";
    }

    // Mobile detection
    if (
      diffLower.includes("ios") ||
      diffLower.includes('.swift"') ||
      diffLower.includes("xcode")
    ) {
      return "iOS Mobile Application";
    } else if (
      diffLower.includes("android") ||
      diffLower.includes('.kt"') ||
      diffLower.includes('.java"')
    ) {
      return "Android Mobile Application";
    } else if (diffLower.includes("flutter") || diffLower.includes('.dart"')) {
      return "Flutter Mobile Application";
    }

    return "Software Project";
  } catch (error) {
    console.warn("Error in project type detection:", error);
    return "Software Project";
  }
}


/**
 * Fallback analysis when Cursor AI is not available
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

  // Smart change type detection
  let changeType = "refactor";
  const diffLower = diff.toLowerCase();

  if (
    diffLower.includes("test") ||
    diffLower.includes("spec") ||
    diffLower.includes(".test.")
  ) {
    changeType = "testing";
  } else if (
    diffLower.includes("readme") ||
    diffLower.includes(".md") ||
    diffLower.includes("doc")
  ) {
    changeType = "docs";
  } else if (
    diffLower.includes("fix") ||
    diffLower.includes("bug") ||
    diffLower.includes("error")
  ) {
    changeType = "bugfix";
  } else if (
    diffLower.includes("security") ||
    diffLower.includes("auth") ||
    diffLower.includes("permission")
  ) {
    changeType = "security";
  } else if (
    diffLower.includes("performance") ||
    diffLower.includes("optimize") ||
    diffLower.includes("cache")
  ) {
    changeType = "performance";
  } else if (addedLines > removedLines * 2) {
    changeType = "feature";
  } else if (
    diffLower.includes("style") ||
    diffLower.includes("css") ||
    diffLower.includes("format")
  ) {
    changeType = "style";
  }

  // Detect unnecessary files
  const unnecessaryFiles = modifiedFiles.filter(
    (file) =>
      file.includes("package-lock.json") ||
      file.includes("yarn.lock") ||
      file.includes(".log") ||
      file.endsWith(".min.js") ||
      file.includes("dist/") ||
      file.includes("build/")
  );

  return {
    prTitle: `${
      changeType.charAt(0).toUpperCase() + changeType.slice(1)
    }: Update ${metadata.projectType}`,
    prDescription: `This PR includes changes to ${modifiedFiles.length} files with ${addedLines} additions and ${removedLines} deletions. The changes improve the ${metadata.projectType} functionality.`,
    summaryOfKeyChanges: `• Modified ${modifiedFiles.length} files\n• Added ${addedLines} lines of code\n• Removed ${removedLines} lines of code\n• Updated core functionality`,
    businessLogicExplanation: `These changes enhance the ${metadata.projectType} by improving code quality and functionality. The modifications affect core business logic and should improve user experience.`,
    architecturalChanges: `Structural modifications detected in ${metadata.projectType} components. The changes maintain existing architecture while improving implementation details.`,
    potentialUnnecessaryFiles: unnecessaryFiles,
    changeType,
    confidence: 0.7, // Good confidence for structured fallback
  };
}

/**
 * Helper function to request AI analysis from Cursor through MCP
 * This is the main function that other parts of the app should use
 */
export async function requestCursorAIAnalysis(
  diff: string,
  projectDir: string,
  targetBranch: string = "main",
  baseBranch: string = "HEAD",
  samplingFunction?: (
    prompt: string,
    options?: MCPSamplingRequest
  ) => Promise<string>,
  cursorContext?: string
): Promise<AIAnalysisResult> {
  // Detect project type with Cursor context
  const projectType = detectProjectTypeWithContext(
    diff,
    projectDir,
    cursorContext
  );

  // Prepare metadata
  const metadata: ProjectMetadata = {
    projectType,
    targetBranch,
    baseBranch,
  };

  // Use Cursor AI for analysis
  return await analyzeWithCursorAI(diff, metadata, samplingFunction);
}
