export const PR_REQUEST_PROMPTS = {
  "quick-pr": {
    name: "quick-pr",
    description: "Generate a PR request",
    arguments: [
      {
        name: "featureBranch",
        description:
          "The name of the branch to generate a PR request for (defaults to current branch)",
        type: "string",
        required: false,
      },
      {
        name: "baseBranch",
        description:
          "The base branch to generate a PR request for (defaults to 'main')",
        type: "string",
        required: false,
      },
      {
        name: "templateType",
        description:
          "The type of template to generate a PR request for (defaults to 'default')",
        type: "string",
        required: false,
      },
      {
        name: "diffContent",
        description:
          "Override the diff content (auto-fetched from Git if not provided)",
        type: "string",
        required: false,
      },
      {
        name: "commitMessages",
        description:
          "Override the commit messages (auto-fetched from Git if not provided)",
        type: "string",
        required: false,
      },
      {
        name: "status",
        description:
          "Override the Git status (auto-fetched from Git if not provided)",
        type: "string",
        required: false,
      },
      {
        name: "files",
        description:
          "Override the files list (auto-fetched from Git if not provided)",
        type: "string",
        required: false,
      },
      {
        name: "includeDiff",
        description:
          "Include diff analysis in the PR request (defaults to 'false')",
        type: "string",
        required: false,
      },
      {
        name: "customSections",
        description:
          "Custom sections to include in the PR request (JSON format)",
        type: "string",
        required: false,
      },
    ],
  },
};
