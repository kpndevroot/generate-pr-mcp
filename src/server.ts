import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  changeDirectory,
  resolveRootUri,
  workingDirectory,
} from "./utils/fileOperation.js";
import { PR_REQUEST_PROMPTS } from "./prompts/prRequestPrompt.js";
import {
  getCurrentBranch,
  getGitData,
  isContainGit,
  formatGitDataForPrompt,
} from "./services/gitService.js";
import { URI } from "vscode-uri";
import {
  getAvailableTemplateTypes,
  getTemplateContent,
} from "./utils/templateUtils.js";
// import { prDocTool } from "./tools/prDocTool.js";

const server = new Server(
  { name: "quick-pr", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// List available prompts
// server.setRequestHandler(ListPromptsRequestSchema, async () => {
//   return {
//     prompts: Object.values(PR_REQUEST_PROMPTS),
//   };
// });

// server.setRequestHandler(GetPromptRequestSchema, async (request) => {
//   const prompt =
//     PR_REQUEST_PROMPTS[request.params.name as keyof typeof PR_REQUEST_PROMPTS];
//   if (!prompt) {
//     throw new Error(`Prompt not found: ${request.params.name}`);
//   }

//   if (request.params.name === "quick-pr") {
//     // check is project contain git tree
//     const rootUri = request.params.rootUri;

//     if (!rootUri) {
//       throw new Error("Root URI is required for Cursor IDE integration");
//     }

//     // Get actual Git data using gitService functions
//     const baseBranch = request.params.arguments?.baseBranch || "main";

//     try {
//       const [currentBranchResult, gitData] = await Promise.all([
//         getCurrentBranch(),
//         getGitData(baseBranch),
//       ]);

//       const currentBranch = currentBranchResult.stdout.trim();
//       const featureBranch =
//         request.params.arguments?.featureBranch || currentBranch;
//       const formattedGitData = formatGitDataForPrompt(gitData);

//       return {
//         description: prompt.description,
//         messages: [
//           {
//             role: "user",
//             content: {
//               type: "text",
//               text: `Generate a professional PR request with an appropriate title, description, and checklist.

//               **Branch Information:**
//               - Feature Branch: ${featureBranch}
//               - Base Branch: ${baseBranch}
//               - Template Type: ${
//                 request.params.arguments?.templateType || "default"
//               }

//               **Git Data (auto-fetched):**
//               - Diff Content: ${
//                 request.params.arguments?.diffContent || formattedGitData.diff
//               }
//               - Commit Messages: ${
//                 request.params.arguments?.commitMessages ||
//                 formattedGitData.commits
//               }
//               - Files Changed: ${
//                 request.params.arguments?.files || formattedGitData.files
//               }

//               **Options:**
//               - Include Diff Analysis: ${
//                 request.params.arguments?.includeDiff || "false"
//               }
//               - Custom Sections: ${
//                 request.params.arguments?.customSections || "{}"
//               }

//               Please generate a comprehensive PR request based on this information.
//               `,
//             },
//           },
//         ],
//       };
//     } catch (error: any) {
//       throw new Error(`Failed to fetch Git data: ${error.message}`);
//     }
//   }

//   throw new Error("Prompt implementation not found");
// });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "quick-pr",
        description: "Generate a PR request",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            checklist: { type: "array", items: { type: "string" } },
            diffContent: { type: "string" },
            commitMessages: { type: "string" },
            status: { type: "string" },
            files: { type: "string" },
            projectDirectory: { type: "string" },
            rootUri: {
              type: "string",
              description: "The root URI of the project",
            },
          },
          required: ["title", "description", "rootUri", "checklist"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // const { name, arguments: args = {}, rootUri } = request.params;

  if (request.params.name === "quick-pr") {
    const { rootUri, baseBranch } = request.params.arguments as {
      rootUri: string;
      baseBranch?: string;
    };
    // const rootPath = resolveRootUri(rootUri);
    const projectDirectory = URI.parse(rootUri).fsPath;

    // get the current workingDirectory
    if (!projectDirectory) {
      throw new Error(
        `Project Directory is required as argument for Cursor IDE integration`
      );
    }

    // const projectDirectory = URI.parse(rootUri).fsPath;
    process.chdir(projectDirectory);

    const { stdout: isGit } = await isContainGit(projectDirectory);
    if (!isGit) {
      throw new Error(
        `Git is not initiated in this project, please init git first in ${projectDirectory}`
      );
    }

    const currentBranch = await getCurrentBranch(projectDirectory);
    const { rawDiff, rawCommits, rawFiles } = await getGitData(
      baseBranch,
      projectDirectory
    );

    return {
      content: [
        {
          type: "text",
          text: `You are a professional documentation assistant helping a product-based company engineer write a clear and structured Pull Request (PR) document.
    
    Use the following context to generate a well-formatted and professional PR description in markdown:
    
    ---
    
    ## 🔧 Pull Request Title
    <Insert the PR title clearly summarizing the change>
    
    ---
    
    ## 📝 Description
    <Briefly describe what has been changed. Include context or background if needed.>
    
    ---
    
    ## 🎯 Related Issue/Ticket
    - JIRA/Ticket: <Ticket-ID or link>
    - Feature/Module: <Optional>
    
    ---
    
    ## 💡 Motivation & Context
    <Why was this change necessary? What problem does it solve? Mention business or user value.>
    
    ---
    
    ## 🧪 Test Plan
    <How was this tested? Mention unit tests, manual test steps, or any automation used.>
    
    ---
    
    ## 🖼️ Screenshots (UI/UX)
    <Attach or describe screenshots if applicable. If none, write \`N/A\`.>
    
    ---
    
    ## 📦 Impact
    <What parts of the system are affected? Note any dependencies, risks, or rollbacks.>
    
    ---
    
    ## ✅ Checklist
    - [ ] Code compiles correctly
    - [ ] All tests passing
    - [ ] PR follows code style and guidelines
    - [ ] Linked to the correct issue/ticket
    - [ ] Reviewed and approved by peers
    
    ---
    
    ### 🧠 Auto-Fetched Git Context
    
    \`\`\`markdown
    **Branch Information:**
    - Feature Branch: ${currentBranch || "current"}
    - Base Branch: ${baseBranch || "main"}
    
    **Git Data (auto-fetched):**
    - Diff Content: 
    ${rawDiff}
    
    - Commit Messages: 
    ${rawCommits}
    
    - Files Changed: 
    ${rawFiles}
    \`\`\`
    `,
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
