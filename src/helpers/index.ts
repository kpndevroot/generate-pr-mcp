import processDiffForPreview from "./processDiffForPreview.js";
import { generateKeyPoints, generateSimpleLogicSummary } from "./prUtils.js";
import { validatePRParams, truncatePRContentForMCP } from "./validation.js";
import {
  validateGitRepository,
  getCurrentBranch,
  findMainBranch,
} from "./gitOperations.js";
import {
  detectProjectType,
  generateAIAnalysisPrompt,
  parseAIAnalysisResponse,
  cleanDiffForAI,
  analyzeCodeChangesWithAI,
  type ProjectMetadata,
  type AIAnalysisResult,
} from "./aiAnalysis.js";

// Cursor AI integration
export {
  analyzeWithCursorAI,
  detectProjectTypeWithContext,
  generateCursorOptimizedPrompt,
  requestCursorAIAnalysis,
  type MCPSamplingRequest,
} from "./cursorAI.js";

// Enhanced PR generation
import { generatePRFromTemplate } from "./prGeneration.js";

// Main exports
export default processDiffForPreview;
export {
  validatePRParams,
  truncatePRContentForMCP,
  generateKeyPoints,
  generateSimpleLogicSummary,
  validateGitRepository,
  getCurrentBranch,
  findMainBranch,
  detectProjectType,
  generateAIAnalysisPrompt,
  parseAIAnalysisResponse,
  cleanDiffForAI,
  analyzeCodeChangesWithAI,
  generatePRFromTemplate,
  type ProjectMetadata,
  type AIAnalysisResult,
};
