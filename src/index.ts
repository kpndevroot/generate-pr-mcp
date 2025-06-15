import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { URI } from "vscode-uri";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { processDiffForPreview } from "./helpers/index.js";
import {
  generatePRMarkdown,
  generateFallbackPRMarkdown,
} from "./templates/pr-template.js";

// Promisify exec for better async handling
const exec = promisify(execCallback);

// Helper function to load and populate the PR template
async function generatePRFromTemplate(
  title: string,
  description: string,
  diff: string,
  screenshots?: { before?: string; after?: string } // Optional screenshots
): Promise<string> {
  try {
    // Generate markdown content using the modular template
    const { changesSummary, mainLogicChanges } = processDiffForPreview(diff);

    return generatePRMarkdown(
      title,
      description,
      changesSummary,
      mainLogicChanges,
      diff,
      screenshots
    );
  } catch (error) {
    // Fallback to simple template if processing fails
    return generateFallbackPRMarkdown(title, description, diff);
  }
}

// Helper function to generate key implementation points
function generateKeyPoints(diff: string): string {
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

// Helper function to generate a simple logic summary for fallback
function generateSimpleLogicSummary(diff: string): string {
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

const server = new Server(
  {
    name: "mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        generate_pr: {
          description: "Generate a PR for a feature branch",
        },
        calculate_sum: {
          description: "Add two numbers together",
        },
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate_sum",
        description: "Add two numbers together",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "generate_pr",
        description: "Generate a PR for a feature branch",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "The title of the PR" },
            description: {
              type: "string",
              description: "The description of the PR",
            },
            projectDirectory: {
              type: "string",
              description: "The project directory",
            },
            rootUri: {
              type: "string",
              description: "The root URI of the project",
            },
          },
          required: ["title", "description", "projectDirectory", "rootUri"],
          additionalProperties: false,
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_pr") {
    const { title, description, projectDirectory, rootUri } = request.params
      .arguments as {
      title: string;
      description: string;
      projectDirectory: string;
      rootUri: string;
    };

    try {
      // get the project directory from the rootUri
      if (!rootUri) {
        throw new McpError(ErrorCode.InternalError, "No root URI found");
      }
      const projectDirectory = URI.parse(rootUri).fsPath;
      process.chdir(projectDirectory);

      try {
        // check if the project directory is a git repository
        await exec("git rev-parse --is-inside-work-tree", {
          cwd: projectDirectory,
        });
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Not a git repository.check and try again. current directory: ${projectDirectory}`,
            },
          ],
        };
      }

      // Get current branch name
      const { stdout: featureBranch } = await exec(
        `git rev-parse --abbrev-ref HEAD`,
        { cwd: projectDirectory }
      );

      // Find local main branch (check for main first, then master)
      let mainBranch = "main";
      try {
        await exec(`git show-ref --verify refs/heads/main`, {
          cwd: projectDirectory,
        });
      } catch (error) {
        try {
          await exec(`git show-ref --verify refs/heads/master`, {
            cwd: projectDirectory,
          });
          mainBranch = "master";
        } catch (error) {
          // If neither main nor master exists locally, use the first available branch
          try {
            const { stdout: branches } = await exec(
              `git branch --format='%(refname:short)'`,
              { cwd: projectDirectory }
            );
            const branchList = branches
              .trim()
              .split("\n")
              .filter((b) => b.trim() !== featureBranch.trim());
            if (branchList.length > 0) {
              mainBranch = branchList[0];
            } else {
              throw new McpError(
                ErrorCode.InternalError,
                "No suitable base branch found"
              );
            }
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              "Could not determine base branch"
            );
          }
        }
      }

      const currentBranch = featureBranch.trim();

      // If we're on main/master, show staged changes instead
      if (currentBranch === mainBranch) {
        // Get staged changes
        const { stdout: stagedDiff } = await exec(`git diff --staged`, {
          cwd: projectDirectory,
        });

        // If no staged changes, get unstaged changes
        let diff = stagedDiff;
        if (!diff.trim()) {
          const { stdout: unstagedDiff } = await exec(`git diff`, {
            cwd: projectDirectory,
          });
          diff = unstagedDiff;
        }

        if (!diff.trim()) {
          throw new McpError(
            ErrorCode.InternalError,
            "No changes found to generate PR for"
          );
        }

        // Optional: You can add logic here to detect and include screenshots
        const screenshots = {
          // before: "path/to/before/screenshot.png", // Optional
          // after: "path/to/after/screenshot.png",   // Optional
        };

        // Create PRD content for local changes
        const prdTemplate = await generatePRFromTemplate(
          title,
          description,
          diff,
          screenshots
        );

        // Write to file using fs/promises
        await writeFile(`${projectDirectory}/prd.md`, prdTemplate, "utf8");

        return {
          content: [
            {
              type: "text",
              text: `PR document generated successfully for local changes on ${currentBranch} branch`,
            },
            {
              type: "text",
              text: prdTemplate,
            },
          ],
        };
      } else {
        // Get diff between current branch and main branch
        const { stdout: diff } = await exec(
          `git diff ${mainBranch}..${currentBranch}`,
          { cwd: projectDirectory }
        );

        if (!diff.trim()) {
          throw new McpError(
            ErrorCode.InternalError,
            `No differences found between ${currentBranch} and ${mainBranch}`
          );
        }

        // Optional: You can add logic here to detect and include screenshots
        const screenshots = {
          // before: "path/to/before/screenshot.png", // Optional
          // after: "path/to/after/screenshot.png",   // Optional
        };

        // implement better naming convention for the PRD file
        const prdFileName = `${title.toLowerCase().replace(/ /g, "_")}.md`;

        // Generate PR content with optional screenshots
        const prdContent = await generatePRFromTemplate(
          title,
          description,
          diff,
          screenshots
        );

        // Write to file using fs/promises
        await writeFile(
          `${projectDirectory}/${prdFileName}`,
          prdContent,
          "utf8"
        );

        return {
          content: [
            {
              type: "text",
              text: `PR document generated successfully comparing ${currentBranch} to ${mainBranch}`,
            },
            {
              type: "text",
              text: prdContent,
            },
          ],
        };
      }
    } catch (error: any) {
      console.error("Error in generate_pr:", error);
      throw new McpError(
        ErrorCode.InternalError,
        `Error generating PR: ${error.message || "Unknown error"}`
      );
    }
  }

  if (request.params.name === "calculate_sum") {
    try {
      if (!request.params.arguments) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Missing arguments for calculate_sum"
        );
      }

      const { a, b } = request.params.arguments as { a: number; b: number };

      if (typeof a !== "number" || typeof b !== "number") {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Both arguments must be numbers"
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `${a} + ${b} = ${a + b}`,
          },
        ],
        toolResult: a + b,
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Error calculating sum: ${error.message || "Unknown error"}`
      );
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, "Method not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
