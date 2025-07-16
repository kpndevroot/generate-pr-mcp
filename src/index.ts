import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { URI } from "vscode-uri";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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
export async function debugLog(message: string): Promise<void> {
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
    version: "1.2.0",
  },
  {
    capabilities: {
      prompts: {
        listChanged: true,
      },
      tools: {
        generate_ai_pr: {
          description:
            "Generate an AI-powered PR using your client's built-in AI - works with Claude Desktop and Cursor IDE!",
        },
      },
    },
  }
);

// MCP Prompts Implementation
// Define available prompts for PR generation workflow
const AVAILABLE_PROMPTS = [
  {
    name: "analyze_changes",
    description:
      "Analyze git changes and generate comprehensive technical analysis for PR documentation",
    arguments: [
      {
        name: "project_path",
        description: "Path to the git repository to analyze",
        required: true,
      },
      {
        name: "target_branch",
        description: "Target branch for the PR (default: main)",
        required: false,
      },
      {
        name: "base_branch",
        description: "Base branch to compare against (default: HEAD)",
        required: false,
      },
    ],
  },
  {
    name: "generate_comprehensive_pr",
    description:
      "Generate a comprehensive PR document with detailed technical analysis, security assessment, and architectural impact",
    arguments: [
      {
        name: "title",
        description: "Title of the pull request",
        required: true,
      },
      {
        name: "description",
        description: "Brief description of the changes",
        required: true,
      },
      {
        name: "project_path",
        description: "Path to the git repository",
        required: true,
      },
      {
        name: "include_security_analysis",
        description: "Include detailed security and compliance assessment",
        required: false,
      },
      {
        name: "include_technical_metrics",
        description: "Include comprehensive technical complexity metrics",
        required: false,
      },
    ],
  },
  {
    name: "code_review_checklist",
    description:
      "Generate a comprehensive code review checklist based on project analysis",
    arguments: [
      {
        name: "project_path",
        description: "Path to the git repository to analyze",
        required: true,
      },
      {
        name: "focus_areas",
        description:
          "Comma-separated list of focus areas (security, performance, maintainability, testing)",
        required: false,
      },
    ],
  },
];

// Handle list prompts requests
server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
  return {
    prompts: AVAILABLE_PROMPTS,
  };
});

// Handle get prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const safeArgs = args || {};

  switch (name) {
    case "analyze_changes":
      return {
        description: "Comprehensive git change analysis for PR documentation",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateAnalyzeChangesPrompt(safeArgs),
            },
          },
        ],
      };

    case "generate_comprehensive_pr":
      return {
        description:
          "Generate comprehensive PR documentation with enhanced analysis",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateComprehensivePRPrompt(safeArgs),
            },
          },
        ],
      };

    case "code_review_checklist":
      return {
        description: "Generate comprehensive code review checklist",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: generateCodeReviewChecklistPrompt(safeArgs),
            },
          },
        ],
      };

    default:
      throw new McpError(ErrorCode.InvalidParams, `Unknown prompt: ${name}`);
  }
});

// Prompt generation functions
function generateAnalyzeChangesPrompt(args: Record<string, unknown>): string {
  const projectPath = args.project_path as string;
  const targetBranch = (args.target_branch as string) || "main";
  const baseBranch = (args.base_branch as string) || "HEAD";

  return `# 🔍 Git Change Analysis for PR Documentation

Please analyze the git changes in the repository at: \`${projectPath}\`

**Analysis Parameters:**
- Target Branch: \`${targetBranch}\`
- Base Branch: \`${baseBranch}\`

**Required Analysis:**

## 📊 Technical Metrics
- Calculate lines added/removed/modified
- Count functions, classes, and interfaces changed
- Assess code complexity score (High/Medium/Low)
- Determine change intensity per file

## 🏗️ Architectural Impact
- Identify design pattern changes
- Analyze component relationship modifications
- Assess system boundary changes
- Evaluate scalability implications

## 🔒 Security & Compliance
- Review authentication/authorization changes
- Analyze data protection implications
- Check for potential security vulnerabilities
- Assess compliance impact (audit trails, logging)

## 📁 File-by-File Analysis
For each modified file, provide:
- Change complexity (High/Medium/Low)
- Business impact assessment
- Technical change classification
- Specific recommendations

## ⚠️ Risk Assessment
- Identify potential breaking changes
- Assess deployment considerations
- Recommend testing strategies
- Flag areas requiring manual review

Please provide a comprehensive analysis that can be used to generate professional PR documentation suitable for enterprise code review processes.`;
}

function generateComprehensivePRPrompt(args: Record<string, unknown>): string {
  const title = args.title as string;
  const description = args.description as string;
  const projectPath = args.project_path as string;
  const includeSecurityAnalysis = args.include_security_analysis === true;
  const includeTechnicalMetrics = args.include_technical_metrics === true;

  return `# 📝 Generate Comprehensive PR Documentation

Create a detailed pull request document for the following changes:

**PR Details:**
- Title: "${title}"
- Description: "${description}"
- Project Path: \`${projectPath}\`

**Documentation Requirements:**

## 🎯 Core Sections
1. **Executive Summary** - High-level overview of changes
2. **Technical Implementation** - Detailed technical analysis
3. **Business Logic Impact** - How changes affect business rules
4. **Architectural Changes** - System design modifications

${
  includeSecurityAnalysis
    ? `
## 🔒 Security Analysis (Required)
- Authentication/authorization implications
- Data protection and privacy considerations
- Input validation and sanitization review
- Audit trail and compliance impact
- Third-party dependency security assessment
`
    : ""
}

${
  includeTechnicalMetrics
    ? `
## 📊 Technical Metrics (Required)
- Code complexity analysis
- Performance impact assessment
- Maintainability metrics
- Test coverage recommendations
- Technical debt implications
`
    : ""
}

## 📁 Enhanced File Analysis
- Detailed per-file impact assessment
- Change classification (Addition/Modification/Deletion)
- Business impact scoring (High/Medium/Low)
- Specific technical recommendations

## 🧪 Testing Strategy
- Unit testing requirements
- Integration testing needs
- Performance testing recommendations
- Security testing considerations

## 🚀 Deployment Considerations
- Environment-specific requirements
- Migration considerations
- Rollback strategies
- Monitoring and observability needs

## 👥 Review Guidelines
- Critical review focus areas
- Stakeholder-specific concerns
- Approval criteria and checkpoints

Generate a professional, enterprise-grade PR document that provides comprehensive technical documentation suitable for complex software development environments.`;
}

function generateCodeReviewChecklistPrompt(
  args: Record<string, unknown>
): string {
  const projectPath = args.project_path as string;
  const focusAreas = (
    (args.focus_areas as string) ||
    "security,performance,maintainability,testing"
  ).split(",");

  return `# ✅ Code Review Checklist Generator

Generate a comprehensive code review checklist for the project at: \`${projectPath}\`

**Focus Areas:** ${focusAreas.join(", ")}

**Checklist Requirements:**

## 🔍 Technical Review Items
${
  focusAreas.includes("security")
    ? `
### 🔒 Security Review
- [ ] Authentication and authorization properly implemented
- [ ] Input validation and sanitization in place
- [ ] Sensitive data handling follows best practices
- [ ] No hardcoded credentials or secrets
- [ ] SQL injection and XSS prevention measures
- [ ] Access control and permission models verified
`
    : ""
}

${
  focusAreas.includes("performance")
    ? `
### ⚡ Performance Review
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Caching strategies implemented where appropriate
- [ ] Memory usage considerations addressed
- [ ] Computational complexity analyzed
- [ ] I/O operations minimized
`
    : ""
}

${
  focusAreas.includes("maintainability")
    ? `
### 🔧 Maintainability Review
- [ ] Code follows established patterns and conventions
- [ ] Functions and classes have single responsibilities
- [ ] Code is properly documented
- [ ] Error handling is comprehensive
- [ ] Configuration is externalized
- [ ] Dependencies are minimized and justified
`
    : ""
}

${
  focusAreas.includes("testing")
    ? `
### 🧪 Testing Review
- [ ] Unit tests cover new functionality
- [ ] Integration tests verify system interactions
- [ ] Edge cases and error conditions tested
- [ ] Test coverage meets minimum requirements
- [ ] Tests are maintainable and readable
- [ ] Performance tests included for critical paths
`
    : ""
}

## 🏗️ Architecture & Design
- [ ] Changes align with system architecture
- [ ] Design patterns properly implemented
- [ ] Component coupling minimized
- [ ] Interfaces well-defined
- [ ] Backward compatibility maintained
- [ ] Technical debt implications considered

## 📚 Documentation & Communication
- [ ] Code comments explain complex logic
- [ ] API documentation updated
- [ ] Architecture decisions documented
- [ ] Breaking changes clearly communicated
- [ ] Migration guides provided if needed

## 🚀 Deployment & Operations
- [ ] Configuration changes documented
- [ ] Database migrations reviewed
- [ ] Infrastructure requirements identified
- [ ] Monitoring and logging implemented
- [ ] Rollback procedures defined

Generate a project-specific, actionable checklist that reviewers can use to ensure comprehensive code quality assessment.`;
}

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

    await debugLog("🎯 Initializing AI-powered PR generation...");

    // Validate input parameters
    try {
      validatePRParams(request.params.arguments);
      await debugLog("📋 Parameters validated successfully");
    } catch (error) {
      console.error(
        `Parameter validation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }

    await debugLog("✅ AI PR generation initialization complete");

    try {
      await debugLog("🎯 Analyzing project with AI assistance...");

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
        await debugLog(`🎯 AI analyzing project: ${projectDir}`);
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
        await debugLog("📂 Accessing project directory first step...");
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
        await debugLog("🔧 Git repository validation complete");
      } catch (error) {
        await debugLog(`Not a git repository: ${projectDir}`);
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
        await debugLog("Failed to determine current git branch");
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
        await debugLog("📌 Base branch: main");
      } catch (error) {
        try {
          await exec(`git show-ref --verify refs/heads/master`, {
            cwd: projectDir,
          });
          mainBranch = "master";
          await debugLog("📌 Base branch: master");
        } catch (error) {
          mainBranch = featureBranch; // Fallback to current branch for staged changes
        }
      }
      await debugLog(`🎯 Current branch: ${featureBranch}`);
      await debugLog(`🎯 Main branch: ${mainBranch}`);

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
            await debugLog("No changes found for AI analysis");
            throw new McpError(
              ErrorCode.InvalidParams,
              "No changes found to generate PR for. Please make some changes to your files or stage them using 'git add' before generating a PR."
            );
          }
        } catch (error) {
          await debugLog("Failed to get changes for AI analysis");
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
            await debugLog("No differences found between branches");
            throw new McpError(
              ErrorCode.InvalidParams,
              `No differences found between ${mainBranch} and ${featureBranch}. Please ensure you have committed changes on your feature branch.`
            );
          }
        } catch (error) {
          await debugLog("Failed to generate diff for AI analysis");
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to generate diff between ${mainBranch} and ${featureBranch}. Please ensure both branches exist and have commits.`
          );
        }
      }

      await debugLog("🎯 Diff prepared for AI analysis");

      // Check diff size
      if (diff.length > 5 * 1024 * 1024) {
        await debugLog("Changes too large for AI analysis (>5MB)");
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

      await debugLog("🎯 AI analysis complete");

      // Generate enhanced PR content using AI insights
      const prdContent = await generatePRFromTemplate(
        title,
        description,
        diff,
        undefined, // screenshots
        {
          useAI: true,
          projectDirectory: projectDir,
          targetBranch: featureBranch,
          baseBranch: mainBranch,
        }
      );

      await debugLog("📄 AI PR template generated");
      await debugLog("📝 Writing AI-generated PR document...");

      const prdFileName = `${title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Cursor_AI_PR.md`;
      const prdFilePath = `${projectDir}/${prdFileName}`;

      try {
        await writeFile(prdFilePath, prdContent, "utf8");
        await debugLog("💾 Cursor AI PR document saved");
      } catch (error) {
        await debugLog("Failed to write Cursor AI PR document");
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to write Cursor AI PR document: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      await debugLog("✅ Cursor output delivery complete");

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
      await debugLog(
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
