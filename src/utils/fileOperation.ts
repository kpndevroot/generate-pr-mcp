import { URI } from "vscode-uri";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

// find the working directory

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

export const workingDirectory = (rootUri: string) => {
  if (!rootUri) {
    throw new McpError(ErrorCode.InvalidParams, "No root uri found");
  }
  const workingDir = URI.parse(rootUri).fsPath;
  return workingDir;
};

// changing the directory

export const changeDirectory = (workingDir: string) => {
  if (!workingDir) {
    console.error("working directory is required for changeDirectory");
    return false;
  }
  process.chdir(workingDir);
  return true;
};

export function getProjectRoot(): string {
  try {
    // Try to get git root
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim();
    return gitRoot;
  } catch (err) {
    // fallback to cwd
    return process.cwd();
  }
}

export function resolveRootUri(providedUri?: string): string {
  if (providedUri) {
    return URI.parse(providedUri).fsPath;
  }
  return getProjectRoot(); // fallback logic
}
