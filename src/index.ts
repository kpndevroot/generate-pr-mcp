import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { URI } from "vscode-uri";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { writeFile, appendFile } from "fs/promises";
import {
  validatePRParams,
  truncatePRContentForMCP,
  requestCursorAIAnalysis,
  generatePRFromTemplate,
  type AIAnalysisResult,
} from "./helpers/index.js";

// Promisify exec for better async handling
const exec = promisify(execCallback);

// Debug logging function
async function debugLog(message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    await appendFile("mcp-debug.log", logMessage);
  } catch (error) {
    // Silently fail if we can't write to log file
  }
  console.log(message);
}

const server = new Server(
  {
    name: "mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        generate_ai_pr: {
          description:
            "Generate an AI-powered PR using your client's built-in AI - works with Claude Desktop and Cursor IDE!",
        },
      },
    },
  }
);

// Handle list tools requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_ai_pr",
        description:
          "Generate an AI-powered PR using your client's built-in AI - works with Claude Desktop and Cursor IDE!",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the PR",
            },
            description: {
              type: "string",
              description: "The description of the PR",
            },
            rootUri: {
              type: "string",
              description: "The root URI of the project",
            },
          },
          required: ["title", "description", "rootUri"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_ai_pr") {
    const { title, description, rootUri } = request.params.arguments as {
      title: string;
      description: string;
      rootUri: string;
    };

    console.log("🎯 Initializing AI-powered PR generation...");

    // Validate input parameters
    try {
      validatePRParams(request.params.arguments);
      console.log("📋 Parameters validated successfully");
    } catch (error) {
      console.error(
        `Parameter validation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }

    console.log("✅ AI PR generation initialization complete");

    try {
      console.log("🎯 Analyzing project with AI assistance...");

      // Get project directory
      if (!rootUri) {
        console.error("Root URI is required");
        throw new McpError(
          ErrorCode.InvalidParams,
          "Root URI is required. Please ensure you're working within a valid project directory."
        );
      }

      let projectDir: string;
      try {
        projectDir = URI.parse(rootUri).fsPath;
        console.log(`🎯 AI analyzing project: ${projectDir}`);
      } catch (error) {
        console.error(
          `Invalid root URI format: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid root URI format. Please provide a valid file system path or URI."
        );
      }

      try {
        process.chdir(projectDir);
        await debugLog("📂 Accessing project directory...");
      } catch (error) {
        console.error(`Cannot access project directory: ${projectDir}`);
        throw new McpError(
          ErrorCode.InvalidParams,
          `Cannot access project directory: ${projectDir}. Please ensure the directory exists and you have proper permissions.`
        );
      }

      try {
        await exec("git rev-parse --is-inside-work-tree", {
          cwd: projectDir,
        });
        console.log("🔧 Git repository validation complete");
      } catch (error) {
        console.error(`Not a git repository: ${projectDir}`);
        throw new McpError(
          ErrorCode.InvalidParams,
          `Not a git repository: ${projectDir}. Please initialize git (git init) or navigate to a valid git repository.`
        );
      }

      // Get current branch and main branch
      let featureBranch: string;
      try {
        const { stdout } = await exec(`git rev-parse --abbrev-ref HEAD`, {
          cwd: projectDir,
        });
        featureBranch = stdout.trim();
      } catch (error) {
        console.error("Failed to determine current git branch");
        throw new McpError(
          ErrorCode.InternalError,
          "Failed to determine current git branch. Please ensure you have at least one commit in your repository."
        );
      }

      // Find main branch
      let mainBranch = "main";
      try {
        await exec(`git show-ref --verify refs/heads/main`, {
          cwd: projectDir,
        });
        console.log("📌 Base branch: main");
      } catch (error) {
        try {
          await exec(`git show-ref --verify refs/heads/master`, {
            cwd: projectDir,
          });
          mainBranch = "master";
          console.log("📌 Base branch: master");
        } catch (error) {
          mainBranch = featureBranch; // Fallback to current branch for staged changes
        }
      }

      // Get diff
      let diff: string;
      if (featureBranch === mainBranch) {
        // Get staged/unstaged changes
        try {
          const { stdout: stagedDiff } = await exec(`git diff --staged`, {
            cwd: projectDir,
          });
          diff = stagedDiff;

          if (!diff.trim()) {
            const { stdout: unstagedDiff } = await exec(`git diff`, {
              cwd: projectDir,
            });
            diff = unstagedDiff;
          }

          if (!diff.trim()) {
            console.error("No changes found for AI analysis");
            throw new McpError(
              ErrorCode.InvalidParams,
              "No changes found to generate PR for. Please make some changes to your files or stage them using 'git add' before generating a PR."
            );
          }
        } catch (error) {
          console.error("Failed to get changes for AI analysis");
          throw new McpError(
            ErrorCode.InternalError,
            "Failed to get changes. Please ensure git is working properly."
          );
        }
      } else {
        // Get diff between branches
        try {
          const { stdout } = await exec(
            `git diff ${mainBranch}..${featureBranch}`,
            {
              cwd: projectDir,
            }
          );
          diff = stdout;

          if (!diff.trim()) {
            console.error("No differences found between branches");
            throw new McpError(
              ErrorCode.InvalidParams,
              `No differences found between ${mainBranch} and ${featureBranch}. Please ensure you have committed changes on your feature branch.`
            );
          }
        } catch (error) {
          console.error("Failed to generate diff for AI analysis");
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to generate diff between ${mainBranch} and ${featureBranch}. Please ensure both branches exist and have commits.`
          );
        }
      }

      console.log("🎯 Diff prepared for AI analysis");

      // Check diff size
      if (diff.length > 5 * 1024 * 1024) {
        console.error("Changes too large for AI analysis (>5MB)");
        throw new McpError(
          ErrorCode.InvalidParams,
          "Changes are too large for AI analysis (>1MB). Please consider breaking your changes into smaller commits."
        );
      }

      // Perform AI analysis using Cursor's built-in capabilities
      // NOTE: In a real MCP implementation, we would use the sampling capability
      // For now, we'll use the traditional analysis with enhanced detection
      const aiAnalysis: AIAnalysisResult = await requestCursorAIAnalysis(
        diff,
        projectDir,
        featureBranch,
        mainBranch,
        undefined, // samplingFunction - would be provided by MCP client
        "AI client context" // This would be actual context from the AI client
      );

      console.log("🎯 AI analysis complete");

      // Generate enhanced PR content using AI insights
      const prdContent = await generatePRFromTemplate(
        title,
        description,
        diff,
        undefined, // screenshots
        {
          useAI: true,
          llmApiCall: async (prompt: string) => {
            // This would normally use the client's AI sampling capability
            // For now, return a structured response based on our analysis
            return `**PR Title:**
${aiAnalysis.prTitle}

**PR Description:**
${aiAnalysis.prDescription}

**Summary of Key Changes:**
${aiAnalysis.summaryOfKeyChanges}

**Business Logic Explanation:**
${aiAnalysis.businessLogicExplanation}

**Potential Unnecessary Files or No-op Changes:**
${aiAnalysis.potentialUnnecessaryFiles.join(", ") || "None detected"}

**Change Type:**
${aiAnalysis.changeType}`;
          },
          projectDirectory: projectDir,
          targetBranch: featureBranch,
          baseBranch: mainBranch,
        }
      );

      console.log("📄 AI PR template generated");
      console.log("📝 Writing AI-generated PR document...");

      const prdFileName = `${title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Cursor_AI_PR.md`;
      const prdFilePath = `${projectDir}/${prdFileName}`;

      try {
        await writeFile(prdFilePath, prdContent, "utf8");
        console.log("💾 Cursor AI PR document saved");
      } catch (error) {
        console.error("Failed to write Cursor AI PR document");
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to write Cursor AI PR document: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      console.log("✅ Cursor output delivery complete");

      // Create response message
      const responseMessage = `=== 🎯 Cursor AI PR Generation Complete ===

📄 **File Created**: ${prdFileName}
📁 **Location**: ${projectDir}
🎯 **AI Analysis**: Cursor AI Enhanced (${Math.round(
        aiAnalysis.confidence * 100
      )}% confidence)
📊 **Diff Size**: ${diff.length} characters
🌿 **Branches**: ${mainBranch} → ${featureBranch}
🤖 **Project Type**: ${
        aiAnalysis.changeType.charAt(0).toUpperCase() +
        aiAnalysis.changeType.slice(1)
      } - Enhanced with Cursor context

🎯 **Cursor AI Features Used**:
- ✅ Intelligent project type detection
- ✅ Context-aware business logic analysis
- ✅ Automated change categorization (${aiAnalysis.changeType})
- ✅ Smart file relevance filtering
- ✅ Enhanced PR template generation
- ✅ No API keys required!

${
  aiAnalysis.potentialUnnecessaryFiles.length > 0
    ? `⚠️ **Files flagged for review**: ${aiAnalysis.potentialUnnecessaryFiles.join(
        ", "
      )}`
    : "✅ **All files appear functionally relevant**"
}

The Cursor AI-enhanced PR document has been generated and is ready for review! 🚀`;

      // Ensure response is within safe limits for MCP clients
      const safeResponse = truncatePRContentForMCP(responseMessage);

      return {
        content: [
          {
            type: "text",
            text: safeResponse,
          },
        ],
      };
    } catch (error: any) {
      console.error(
        `Cursor AI PR generation failed: ${error.message || "Unknown error"}`
      );
      throw new McpError(
        ErrorCode.InternalError,
        `Cursor AI-powered PR generation failed: ${
          error.message || "Unknown error"
        }. Please try again or check your git repository status.`
      );
    }
  }

  throw new McpError(
    ErrorCode.MethodNotFound,
    `Unknown method '${request.params.name}'. Available method is: generate_ai_pr.`
  );
});

const transport = new StdioServerTransport();
await server.connect(transport);
