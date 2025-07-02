import processDiffForPreview from "./processDiffForPreview.js";
import { generateKeyPoints, generateSimpleLogicSummary } from "./prUtils.js";
import { validatePRParams } from "./validation.js";
import { generatePRFromTemplate } from "./prGeneration.js";
import {
  validateGitRepository,
  getCurrentBranch,
  findMainBranch,
} from "./gitOperations.js";
import StageDisplayManager, {
  createStageDisplay,
  generateStatusMessage,
  type StageInfo,
  type StageDisplayOptions,
} from "./stageDisplay.js";
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

export {
  processDiffForPreview,
  generateKeyPoints,
  generateSimpleLogicSummary,
  validatePRParams,
  generatePRFromTemplate,
  validateGitRepository,
  getCurrentBranch,
  findMainBranch,
  StageDisplayManager,
  createStageDisplay,
  generateStatusMessage,
  type StageInfo,
  type StageDisplayOptions,
  detectProjectType,
  generateAIAnalysisPrompt,
  parseAIAnalysisResponse,
  cleanDiffForAI,
  analyzeCodeChangesWithAI,
  type ProjectMetadata,
  type AIAnalysisResult,
};
