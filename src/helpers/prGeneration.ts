import processDiffForPreview from "./index.js";
import {
  generatePRMarkdown,
  generateFallbackPRMarkdown,
} from "../templates/pr-template.js";
import {
  detectProjectType,
  analyzeCodeChangesWithAI,
  type ProjectMetadata,
  type AIAnalysisResult,
} from "./aiAnalysis.js";

/**
 * Enhanced PR generation options
 */
export interface PRGenerationOptions {
  useAI?: boolean;
  projectDirectory?: string;
  targetBranch?: string;
  baseBranch?: string;
}

/**
 * Helper function to load and populate the PR template
 * @param title PR title
 * @param description PR description
 * @param diff Git diff content
 * @param screenshots Optional screenshots for visual changes
 * @param options Optional AI analysis and configuration
 * @returns Generated PR markdown content
 */
export async function generatePRFromTemplate(
  title: string,
  description: string,
  diff: string,
  screenshots?: { before?: string; after?: string },
  options?: PRGenerationOptions
): Promise<string> {
  try {
    // If AI analysis is requested
    if (options?.useAI) {
      return await generateAIPoweredPR(
        title,
        description,
        diff,
        screenshots,
        options
      );
    }

    // Fallback to traditional analysis
    return "";
  } catch (error) {
    console.error("Error in PR generation:", error);
    // Ultimate fallback to simple template
    return generateFallbackPRMarkdown(title, description, diff);
  }
}

/**
 * Generates PR using AI-powered analysis
 */
async function generateAIPoweredPR(
  title: string,
  description: string,
  diff: string,
  screenshots?: { before?: string; after?: string },
  options?: PRGenerationOptions
): Promise<string> {
  try {
    // Detect project type
    const projectType = detectProjectType(
      diff,
      options?.projectDirectory || ""
    );

    // Prepare metadata for AI analysis
    const metadata: ProjectMetadata = {
      projectType,
      targetBranch: options?.targetBranch || "main",
      baseBranch: options?.baseBranch || "HEAD",
    };

    // Perform AI analysis
    const aiAnalysis: AIAnalysisResult = await analyzeCodeChangesWithAI(
      diff,
      metadata
    );

    // Use AI-suggested title and description if confidence is high
    const finalTitle =
      aiAnalysis.confidence > 0.7 && aiAnalysis.prTitle
        ? aiAnalysis.prTitle
        : title;

    const finalDescription =
      aiAnalysis.confidence > 0.7 && aiAnalysis.prDescription
        ? aiAnalysis.prDescription
        : description;

    // Generate enhanced PR template with AI insights
    return generateEnhancedPRMarkdown(
      finalTitle,
      finalDescription,
      diff,
      aiAnalysis,
      screenshots
    );
  } catch (error) {
    console.error(
      "Error in AI-powered PR generation, falling back to traditional:",
      error
    );
    return "";
  }
}

/**
 * Generates enhanced PR template with comprehensive AI analysis insights
 * Enhanced with detailed technical analysis sections for enterprise-grade documentation
 */
function generateEnhancedPRMarkdown(
  title: string,
  description: string,
  diff: string,
  aiAnalysis: AIAnalysisResult,
  screenshots?: { before?: string; after?: string }
): string {
  try {
    // Handle screenshots safely
    const hasScreenshots =
      screenshots && (screenshots.before || screenshots.after);
    const beforeScreenshot = screenshots?.before || "";
    const afterScreenshot = screenshots?.after || "";

    // Determine change type emoji
    const changeTypeEmoji = getChangeTypeEmoji(aiAnalysis.changeType);

    // Generate confidence indicator
    const confidenceIndicator = getConfidenceIndicator(aiAnalysis.confidence);

    // Generate detailed file analysis
    const fileAnalysis = generateDetailedFileAnalysis(diff);

    // Generate technical metrics
    const technicalMetrics = generateTechnicalMetrics(diff);

    return `# ${title}

${confidenceIndicator}

## 🎯 Overview

${description}

## 📋 Type of Change

<!-- AI-detected change type: ${aiAnalysis.changeType} -->

${getChangeTypeCheckboxes(aiAnalysis.changeType)}

## 🔍 Changes Description


### Why It Changed:
${aiAnalysis.businessLogicExplanation}

### Implementation Details:

<!-- AI-Enhanced Analysis -->
${aiAnalysis.businessLogicExplanation}

**Key Implementation Points:**
${generateKeyPointsFromAI(aiAnalysis)}

## 💼 Business Logic Impact

${aiAnalysis.businessLogicExplanation}

### Specific Business Rule Changes:
<!-- Detailed analysis of business logic modifications -->
${extractBusinessRuleChanges(aiAnalysis.businessLogicExplanation)}

## 🏗️ Architectural Changes & Design Impact

${aiAnalysis.architecturalChanges}

### System Architecture Modifications:
<!-- Detailed architectural impact analysis -->
${generateArchitecturalImpactSummary(aiAnalysis.architecturalChanges)}

## 🔍 Technical Complexity Analysis

${
  aiAnalysis.technicalComplexityAnalysis ||
  generateTechnicalComplexityFallback(diff)
}

### Code Complexity Metrics:
${technicalMetrics}

### Performance Implications:
<!-- Analysis of performance impact -->
${analyzePerformanceImplications(diff, aiAnalysis)}

## 🔒 Security & Compliance Assessment

${
  aiAnalysis.securityComplianceAssessment ||
  generateSecurityAssessmentFallback(diff)
}

### Security Considerations:
<!-- Detailed security impact analysis -->
${analyzeSecurityImplications(diff)}

### Compliance Impact:
<!-- Compliance and regulatory considerations -->
${analyzeComplianceImpact(diff, aiAnalysis)}

## 📊 Dependency & Integration Impact

${
  aiAnalysis.dependencyIntegrationImpact ||
  generateDependencyImpactFallback(diff)
}

### External Dependencies:
<!-- Analysis of dependency changes -->
${analyzeDependencyChanges(diff)}

### API Contract Changes:
<!-- Analysis of API modifications -->
${analyzeAPIChanges(diff)}

## 📁 Detailed File Analysis

${fileAnalysis}

## ⚠️ Risk Assessment & Recommendations

${aiAnalysis.riskAssessment || generateRiskAssessmentFallback(diff)}

### Deployment Considerations:
<!-- Critical deployment and rollback considerations -->
${generateDeploymentConsiderations(diff, aiAnalysis)}

### Testing Recommendations:
<!-- Specific testing recommendations -->
${generateTestingRecommendations(diff, aiAnalysis)}

${
  aiAnalysis.potentialUnnecessaryFiles.length > 0
    ? `
## 🔍 File Relevance Review

The following files may contain minimal functional impact:
${aiAnalysis.potentialUnnecessaryFiles
  .map((file) => `- \`${file}\``)
  .join("\n")}

*Please review these files to confirm if they're essential for this PR.*
`
    : ""
}

## 🧪 Testing Done

<!-- Please describe the tests that you ran to verify your changes -->

- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Manual Testing
- [ ] Performance Testing
- [ ] Security Testing

### Test Coverage:
<!-- Describe what scenarios were tested -->

### Automated Testing Considerations:
<!-- Recommendations for automated testing -->
${generateAutomatedTestingRecommendations(diff, aiAnalysis)}

## 📸 Visual Changes

${
  hasScreenshots
    ? `
### Before:
${
  beforeScreenshot
    ? `![Before Changes](${beforeScreenshot})`
    : "_No before screenshot provided_"
}

### After:
${
  afterScreenshot
    ? `![After Changes](${afterScreenshot})`
    : "_No after screenshot provided_"
}
`
    : "<!-- No visual changes in this PR -->"
}

## ✅ Checklist

<!-- Please check all items that apply -->

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests are passing
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Branch is up to date with main
- [ ] Security implications reviewed
- [ ] Performance impact assessed
- [ ] Dependency changes documented
- [ ] Compliance requirements verified

## 🔗 Related Items

<!-- Link related issues, PRs, or documentation -->

- Related Issue: #
- Closes: #
- Documentation: [Link]()
- Architecture Decision Record: [Link]()

## 📝 Additional Notes

<!-- Add any other context about the PR here -->

${
  aiAnalysis.confidence < 0.7
    ? `
> **Note**: This PR was generated with AI assistance but with lower confidence (${Math.round(
        aiAnalysis.confidence * 100
      )}%). Please review the analysis carefully.
`
    : ""
}

### Technical Debt Considerations:
<!-- Analysis of technical debt impact -->
${analyzeTechnicalDebt(diff, aiAnalysis)}

### Future Maintenance Considerations:
<!-- Long-term maintenance implications -->
${analyzeFutureMaintenanceImpact(diff, aiAnalysis)}

---

## 👥 Reviewers Guide

### 🔍 Review Focus Areas:
1. **Implementation Approach**: Verify the technical implementation aligns with architectural standards
2. **Business Logic Validation**: Confirm business rules are correctly implemented
3. **Security Review**: Assess security implications and data protection measures
4. **Performance Analysis**: Evaluate performance impact and scalability considerations
5. **Test Coverage**: Review test coverage and testing strategy adequacy
6. **Documentation Quality**: Ensure documentation reflects all changes accurately
${
  aiAnalysis.potentialUnnecessaryFiles.length > 0
    ? `7. **File Relevance**: Review flagged files for necessity and relevance`
    : ""
}

### 🎯 Critical Review Points:
${generateCriticalReviewPoints(aiAnalysis)}

### 📊 Change Impact Summary:
${generateChangeImpactSummary(diff, aiAnalysis)}

<!-- Generated with comprehensive AI-powered analysis ${changeTypeEmoji} -->
<!-- Analysis confidence: ${Math.round(aiAnalysis.confidence * 100)}% -->
<!-- Generated on: ${new Date().toISOString()} -->
`;
  } catch (error) {
    console.error("Error generating enhanced PR markdown:", error);
    // Fallback to regular template
    return generatePRMarkdown(title, description, "", "", diff, screenshots);
  }
}

/**
 * Helper functions for enhanced template generation
 */
function getChangeTypeEmoji(changeType: string): string {
  const emojiMap: Record<string, string> = {
    bugfix: "🐛",
    feature: "✨",
    refactor: "♻️",
    docs: "📚",
    performance: "⚡",
    security: "🔒",
    testing: "🧪",
    style: "💄",
    chore: "🔧",
  };
  return emojiMap[changeType.toLowerCase()] || "🔄";
}

function getConfidenceIndicator(confidence: number): string {
  if (confidence >= 0.9) {
    return "<!-- 🤖 High-confidence AI analysis -->";
  } else if (confidence >= 0.7) {
    return "<!-- 🤖 AI-assisted analysis -->";
  } else {
    return "<!-- 🤖 AI analysis with manual review recommended -->";
  }
}

function getChangeTypeCheckboxes(changeType: string): string {
  const types = [
    {
      key: "bugfix",
      label: "🐛 Bug fix (non-breaking change which fixes an issue)",
    },
    {
      key: "feature",
      label: "✨ New feature (non-breaking change which adds functionality)",
    },
    {
      key: "breaking",
      label:
        "💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)",
    },
    { key: "docs", label: "📚 Documentation update" },
    {
      key: "refactor",
      label: "♻️ Code refactoring (no functional changes, no api changes)",
    },
    { key: "performance", label: "⚡ Performance improvements" },
  ];

  return types
    .map((type) => {
      const isChecked = type.key === changeType.toLowerCase() ? "[x]" : "[ ]";
      return `- ${isChecked} ${type.label}`;
    })
    .join("\n");
}

function generateKeyPointsFromAI(aiAnalysis: AIAnalysisResult): string {
  // Convert AI analysis into implementation points based on business logic and architectural changes
  const points = [];

  // Combine analysis sources for comprehensive detection
  const analysisText = (
    aiAnalysis.businessLogicExplanation +
    " " +
    aiAnalysis.architecturalChanges +
    " " +
    aiAnalysis.technicalComplexityAnalysis
  ).toLowerCase();

  if (
    analysisText.includes("function") ||
    analysisText.includes("method") ||
    analysisText.includes("logic") ||
    analysisText.includes("algorithm")
  ) {
    points.push("- [x] Core functionality changes");
  } else {
    points.push("- [ ] Core functionality changes");
  }

  if (
    analysisText.includes("api") ||
    analysisText.includes("endpoint") ||
    analysisText.includes("route") ||
    analysisText.includes("interface")
  ) {
    points.push("- [x] API modifications");
  } else {
    points.push("- [ ] API modifications");
  }

  if (
    analysisText.includes("database") ||
    analysisText.includes("schema") ||
    analysisText.includes("model") ||
    analysisText.includes("migration")
  ) {
    points.push("- [x] Database schema updates");
  } else {
    points.push("- [ ] Database schema updates");
  }

  if (
    analysisText.includes("config") ||
    analysisText.includes("setting") ||
    analysisText.includes("environment") ||
    analysisText.includes("parameter")
  ) {
    points.push("- [x] Configuration changes");
  } else {
    points.push("- [ ] Configuration changes");
  }

  if (
    analysisText.includes("integration") ||
    analysisText.includes("dependency") ||
    analysisText.includes("third-party") ||
    analysisText.includes("external")
  ) {
    points.push("- [x] Third-party integrations");
  } else {
    points.push("- [ ] Third-party integrations");
  }

  return points.join("\n");
}

/**
 * Helper functions for enhanced technical analysis
 */

/**
 * Generates detailed file-by-file analysis
 */
function generateDetailedFileAnalysis(diff: string): string {
  try {
    const lines = diff.split("\n");
    const fileChanges = new Map<
      string,
      { added: number; removed: number; modified: number }
    >();
    let currentFile = "";

    for (const line of lines) {
      if (line.startsWith("diff --git")) {
        const match = line.match(/diff --git a\/(.*) b\/(.*)/);
        if (match) {
          currentFile = match[1];
          if (!fileChanges.has(currentFile)) {
            fileChanges.set(currentFile, { added: 0, removed: 0, modified: 0 });
          }
        }
      } else if (
        currentFile &&
        line.startsWith("+") &&
        !line.startsWith("+++")
      ) {
        const stats = fileChanges.get(currentFile)!;
        stats.added++;
      } else if (
        currentFile &&
        line.startsWith("-") &&
        !line.startsWith("---")
      ) {
        const stats = fileChanges.get(currentFile)!;
        stats.removed++;
      }
    }

    let analysis = "";

    for (const [file, stats] of fileChanges) {
      const total = stats.added + stats.removed;
      const complexity = total > 50 ? "High" : total > 20 ? "Medium" : "Low";

      analysis += `#### \`${file}\`\n`;
      analysis += `- **Lines Added**: ${stats.added}\n`;
      analysis += `- **Lines Removed**: ${stats.removed}\n`;
      analysis += `- **Change Complexity**: ${complexity}\n`;
      analysis += `- **Impact Assessment**: ${analyzeFileImpact(
        file,
        stats
      )}\n\n`;
    }

    return analysis;
  } catch (error) {
    return "Detailed file analysis unavailable due to processing error.";
  }
}

/**
 * Analyzes the impact of changes to a specific file
 */
function analyzeFileImpact(
  file: string,
  stats: { added: number; removed: number; modified: number }
): string {
  const ext = file.split(".").pop()?.toLowerCase() || "";
  const total = stats.added + stats.removed;

  if (ext === "ts" || ext === "js") {
    if (total > 50) return "Significant business logic changes expected";
    if (total > 20) return "Moderate functionality modifications";
    return "Minor code adjustments";
  } else if (ext === "json") {
    return "Configuration or dependency changes";
  } else if (ext === "md") {
    return "Documentation updates";
  } else if (ext === "css" || ext === "scss") {
    return "Styling modifications";
  }
  return "File type analysis pending manual review";
}

/**
 * Generates technical complexity metrics
 */
function generateTechnicalMetrics(diff: string): string {
  try {
    const lines = diff.split("\n");
    const addedLines = lines.filter(
      (line) => line.startsWith("+") && !line.startsWith("+++")
    ).length;
    const removedLines = lines.filter(
      (line) => line.startsWith("-") && !line.startsWith("---")
    ).length;
    const totalFiles = lines.filter((line) =>
      line.startsWith("diff --git")
    ).length;

    const complexityScore =
      addedLines > 100 ? "High" : addedLines > 50 ? "Medium" : "Low";
    const changeIntensity = (addedLines + removedLines) / totalFiles;

    return `
- **Total Files Modified**: ${totalFiles}
- **Lines Added**: ${addedLines}
- **Lines Removed**: ${removedLines}
- **Net Change**: ${addedLines - removedLines} lines
- **Change Complexity Score**: ${complexityScore}
- **Average Change Intensity**: ${Math.round(changeIntensity)} lines per file
- **Refactoring Ratio**: ${Math.round(
      (removedLines / (addedLines + removedLines)) * 100
    )}%`;
  } catch (error) {
    return "Technical metrics calculation unavailable.";
  }
}

/**
 * Extracts business rule changes from analysis
 */
function extractBusinessRuleChanges(businessLogicExplanation: string): string {
  if (
    !businessLogicExplanation ||
    businessLogicExplanation.includes("unavailable")
  ) {
    return "Business rule analysis requires manual review of the changes.";
  }

  // Extract key business logic patterns
  const hasValidation = businessLogicExplanation
    .toLowerCase()
    .includes("validation");
  const hasWorkflow = businessLogicExplanation
    .toLowerCase()
    .includes("workflow");
  const hasDataFlow = businessLogicExplanation.toLowerCase().includes("data");

  let analysis = "";
  if (hasValidation)
    analysis += "- Input validation logic modifications detected\n";
  if (hasWorkflow)
    analysis += "- User workflow or process changes identified\n";
  if (hasDataFlow)
    analysis += "- Data processing or transformation logic updated\n";

  return analysis || "No specific business rule patterns detected in analysis.";
}

/**
 * Generates architectural impact summary
 */
function generateArchitecturalImpactSummary(
  architecturalChanges: string
): string {
  if (!architecturalChanges || architecturalChanges.includes("unavailable")) {
    return "Architectural impact assessment requires detailed code review.";
  }

  // Analyze architectural patterns
  const hasComponents = architecturalChanges
    .toLowerCase()
    .includes("component");
  const hasPatterns = architecturalChanges.toLowerCase().includes("pattern");
  const hasStructure = architecturalChanges.toLowerCase().includes("structure");

  let summary = "";
  if (hasComponents)
    summary += "- Component architecture modifications detected\n";
  if (hasPatterns)
    summary += "- Design pattern implementation changes identified\n";
  if (hasStructure)
    summary += "- System structure or organization updates found\n";

  return summary || "Minimal architectural impact detected in this change set.";
}

/**
 * Generates technical complexity fallback analysis
 */
function generateTechnicalComplexityFallback(diff: string): string {
  const functionCount = (diff.match(/function\s+\w+/g) || []).length;
  const classCount = (diff.match(/class\s+\w+/g) || []).length;
  const interfaceCount = (diff.match(/interface\s+\w+/g) || []).length;

  return `
**Code Structure Analysis:**
- Functions added/modified: ${functionCount}
- Classes added/modified: ${classCount}
- Interfaces added/modified: ${interfaceCount}

**Complexity Assessment:**
- Estimated cyclomatic complexity: ${
    functionCount > 5 ? "High" : functionCount > 2 ? "Medium" : "Low"
  }
- Code maintainability impact: ${classCount > 3 ? "Significant" : "Moderate"}
- Type safety considerations: ${interfaceCount > 0 ? "Enhanced" : "Unchanged"}`;
}

/**
 * Analyzes performance implications
 */
function analyzePerformanceImplications(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const hasAsync = diff.includes("async") || diff.includes("await");
  const hasLoops =
    diff.includes("for") || diff.includes("while") || diff.includes("forEach");
  const hasDatabase =
    diff.toLowerCase().includes("query") || diff.toLowerCase().includes("sql");

  let analysis = "";
  if (hasAsync)
    analysis += "- Asynchronous operations may impact response times\n";
  if (hasLoops)
    analysis +=
      "- Loop constructs detected - monitor for potential performance bottlenecks\n";
  if (hasDatabase)
    analysis += "- Database operations present - consider query optimization\n";

  return (
    analysis ||
    "No significant performance implications detected in code analysis."
  );
}

/**
 * Generates security assessment fallback
 */
function generateSecurityAssessmentFallback(diff: string): string {
  const hasAuth =
    diff.toLowerCase().includes("auth") || diff.toLowerCase().includes("login");
  const hasInput =
    diff.toLowerCase().includes("input") ||
    diff.toLowerCase().includes("param");
  const hasData =
    diff.toLowerCase().includes("data") || diff.toLowerCase().includes("user");

  return `
**Security Considerations:**
${
  hasAuth
    ? "- Authentication/authorization logic changes require security review"
    : "- No authentication changes detected"
}
${
  hasInput
    ? "- Input handling modifications present - validate sanitization"
    : "- No input handling changes identified"
}
${
  hasData
    ? "- Data processing changes may affect data protection compliance"
    : "- Minimal data handling impact"
}

**Recommended Security Review:**
- Verify input validation and sanitization
- Check for potential injection vulnerabilities
- Ensure proper error handling without information disclosure`;
}

/**
 * Analyzes security implications
 */
function analyzeSecurityImplications(diff: string): string {
  const securityKeywords = [
    "password",
    "token",
    "key",
    "secret",
    "auth",
    "login",
    "session",
  ];
  const foundKeywords = securityKeywords.filter((keyword) =>
    diff.toLowerCase().includes(keyword)
  );

  if (foundKeywords.length === 0) {
    return "No explicit security-related changes detected in diff analysis.";
  }

  return `Security-sensitive areas detected:
${foundKeywords.map((keyword) => `- Changes related to: ${keyword}`).join("\n")}

**Recommendation**: Conduct thorough security review for these modifications.`;
}

/**
 * Analyzes compliance impact
 */
function analyzeComplianceImpact(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const hasLogging =
    diff.toLowerCase().includes("log") || diff.toLowerCase().includes("audit");
  const hasData =
    diff.toLowerCase().includes("personal") ||
    diff.toLowerCase().includes("private");

  let impact = "";
  if (hasLogging)
    impact += "- Audit trail modifications may affect compliance logging\n";
  if (hasData)
    impact += "- Data handling changes require privacy compliance review\n";

  return (
    impact ||
    "No specific compliance implications identified in current analysis."
  );
}

/**
 * Generates dependency impact fallback
 */
function generateDependencyImpactFallback(diff: string): string {
  const hasPackageJson = diff.includes("package.json");
  const hasImports = diff.includes("import ") || diff.includes("require(");

  return `
**Dependency Analysis:**
${
  hasPackageJson
    ? "- Package.json modifications detected - review dependency changes"
    : "- No package.json changes found"
}
${
  hasImports
    ? "- Import/require statements modified - verify dependency usage"
    : "- No import statement changes detected"
}

**Integration Impact:**
- External API usage: ${
    diff.toLowerCase().includes("api")
      ? "Modifications detected"
      : "No changes identified"
  }
- Third-party services: ${
    diff.toLowerCase().includes("service")
      ? "Integration changes present"
      : "No service integrations affected"
  }`;
}

/**
 * Analyzes dependency changes
 */
function analyzeDependencyChanges(diff: string): string {
  const packageJsonChanges = diff.includes("package.json");
  const lockFileChanges =
    diff.includes("package-lock.json") || diff.includes("yarn.lock");

  if (!packageJsonChanges && !lockFileChanges) {
    return "No package dependency changes detected.";
  }

  return `
- Package configuration: ${packageJsonChanges ? "Modified" : "Unchanged"}
- Lock files: ${lockFileChanges ? "Updated" : "Unchanged"}
- **Action Required**: Review dependency versions and security implications`;
}

/**
 * Analyzes API changes
 */
function analyzeAPIChanges(diff: string): string {
  const hasEndpoints =
    diff.includes("router.") ||
    diff.includes("app.") ||
    diff.includes("endpoint");
  const hasResponses = diff.includes("response") || diff.includes("res.");

  if (!hasEndpoints && !hasResponses) {
    return "No API contract modifications detected.";
  }

  return `
- API endpoints: ${hasEndpoints ? "Modified" : "Unchanged"}
- Response structures: ${hasResponses ? "Updated" : "Unchanged"}
- **Compatibility Check**: Verify backward compatibility for existing clients`;
}

/**
 * Generates risk assessment fallback
 */
function generateRiskAssessmentFallback(diff: string): string {
  const linesChanged = diff.split("\n").length;
  const riskLevel =
    linesChanged > 500 ? "High" : linesChanged > 100 ? "Medium" : "Low";

  return `
**Change Risk Assessment:**
- Risk Level: ${riskLevel}
- Change Size: ${linesChanged} total diff lines
- Complexity: ${
    linesChanged > 200
      ? "High complexity requires careful review"
      : "Moderate complexity with standard review needed"
  }

**Recommended Mitigation:**
- Comprehensive testing before deployment
- Staged rollout for high-risk changes
- Monitoring setup for critical path modifications`;
}

/**
 * Generates deployment considerations
 */
function generateDeploymentConsiderations(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const hasConfig =
    diff.toLowerCase().includes("config") || diff.toLowerCase().includes("env");
  const hasDatabase =
    diff.toLowerCase().includes("migration") ||
    diff.toLowerCase().includes("schema");

  let considerations = "";
  if (hasConfig)
    considerations +=
      "- Configuration changes may require environment updates\n";
  if (hasDatabase)
    considerations +=
      "- Database migrations may be required before deployment\n";

  return (
    considerations ||
    "Standard deployment process should be sufficient for these changes."
  );
}

/**
 * Generates testing recommendations
 */
function generateTestingRecommendations(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const hasBusinessLogic =
    aiAnalysis.businessLogicExplanation &&
    !aiAnalysis.businessLogicExplanation.includes("unavailable");
  const hasIntegration =
    diff.toLowerCase().includes("api") ||
    diff.toLowerCase().includes("service");

  let recommendations = "";
  if (hasBusinessLogic)
    recommendations +=
      "- Unit tests required for business logic modifications\n";
  if (hasIntegration)
    recommendations += "- Integration tests needed for API/service changes\n";

  return (
    recommendations ||
    "Standard testing coverage should be adequate for these modifications."
  );
}

/**
 * Generates automated testing recommendations
 */
function generateAutomatedTestingRecommendations(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const functionCount = (diff.match(/function\s+\w+/g) || []).length;
  const hasAsync = diff.includes("async") || diff.includes("await");

  return `
**Automated Testing Strategy:**
- Unit test coverage: ${
    functionCount > 0
      ? `${functionCount} functions require testing`
      : "No new functions to test"
  }
- Integration testing: ${
    hasAsync
      ? "Async operations need integration tests"
      : "Standard integration tests sufficient"
  }
- Performance testing: ${
    diff.length > 1000
      ? "Recommended for large changes"
      : "Optional for current scope"
  }`;
}

/**
 * Analyzes technical debt
 */
function analyzeTechnicalDebt(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const hasComments =
    diff.includes("TODO") || diff.includes("FIXME") || diff.includes("HACK");
  const hasRefactoring = aiAnalysis.changeType === "refactor";

  if (hasRefactoring) {
    return "This change appears to reduce technical debt through refactoring efforts.";
  }

  if (hasComments) {
    return "Technical debt markers (TODO/FIXME) present - consider addressing in future iterations.";
  }

  return "No significant technical debt implications identified.";
}

/**
 * Analyzes future maintenance impact
 */
function analyzeFutureMaintenanceImpact(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const complexity = aiAnalysis.technicalComplexityAnalysis;
  const hasDocumentation = diff.includes("/**") || diff.includes("//");

  return `
**Maintainability Considerations:**
- Code documentation: ${
    hasDocumentation
      ? "Present and updated"
      : "May require additional documentation"
  }
- Future extensibility: ${
    complexity && complexity.includes("High")
      ? "May require careful planning for extensions"
      : "Should support future modifications well"
  }
- Knowledge transfer: ${
    diff.length > 500
      ? "Consider creating ADR for significant changes"
      : "Standard documentation sufficient"
  }`;
}

/**
 * Generates critical review points
 */
function generateCriticalReviewPoints(aiAnalysis: AIAnalysisResult): string {
  const points = [];

  if (
    aiAnalysis.securityComplianceAssessment &&
    !aiAnalysis.securityComplianceAssessment.includes("unavailable")
  ) {
    points.push(
      "**Security Review Required**: Changes affect security-sensitive areas"
    );
  }

  if (aiAnalysis.potentialUnnecessaryFiles.length > 0) {
    points.push(
      "**File Relevance**: Review flagged files for actual necessity"
    );
  }

  if (aiAnalysis.confidence < 0.7) {
    points.push(
      "**Manual Verification**: Low AI confidence requires thorough manual review"
    );
  }

  return points.length > 0
    ? points.join("\n")
    : "No critical review points identified - standard review process should be sufficient.";
}

/**
 * Generates change impact summary
 */
function generateChangeImpactSummary(
  diff: string,
  aiAnalysis: AIAnalysisResult
): string {
  const linesChanged = diff
    .split("\n")
    .filter((line) => line.startsWith("+") || line.startsWith("-")).length;

  return `
**Overall Impact Assessment:**
- **Scope**: ${
    linesChanged > 200 ? "Large" : linesChanged > 50 ? "Medium" : "Small"
  } (${linesChanged} lines changed)
- **Risk Level**: ${
    aiAnalysis.confidence > 0.8
      ? "Low"
      : aiAnalysis.confidence > 0.6
      ? "Medium"
      : "High"
  }
- **Business Impact**: ${
    aiAnalysis.businessLogicExplanation &&
    !aiAnalysis.businessLogicExplanation.includes("unavailable")
      ? "Significant"
      : "Minimal"
  }
- **Technical Complexity**: ${
    aiAnalysis.technicalComplexityAnalysis &&
    !aiAnalysis.technicalComplexityAnalysis.includes("unavailable")
      ? "Complex"
      : "Standard"
  }`;
}
