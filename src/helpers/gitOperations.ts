import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// Promisify exec for better async handling
const exec = promisify(execCallback);

/**
 * Validates if a directory is a git repository
 * @param projectDir The project directory path
 * @throws McpError if not a valid git repository
 */
export async function validateGitRepository(projectDir: string): Promise<void> {
  try {
    await exec("git rev-parse --is-inside-work-tree", {
      cwd: projectDir,
    });
  } catch (error) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Not a git repository: ${projectDir}. Please initialize git (git init) or navigate to a valid git repository.`
    );
  }
}

/**
 * Gets the current git branch name
 * @param projectDir The project directory path
 * @returns The current branch name
 * @throws McpError if unable to determine branch
 */
export async function getCurrentBranch(projectDir: string): Promise<string> {
  try {
    const { stdout } = await exec(`git rev-parse --abbrev-ref HEAD`, {
      cwd: projectDir,
    });
    return stdout.trim();
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      "Failed to determine current git branch. Please ensure you have at least one commit in your repository."
    );
  }
}

/**
 * Finds the main/master branch for comparison
 * @param projectDir The project directory path
 * @param currentBranch The current branch name
 * @returns The main branch name (main, master, or first available)
 * @throws McpError if no base branch found
 */
export async function findMainBranch(
  projectDir: string,
  currentBranch: string
): Promise<string> {
  // Check for main branch first
  try {
    await exec(`git show-ref --verify refs/heads/main`, {
      cwd: projectDir,
    });
    return "main";
  } catch (error) {
    // Check for master branch
    try {
      await exec(`git show-ref --verify refs/heads/master`, {
        cwd: projectDir,
      });
      return "master";
    } catch (error) {
      // If neither main nor master exists locally, use the first available branch
      try {
        const { stdout: branches } = await exec(
          `git branch --format='%(refname:short)'`,
          { cwd: projectDir }
        );
        const branchList = branches
          .trim()
          .split("\n")
          .filter((b) => b.trim() !== currentBranch.trim());

        if (branchList.length > 0) {
          return branchList[0];
        } else {
          throw new McpError(
            ErrorCode.InternalError,
            "No base branch found for comparison. Please create a main or master branch, or ensure you have multiple branches for comparison."
          );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          "Cannot determine available branches. Please ensure your git repository has proper branch structure."
        );
      }
    }
  }
}
