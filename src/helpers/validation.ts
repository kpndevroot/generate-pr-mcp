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

  if (params.description.length > 50000) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "PR description is extremely long (max 50,000 characters). Please provide a more concise description or break it into smaller sections."
    );
  }
}

/**
 * Truncates generated PR content to fit within MCP client limits (5000 characters)
 * while preserving the most important information
 * @param prContent The full generated PR markdown content
 * @returns Truncated content that fits within limits
 */
export function truncatePRContentForMCP(prContent: string): string {
  const MAX_LENGTH = 4800; // Leave some buffer below 5000

  if (!prContent || prContent.length <= MAX_LENGTH) {
    return prContent;
  }

  try {
    // Split into sections by headers
    const sections = prContent.split(/(?=^## )/m);
    const title = sections[0] || "";

    // Priority order for sections (most important first)
    const sectionPriority = [
      "🎯 Overview",
      "📋 Type of Change",
      "🔍 Changes Description",
      "✅ Checklist",
      "🧪 Testing Done",
      "📝 Additional Notes",
    ];

    let result = title + "\n";
    let remainingLength = MAX_LENGTH - result.length;

    // Add sections in priority order while we have space
    for (const priority of sectionPriority) {
      const section = sections.find((s) => s.includes(priority));
      if (section && section.length < remainingLength) {
        result += section + "\n";
        remainingLength -= section.length + 1;
      } else if (section && remainingLength > 200) {
        // Truncate this section to fit
        const truncatedSection =
          section.substring(0, remainingLength - 100) +
          "\n\n*[Content truncated for MCP compatibility]*";
        result += truncatedSection + "\n";
        break;
      }
    }

    // Add truncation notice if we had to cut content
    if (result.length < prContent.length) {
      result +=
        "\n\n---\n*Note: Full PR document has been generated and saved to file. This is a truncated version for MCP client compatibility.*";
    }

    return result;
  } catch (error) {
    console.error("Error truncating PR content:", error);
    // Fallback: simple truncation
    return (
      prContent.substring(0, MAX_LENGTH - 100) +
      "\n\n*[Content truncated due to length constraints]*"
    );
  }
}
