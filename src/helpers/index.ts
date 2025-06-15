import processDiffForPreview from "./processDiffForPreview.js";
import interpretJavaScriptChanges from "./interpretJavaScriptChanges.js";
import interpretJsonChanges from "./interpretJsonChanges.js";
import interpretMarkdownChanges from "./interpretMarkdownChanges.js";
import interpretGenericChanges from "./interpretGenericChanges.js";
import countCodeBlocks from "./countCodeBlocks.js";
import interpretFileChanges from "./interpretFileChanges.js";
import getLanguageFromExtension from "./getLanguageFromExtension.js";
import { generateKeyPoints, generateSimpleLogicSummary } from "./prUtils.js";

export {
  processDiffForPreview,
  interpretJavaScriptChanges,
  interpretJsonChanges,
  interpretMarkdownChanges,
  interpretGenericChanges,
  countCodeBlocks,
  interpretFileChanges,
  getLanguageFromExtension,
  generateKeyPoints,
  generateSimpleLogicSummary,
};
