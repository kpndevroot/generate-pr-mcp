import { exec as execCallback } from "child_process";
import { promisify } from "util";

const execAsync = promisify(execCallback);

// check is project contain git tree
export const isContainGit = (projectDirectory: string) => {
  if (!projectDirectory) {
    throw new Error(
      `Project Directory is required for Cursor IDE integration ${projectDirectory} inside the isContainGit function`
    );
  }
  try {
    const isHaveGit = execAsync("git rev-parse --is-inside-work-tree", {
      cwd: projectDirectory,
    });
    if (!isHaveGit) {
      throw new Error(
        `Git is not initiated in this project ${projectDirectory} the result ${isHaveGit}`
      );
    }
    return isHaveGit;
  } catch (error: any) {
    throw new Error(`Git Ops Failed: is contain git ${error.message}`);
  }
};

// get current branch
export const getCurrentBranch = (projectDirectory: string) => {
  const branch = execAsync("git rev-parse --abbrev-ref HEAD", {
    cwd: projectDirectory,
  });
  if (!branch) {
    throw new Error("Git is not initiated in this project");
  }
  return branch;
};

// Get the Git Raw Data
export const getGitData = async (
  baseBranch: string = "main",
  projectDirectory: string
) => {
  try {
    // current directory

    // changeDirectory(currentDir);

    const [diff, commits, files] = await Promise.all([
      execAsync(`git diff ${baseBranch}...HEAD`, {
        cwd: projectDirectory,
      }),
      execAsync(`git log ${baseBranch}..HEAD --oneline`, {
        cwd: projectDirectory,
      }),
      // execAsync("git status --porcelain"),
      execAsync(`git diff --name-status ${baseBranch}...HEAD`, {
        cwd: projectDirectory,
      }),
    ]);

    return {
      rawDiff: diff.stdout,
      rawCommits: commits.stdout,
      // rawStatus: status.stdout,
      rawFiles: files.stdout,
    };
  } catch (error: any) {
    throw new Error(`Git Ops Failed: ${error.message} in ${projectDirectory}`);
  }
};

// Format Git data for better readability
export const formatGitDataForPrompt = (gitData: {
  rawDiff: string;
  rawCommits: string;
  // rawStatus: string;
  rawFiles: string;
}) => {
  return {
    diff: gitData.rawDiff.trim() || "No changes detected",
    commits: gitData.rawCommits.trim() || "No commits found",
    // status: gitData.rawStatus.trim() || "Working directory clean",
    files: gitData.rawFiles.trim() || "No files changed",
  };
};
