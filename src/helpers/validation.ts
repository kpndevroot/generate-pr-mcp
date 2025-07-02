import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Validates PR generation parameters
 * @param params The parameters to validate
 * @throws McpError if validation fails
 */
export function validatePRParams(params: any): void {
  if (!params.title?.trim()) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "PR title cannot be empty. Please provide a descriptive title for your pull request."
    );
  }

  if (!params.description?.trim()) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "PR description cannot be empty. Please provide a clear description of your changes."
    );
  }

  if (!params.rootUri?.trim()) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Root URI is required. Please ensure the project path is provided correctly."
    );
  }

  if (params.title.length > 100) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "PR title is too long (max 100 characters). Please use a more concise title."
    );
  }

  if (params.description.length > 5000) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "PR description is too long (max 5000 characters). Please provide a more concise description."
    );
  }
}
