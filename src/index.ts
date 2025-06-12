import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";

// Promisify exec for better async handling
const exec = promisify(execCallback);

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
          },
          required: ["title", "description", "projectDirectory"],
          additionalProperties: false,
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_pr") {
    const { title, description, projectDirectory } = request.params
      .arguments as {
      title: string;
      description: string;
      projectDirectory: string;
    };

    try {
      // the project directory
      // const projectDirectory = "/Users/kpndevroot/Downloads/hobbie/MCP/test-cr";
      // const cwd = process.cwd();

      // Check if the directory is a git repository
      const cwd = process.cwd();
      process.chdir(projectDirectory);
      try {
        // get inside the project directory
        await exec("git rev-parse --is-inside-work-tree", {
          cwd: projectDirectory,
        });
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Not a git repository.check and try again. current directory: ${projectDirectory} and cwd: ${cwd}`,
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

        // Create PRD content for local changes
        const prdTemplate = `# ${title}

${description}

## Changes (Local modifications)
\`\`\`diff
${diff}
\`\`\`
`;

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

        // Create PRD content
        const prdTemplate = `# ${title}

${description}

## Changes (${currentBranch} vs ${mainBranch})
\`\`\`diff
${diff}
\`\`\`
`;

        // Write to file using fs/promises
        await writeFile(`${projectDirectory}/prd.md`, prdTemplate, "utf8");

        return {
          content: [
            {
              type: "text",
              text: `PR document generated successfully comparing ${currentBranch} to ${mainBranch}`,
            },
            {
              type: "text",
              text: prdTemplate,
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
