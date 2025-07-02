/**
 * MCP Server Working Stages Display
 * Provides real-time progress updates and code examples for each stage of operation
 */

export interface StageInfo {
  number: number;
  total: number;
  name: string;
  status: string;
  file?: string;
  progress: string;
  codeExample?: string;
  errorMessage?: string;
}

export interface StageDisplayOptions {
  showCodeExamples?: boolean;
  showProgress?: boolean;
  showTimestamps?: boolean;
}

export class StageDisplayManager {
  private stages: Map<number, StageInfo> = new Map();
  private currentStage: number = 0;
  private totalStages: number = 6;
  private startTime: Date = new Date();
  private options: StageDisplayOptions;

  constructor(options: StageDisplayOptions = {}) {
    this.options = {
      showCodeExamples: true,
      showProgress: true,
      showTimestamps: true,
      ...options,
    };
    this.initializeStages();
  }

  private initializeStages(): void {
    // Define all 6 stages with their code examples
    const stageDefinitions = [
      {
        name: "Server Initialization",
        codeExample: `// MCP Server startup configuration
const server = new Server({
  name: "pr-generator",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {
      generate_pr: {
        description: "Generate a PR for a feature branch"
      }
    }
  }
});`,
      },
      {
        name: "File Discovery",
        codeExample: `// Project file scanning logic
const files = await scanDirectory('./src', {
  extensions: ['.ts', '.js', '.json'],
  exclude: ['node_modules', '.git']
});

// Git repository validation
await exec("git rev-parse --is-inside-work-tree");`,
      },
      {
        name: "Code Processing",
        codeExample: `// Processing TypeScript files and extracting changes
import { processDiffForPreview } from "./helpers/index.js";

const { changesSummary, mainLogicChanges } = processDiffForPreview(diff);

// Analyzing file changes
const logicChanges = data.added.filter(line => 
  line.includes("function") || 
  line.includes("class") || 
  line.includes("interface")
);`,
      },
      {
        name: "PR Generation",
        codeExample: `// Creating PR content using template
const prdContent = await generatePRFromTemplate(
  title,
  description,
  diff,
  screenshots
);

// Generating key implementation points
const keyPoints = generateKeyPoints(diff);`,
      },
      {
        name: "Validation",
        codeExample: `// Input validation and error checking
function validatePRParams(params: any): void {
  if (!params.title?.trim()) {
    throw new McpError(ErrorCode.InvalidParams,
      "PR title cannot be empty");
  }
  
  if (diff.length > 1024 * 1024) {
    throw new McpError(ErrorCode.InvalidParams,
      "Changes too large to process");
  }
}`,
      },
      {
        name: "Output Delivery",
        codeExample: `// Writing final PR document
await writeFile(\`\${projectDir}/\${prdFileName}\`, prdContent, "utf8");

return {
  content: [{
    type: "text",
    text: \`PR document generated successfully\`
  }]
};`,
      },
    ];

    stageDefinitions.forEach((stage, index) => {
      this.stages.set(index + 1, {
        number: index + 1,
        total: this.totalStages,
        name: stage.name,
        status: "Pending",
        progress: "0%",
        codeExample: stage.codeExample,
      });
    });
  }

  /**
   * Start a new stage with initial status
   */
  public startStage(stageNumber: number, file?: string): void {
    this.currentStage = stageNumber;
    const stage = this.stages.get(stageNumber);
    if (stage) {
      stage.status = "Processing...";
      stage.file = file;
      stage.progress = "0%";
    }
  }

  /**
   * Update stage progress and status
   */
  public updateStage(
    stageNumber: number,
    status: string,
    progress?: string,
    file?: string
  ): void {
    const stage = this.stages.get(stageNumber);
    if (stage) {
      stage.status = status;
      if (progress) stage.progress = progress;
      if (file) stage.file = file;
    }
  }

  /**
   * Complete a stage
   */
  public completeStage(stageNumber: number): void {
    const stage = this.stages.get(stageNumber);
    if (stage) {
      stage.status = "✅ Complete";
      stage.progress = "100%";
    }
  }

  /**
   * Mark a stage as failed
   */
  public failStage(stageNumber: number, errorMessage: string): void {
    const stage = this.stages.get(stageNumber);
    if (stage) {
      stage.status = "❌ Failed";
      stage.errorMessage = errorMessage;
    }
  }

  /**
   * Get current stage display
   */
  public getCurrentStageDisplay(): string {
    const stage = this.stages.get(this.currentStage);
    if (!stage) return "";

    return this.formatStageDisplay(stage);
  }

  /**
   * Get complete stages summary
   */
  public getCompleteDisplay(): string {
    const header = `=== MCP Server Working Stages ===\n`;
    const timestamp = this.options.showTimestamps
      ? `Started: ${this.startTime.toLocaleTimeString()}\n\n`
      : "";

    let display = header + timestamp;

    for (let i = 1; i <= this.totalStages; i++) {
      const stage = this.stages.get(i);
      if (stage) {
        display += this.formatStageDisplay(stage) + "\n\n";
      }
    }

    // Add completion summary
    const completedStages = Array.from(this.stages.values()).filter((s) =>
      s.status.includes("Complete")
    ).length;
    const failedStages = Array.from(this.stages.values()).filter((s) =>
      s.status.includes("Failed")
    ).length;

    const elapsed = Math.round((Date.now() - this.startTime.getTime()) / 1000);

    display += `--- Summary ---\n`;
    display += `Total processing time: ${elapsed}s\n`;
    display += `Stages completed: ${completedStages}/${this.totalStages}\n`;
    display += `Stages failed: ${failedStages}\n`;

    if (completedStages === this.totalStages) {
      display += `Status: ✅ All stages completed successfully\n`;
    } else if (failedStages > 0) {
      display += `Status: ❌ Some stages failed\n`;
    } else {
      display += `Status: 🔄 Processing in progress\n`;
    }

    return display;
  }

  /**
   * Format individual stage display
   */
  private formatStageDisplay(stage: StageInfo): string {
    let display = `Stage ${stage.number}/${stage.total}: ${stage.name}\n`;
    display += `Status: ${stage.status}\n`;

    if (stage.file) {
      display += `File: ${stage.file}\n`;
    }

    if (this.options.showProgress && stage.progress) {
      display += `Progress: ${stage.progress}\n`;
    }

    if (stage.errorMessage) {
      display += `Error: ${stage.errorMessage}\n`;
    }

    if (this.options.showCodeExamples && stage.codeExample) {
      display += `\n\`\`\`typescript\n${stage.codeExample}\n\`\`\`\n`;
    }

    return display;
  }

  /**
   * Get progress percentage for current operation
   */
  public getOverallProgress(): number {
    const completedStages = Array.from(this.stages.values()).filter((s) =>
      s.status.includes("Complete")
    ).length;
    return Math.round((completedStages / this.totalStages) * 100);
  }

  /**
   * Generate file-specific processing messages
   */
  public generateFileProcessingMessage(
    fileName: string,
    action: string
  ): string {
    const emoji = this.getFileEmoji(fileName);
    return `${emoji} ${action} ${fileName}...`;
  }

  /**
   * Get appropriate emoji for file type
   */
  private getFileEmoji(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "js":
        return "📜";
      case "json":
        return "📋";
      case "md":
        return "📝";
      case "env":
        return "⚙️";
      case "lock":
        return "🔒";
      default:
        return "📁";
    }
  }

  /**
   * Create stage-specific progress indicators
   */
  public createProgressBar(
    current: number,
    total: number,
    width: number = 10
  ): string {
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
  }

  /**
   * Get estimated time remaining
   */
  public getETA(): string {
    const elapsed = Date.now() - this.startTime.getTime();
    const completedStages = Array.from(this.stages.values()).filter((s) =>
      s.status.includes("Complete")
    ).length;

    if (completedStages === 0) return "Calculating...";

    const avgTimePerStage = elapsed / completedStages;
    const remainingStages = this.totalStages - completedStages;
    const etaMs = remainingStages * avgTimePerStage;

    const etaSeconds = Math.round(etaMs / 1000);
    if (etaSeconds < 60) {
      return `${etaSeconds}s`;
    } else {
      const minutes = Math.floor(etaSeconds / 60);
      const seconds = etaSeconds % 60;
      return `${minutes}m ${seconds}s`;
    }
  }
}

/**
 * Create detailed stage display with real-time updates
 */
export function createStageDisplay(
  stageNumber: number,
  stageName: string,
  status: string,
  file?: string,
  progress?: string,
  codeExample?: string
): string {
  let display = `🔄 Stage ${stageNumber}/6: ${stageName}\n`;
  display += `Status: ${status}\n`;

  if (file) {
    display += `File: ${file}\n`;
  }

  if (progress) {
    display += `Progress: ${progress}\n`;
  }

  if (codeExample) {
    display += `\n\`\`\`typescript\n${codeExample}\n\`\`\`\n`;
  }

  return display;
}

/**
 * Generate interactive status messages with emojis
 */
export function generateStatusMessage(
  action: string,
  file?: string,
  isComplete: boolean = false
): string {
  const emoji = isComplete ? "✅" : "🔄";
  const suffix = file ? ` ${file}...` : "...";
  return `${emoji} ${action}${suffix}`;
}

export default StageDisplayManager;
