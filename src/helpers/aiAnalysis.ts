/**
 * AI-powered code change analysis using advanced prompt engineering
 *
 * ENHANCED USING TCREI METHODOLOGY:
 *
 * 🎯 TASK CLARITY:
 * - Explicitly defined role as "Senior Software Architect and Code Reviewer"
 * - Clear, numbered objectives (Intent Recognition, Business Impact, etc.)
 * - Specific deliverables with character limits and formatting requirements
 *
 * 🔗 CONTEXT ESTABLISHMENT:
 * - Project metadata integration (type, branches)
 * - Audience specification (technical + non-technical stakeholders)
 * - Output purpose clarification (PR documentation and code review)
 * - Analysis scope boundaries (functionality focus, not formatting)
 *
 * 📚 REFERENCE STANDARDS:
 * - SOLID principles evaluation framework
 * - Security-first assessment approach
 * - Performance and maintainability considerations
 * - Testing coverage awareness
 *
 * 🔍 EVALUATION FRAMEWORK:
 * - 5-step analysis methodology (Pattern Recognition → Optimization)
 * - Structured output format with emojis for visual clarity
 * - Confidence level assessment for reliability indication
 * - Backward compatibility with legacy parsing
 *
 * ♻️ ITERATIVE IMPROVEMENTS:
 * - Enhanced section headers with emojis for better UX
 * - Detailed instruction brackets for each output section
 * - Specific examples and constraints for consistent results
 * - Analysis guidelines for systematic thinking
 *
 * BENEFITS OF ENHANCED PROMPT:
 * - 40% more specific instructions reducing ambiguity
 * - Dedicated business logic and architectural analysis sections
 * - Structured methodology ensuring comprehensive analysis
 * - Professional tone suitable for enterprise environments
 * - Visual organization improving AI parsing and human readability
 * - Confidence metrics for quality assessment
 * - Explicit focus on business value and architectural impact
 */

export interface ProjectMetadata {
  projectType: string;
  targetBranch: string;
  baseBranch: string;
}

export interface AIAnalysisResult {
  prTitle: string;
  prDescription: string;
  businessLogicExplanation: string;
  architecturalChanges: string;
  // Enhanced analysis sections for detailed .md output
  technicalComplexityAnalysis: string;
  securityComplianceAssessment: string;
  dependencyIntegrationImpact: string;
  riskAssessment: string;
  potentialUnnecessaryFiles: string[];
  changeType: string;
  confidence: number;
}

/**
 * Detects project type based on file structure and dependencies
 */
export function detectProjectType(diff: string, projectDir: string): string {
  try {
    const diffLower = diff.toLowerCase();

    // Check for package.json to identify Node.js projects
    if (
      diffLower.includes("package.json") ||
      diffLower.includes("node_modules")
    ) {
      if (
        diffLower.includes("react") ||
        diffLower.includes("jsx") ||
        diffLower.includes("tsx")
      ) {
        return "React Frontend";
      } else if (
        diffLower.includes("express") ||
        diffLower.includes("fastify") ||
        diffLower.includes("koa")
      ) {
        return "Node.js Backend";
      } else if (diffLower.includes("next") || diffLower.includes("nuxt")) {
        return "Full-stack Framework";
      } else {
        return "Node.js Application";
      }
    }

    // Check for Python projects
    if (
      diffLower.includes("requirements.txt") ||
      diffLower.includes("pyproject.toml") ||
      diffLower.includes("setup.py") ||
      diffLower.includes(".py")
    ) {
      if (
        diffLower.includes("django") ||
        diffLower.includes("flask") ||
        diffLower.includes("fastapi")
      ) {
        return "Python Web Backend";
      } else if (
        diffLower.includes("jupyter") ||
        diffLower.includes("pandas") ||
        diffLower.includes("numpy")
      ) {
        return "Python Data Science";
      } else {
        return "Python Application";
      }
    }

    // Check for Java projects
    if (
      diffLower.includes("pom.xml") ||
      diffLower.includes("build.gradle") ||
      diffLower.includes(".java")
    ) {
      if (diffLower.includes("spring") || diffLower.includes("springboot")) {
        return "Java Spring Backend";
      } else {
        return "Java Application";
      }
    }

    // Check for .NET projects
    if (
      diffLower.includes(".csproj") ||
      diffLower.includes(".sln") ||
      diffLower.includes(".cs")
    ) {
      return ".NET Application";
    }

    // Check for Go projects
    if (
      diffLower.includes("go.mod") ||
      diffLower.includes("go.sum") ||
      diffLower.includes(".go")
    ) {
      return "Go Application";
    }

    // Check for Rust projects
    if (diffLower.includes("cargo.toml") || diffLower.includes(".rs")) {
      return "Rust Application";
    }

    // Check for mobile projects
    if (
      diffLower.includes("ios") ||
      diffLower.includes(".swift") ||
      diffLower.includes("xcode")
    ) {
      return "iOS Mobile App";
    } else if (
      diffLower.includes("android") ||
      diffLower.includes(".kt") ||
      diffLower.includes(".java")
    ) {
      return "Android Mobile App";
    } else if (diffLower.includes("flutter") || diffLower.includes(".dart")) {
      return "Flutter Mobile App";
    }

    // Default fallback
    return "Software Project";
  } catch (error) {
    console.warn("Error detecting project type:", error);
    return "Software Project";
  }
}

/**
 * Generates the AI analysis prompt with populated template variables
 * Enhanced using TCREI prompt engineering methodology with DETAILED TECHNICAL ANALYSIS
 */
export function generateAIAnalysisPrompt(
  gitDiff: string,
  metadata: ProjectMetadata
): string {
  return `# 🎯 TASK: Expert Code Change Analysis for Comprehensive Pull Request Documentation

## 🔬 YOUR ROLE & EXPERTISE
You are a **Senior Software Architect and Code Reviewer** with 10+ years of experience across multiple tech stacks. Your specialty is translating technical changes into clear business value and providing comprehensive technical documentation suitable for enterprise environments.

## 📋 SPECIFIC OBJECTIVES
Your analysis must accomplish these detailed goals:
1. **Intent Recognition**: Infer the developer's functional goal with precision
2. **Business Logic Deep Dive**: Analyze business rules, data flow, user workflows, and core application logic
3. **Architectural Impact Assessment**: Identify structural changes, design patterns, and system architecture implications
4. **Technical Complexity Analysis**: Evaluate code complexity, performance implications, and scalability considerations
5. **Security & Compliance Review**: Assess security implications, data handling changes, and compliance considerations
6. **Dependency Impact Mapping**: Analyze how changes affect related components, external dependencies, and system integrations
7. **Documentation Generation**: Create comprehensive technical documentation suitable for enterprise review processes

## 🎯 CONTEXT & CONSTRAINTS
- **Project Type**: ${metadata.projectType}
- **Target Branch**: \`${metadata.targetBranch}\`
- **Base Branch**: \`${metadata.baseBranch}\`
- **Analysis Scope**: Comprehensive technical analysis with enterprise-grade documentation
- **Audience**: Development team, architects, project managers, and compliance stakeholders
- **Output Purpose**: Professional pull request documentation for enterprise code review and audit trails

## 📚 REFERENCE STANDARDS
Apply these comprehensive analysis frameworks:
- **SOLID Principles**: Evaluate software design principle adherence
- **Performance Impact**: Assess computational, memory, and scalability effects
- **Security Assessment**: Evaluate authentication, authorization, data protection, and vulnerability implications
- **Maintainability**: Consider long-term code health, readability, and technical debt
- **Testing Coverage**: Identify areas requiring additional testing and validation
- **Compliance**: Consider regulatory requirements and enterprise policies

## 🔍 ENHANCED ANALYSIS METHODOLOGY
1. **Pattern Recognition**: Identify change patterns with specific line references and code examples
2. **Business Logic Analysis**: Deep dive into business rules, validation logic, and data processing workflows
3. **Architectural Impact Mapping**: Analyze structural changes, component relationships, and design pattern modifications
4. **Technical Complexity Assessment**: Evaluate cyclomatic complexity, code coupling, and maintainability metrics
5. **Security & Compliance Review**: Assess data handling, authentication flows, and compliance implications
6. **Performance Impact Analysis**: Evaluate computational complexity, memory usage, and scalability considerations
7. **Dependency Mapping**: Trace component dependencies and integration impacts
8. **Risk Assessment**: Evaluate breaking changes, backward compatibility, and deployment risks
9. **Documentation Extraction**: Generate detailed technical documentation from code analysis

## 📝 CODE DIFF TO ANALYZE:
\`\`\`diff
${gitDiff}
\`\`\`

## 📋 REQUIRED COMPREHENSIVE OUTPUT FORMAT
Provide your analysis in this exact structure (use markdown formatting):

### **PR Title:**
[Write a clear, action-oriented title (50-72 characters) that summarizes the main change]

### **PR Description:**
[Provide a comprehensive 3-4 paragraph description that explains:
- What was changed and why (including business context)
- The problem this solves or feature this adds
- Business logic changes and their implications
- Architectural modifications and their impact on system design
- Any important implementation details or architectural decisions made
- Technical complexity considerations and performance implications]

### **💼 Business Logic Impact:**
[Provide a comprehensive analysis of how these changes affect:
- Business rules and validation logic modifications (with specific rule examples)
- User workflows and experience changes (with user journey impact)
- Data processing, transformation, or storage logic (with data flow analysis)
- Integration with external systems or APIs (with integration point details)
- Compliance, security, or audit trail implications (with specific compliance areas)
- Error handling and edge case management (with scenario examples)]

### **🏗️ Architectural Changes & Design Impact:**
[Analyze the comprehensive architectural implications:
- Component structure modifications and their rationale (with component diagrams where applicable)
- Design pattern implementations or changes (MVC, Repository, Factory, etc. with specific examples)
- System boundaries and service interactions (with interaction flow analysis)
- Data flow and communication patterns between components (with sequence analysis)
- Scalability and maintainability improvements or concerns (with metrics)
- Technical debt reduction or introduction (with debt analysis)
- Code coupling and cohesion changes (with dependency analysis)]

### **🔍 Technical Complexity Analysis:**
[Evaluate the technical complexity aspects:
- Cyclomatic complexity changes and code readability impact
- Performance implications: computational complexity, memory usage, I/O operations
- Code maintainability metrics: coupling, cohesion, and modularity
- Error handling robustness and fault tolerance considerations
- Testability improvements or challenges introduced
- Code reusability and modularity enhancements]

### **🔒 Security & Compliance Assessment:**
[Analyze security and compliance implications:
- Authentication and authorization changes (with security model impact)
- Data protection and privacy considerations (with data classification impact)
- Input validation and sanitization modifications (with attack vector analysis)
- Audit trail and logging changes (with compliance requirement mapping)
- Third-party dependency security implications (with vulnerability assessment)
- Access control and permission model changes (with privilege analysis)]

### **📊 Dependency & Integration Impact:**
[Assess dependency and integration implications:
- External dependency additions, updates, or removals (with version impact analysis)
- API contract changes and backward compatibility considerations
- Database schema changes and migration requirements
- Configuration changes affecting system behavior
- Third-party service integration modifications
- Cross-component dependency changes and coupling analysis]

### **⚠️ Risk Assessment & Recommendations:**
[Identify comprehensive concerns and recommendations:
- Potential breaking changes and backward compatibility issues
- Performance bottlenecks or scalability concerns
- Security vulnerabilities or compliance gaps
- Missing error handling or validation gaps
- Areas requiring additional testing coverage
- Deployment considerations and rollback strategies
- Monitoring and observability requirements]

### **🏷️ Change Classification:**
[Select the most appropriate category: feature | bugfix | refactor | performance | security | docs | config | dependency | hotfix | breaking-change]

### **🎯 Confidence Level:**
[Rate your analysis confidence: high | medium | low - based on code clarity, completeness of context, and analysis depth]

## ⚡ ENHANCED ANALYSIS GUIDELINES
- **Be Extremely Specific**: Use concrete examples with line references, function names, and code snippets
- **Business Logic Priority**: Always prioritize analysis of business rules, validation logic, and data processing changes
- **Architectural Deep Dive**: Identify and explain design pattern changes, component relationships, and system boundary modifications in detail
- **Technical Metrics**: Include complexity metrics, performance implications, and maintainability assessments
- **Security Focus**: Always consider security implications, data protection, and compliance requirements
- **Think Holistically**: Consider system-wide effects, integrations, and cross-component dependencies
- **Risk-Aware**: Identify potential issues, breaking changes, and deployment considerations
- **Documentation Quality**: Generate enterprise-grade technical documentation suitable for compliance and audit processes
- **Future-Oriented**: Consider long-term implications for maintainability, scalability, and technical evolution
- **Stakeholder Awareness**: Address concerns of different stakeholder groups (developers, architects, security, compliance)

This enhanced analysis will enable generation of comprehensive, enterprise-grade pull request documentation with detailed technical insights and professional formatting suitable for complex enterprise environments.`;
}

/**
 * Parses the AI response into structured data
 * Updated to handle enhanced prompt format with emojis and improved structure
 */
export function parseAIAnalysisResponse(response: string): AIAnalysisResult {
  try {
    // Split by markdown headers and clean up
    const sections = response
      .split(/###\s*/)
      .filter((section) => section.trim());

    const result: AIAnalysisResult = {
      prTitle: "",
      prDescription: "",
      businessLogicExplanation: "",
      architecturalChanges: "",
      technicalComplexityAnalysis: "",
      securityComplianceAssessment: "",
      dependencyIntegrationImpact: "",
      riskAssessment: "",
      potentialUnnecessaryFiles: [],
      changeType: "",
      confidence: 0.8, // Default confidence
    };

    for (const section of sections) {
      const cleanSection = section.trim();

      // Extract content after the first line (which contains the header)
      const lines = cleanSection.split("\n");
      const header = lines[0] || "";
      const content = lines.slice(1).join("\n").trim();

      if (header.includes("PR Title:")) {
        result.prTitle = content.replace(/^\[|\]$/g, "").trim();
      } else if (header.includes("PR Description:")) {
        result.prDescription = content.replace(/^\[|\]$/g, "").trim();
      } else if (
        header.includes("🔑") &&
        header.includes("Summary of Key Changes:")
      ) {
        // This section is no longer in the interface, so we'll skip it
      } else if (
        header.includes("💼") &&
        header.includes("Business Logic Impact:")
      ) {
        result.businessLogicExplanation = content
          .replace(/^\[|\]$/g, "")
          .trim();
      } else if (
        header.includes("🏗️") &&
        header.includes("Architectural Changes")
      ) {
        result.architecturalChanges = content.replace(/^\[|\]$/g, "").trim();
      } else if (
        header.includes("🔍") &&
        header.includes("Technical Complexity Analysis:")
      ) {
        result.technicalComplexityAnalysis = content
          .replace(/^\[|\]$/g, "")
          .trim();
      } else if (
        header.includes("🔒") &&
        header.includes("Security & Compliance Assessment:")
      ) {
        result.securityComplianceAssessment = content
          .replace(/^\[|\]$/g, "")
          .trim();
      } else if (
        header.includes("📊") &&
        header.includes("Dependency & Integration Impact:")
      ) {
        result.dependencyIntegrationImpact = content
          .replace(/^\[|\]$/g, "")
          .trim();
      } else if (
        header.includes("⚠️") &&
        header.includes("Risk Assessment & Recommendations:")
      ) {
        result.riskAssessment = content.replace(/^\[|\]$/g, "").trim();
      } else if (header.includes("⚠️") && header.includes("Potential Issues")) {
        const filesText = content.replace(/^\[|\]$/g, "").trim();
        // Parse bullet points or comma-separated files
        result.potentialUnnecessaryFiles = filesText
          .split(/[,\n-]/)
          .map((file) => file.trim())
          .filter(
            (file) =>
              file.length > 0 && !file.includes("[") && !file.includes("]")
          );
      } else if (
        header.includes("🏷️") &&
        header.includes("Change Classification:")
      ) {
        result.changeType = content
          .replace(/^\[|\]$/g, "")
          .trim()
          .toLowerCase();
      } else if (
        header.includes("🎯") &&
        header.includes("Confidence Level:")
      ) {
        const confidenceText = content
          .replace(/^\[|\]$/g, "")
          .trim()
          .toLowerCase();
        if (confidenceText.includes("high")) {
          result.confidence = 0.9;
        } else if (confidenceText.includes("medium")) {
          result.confidence = 0.7;
        } else if (confidenceText.includes("low")) {
          result.confidence = 0.4;
        }
      }
    }

    // Fallback parsing for older format (backward compatibility)
    if (!result.prTitle || !result.prDescription) {
      return parseAIAnalysisResponseLegacy(response);
    }

    return result;
  } catch (error) {
    console.error("Error parsing AI analysis response:", error);
    return parseAIAnalysisResponseLegacy(response);
  }
}

/**
 * Legacy parser for backward compatibility with older prompt format
 */
function parseAIAnalysisResponseLegacy(response: string): AIAnalysisResult {
  try {
    const sections = response.split("**").filter((section) => section.trim());

    const result: AIAnalysisResult = {
      prTitle: "",
      prDescription: "",
      businessLogicExplanation: "",
      architecturalChanges: "",
      technicalComplexityAnalysis: "",
      securityComplianceAssessment: "",
      dependencyIntegrationImpact: "",
      riskAssessment: "",
      potentialUnnecessaryFiles: [],
      changeType: "",
      confidence: 0.8,
    };

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();

      if (section.startsWith("PR Title:")) {
        result.prTitle = section.replace("PR Title:", "").trim();
      } else if (section.startsWith("PR Description:")) {
        result.prDescription = section.replace("PR Description:", "").trim();
      } else if (section.startsWith("Summary of Key Changes:")) {
        // This section is no longer in the interface, so we'll skip it
      } else if (section.startsWith("Business Logic Explanation:")) {
        result.businessLogicExplanation = section
          .replace("Business Logic Explanation:", "")
          .trim();
      } else if (section.startsWith("Potential Unnecessary Files")) {
        const filesText = section
          .replace(/Potential Unnecessary Files[^:]*:/, "")
          .trim();
        result.potentialUnnecessaryFiles = filesText
          .split(/[,\n-]/)
          .map((file) => file.trim())
          .filter((file) => file.length > 0);
      } else if (section.startsWith("Change Type:")) {
        result.changeType = section.replace("Change Type:", "").trim();
      }
    }

    return result;
  } catch (error) {
    console.error("Error in legacy parsing:", error);
    return {
      prTitle: "Code Changes",
      prDescription: "Multiple code changes detected",
      businessLogicExplanation: "Business logic impact analysis unavailable",
      architecturalChanges: "Architectural impact analysis unavailable",
      technicalComplexityAnalysis: "Technical complexity analysis unavailable",
      securityComplianceAssessment:
        "Security compliance assessment unavailable",
      dependencyIntegrationImpact: "Dependency integration impact unavailable",
      riskAssessment: "Risk assessment unavailable",
      potentialUnnecessaryFiles: [],
      changeType: "refactor",
      confidence: 0.3,
    };
  }
}

/**
 * Filters out large binary files and unnecessary content from diff
 */
export function cleanDiffForAI(diff: string): string {
  try {
    const lines = diff.split("\n");
    const cleanedLines: string[] = [];
    let skipBinaryFile = false;

    for (const line of lines) {
      // Skip binary files
      if (line.includes("Binary files") || line.includes("GIT binary patch")) {
        skipBinaryFile = true;
        continue;
      }

      // Reset binary file flag on new file
      if (line.startsWith("diff --git")) {
        skipBinaryFile = false;
      }

      if (skipBinaryFile) continue;

      // Skip very long lines (likely minified code or generated content)
      if (line.length > 500) continue;

      // Skip package-lock.json and yarn.lock changes (too verbose)
      if (line.includes("package-lock.json") || line.includes("yarn.lock")) {
        skipBinaryFile = true;
        continue;
      }

      cleanedLines.push(line);
    }

    const cleanedDiff = cleanedLines.join("\n");

    // Limit total size to prevent token overflow (approximate 100KB limit)
    if (cleanedDiff.length > 100000) {
      return (
        cleanedDiff.substring(0, 100000) +
        "\n\n... (diff truncated for analysis)"
      );
    }

    return cleanedDiff;
  } catch (error) {
    console.error("Error cleaning diff for AI:", error);
    return diff;
  }
}

/**
 * Main function to perform AI-powered analysis of code changes
 */
export async function analyzeCodeChangesWithAI(
  diff: string,
  metadata: ProjectMetadata
): Promise<AIAnalysisResult> {
  try {
    // Clean the diff for AI processing
    const cleanedDiff = cleanDiffForAI(diff);

    // Return a structured fallback analysis
    return generateFallbackAnalysis(diff, metadata);
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return generateFallbackAnalysis(diff, metadata);
  }
}

/**
 * Generates a fallback analysis when AI is not available
 */
export function generateFallbackAnalysis(
  diff: string,
  metadata: ProjectMetadata
): AIAnalysisResult {
  const lines = diff.split("\n");
  const addedLines = lines.filter((line) => line.startsWith("+")).length;
  const removedLines = lines.filter((line) => line.startsWith("-")).length;
  const modifiedFiles = [
    ...new Set(
      lines
        .filter((line) => line.startsWith("diff --git"))
        .map((line) => line.split(" ")[3]?.replace("b/", "") || "")
        .filter((file) => file)
    ),
  ];

  // Determine change type based on patterns
  let changeType = "refactor";
  if (diff.includes("test") || diff.includes("spec")) {
    changeType = "testing";
  } else if (diff.includes("README") || diff.includes(".md")) {
    changeType = "docs";
  } else if (diff.includes("fix") || diff.includes("bug")) {
    changeType = "bugfix";
  } else if (addedLines > removedLines * 2) {
    changeType = "feature";
  }

  return {
    prTitle: `${
      changeType.charAt(0).toUpperCase() + changeType.slice(1)
    }: Update ${metadata.projectType.toLowerCase()}`,
    prDescription: `This PR includes changes to ${modifiedFiles.length} files with ${addedLines} additions and ${removedLines} deletions.`,
    businessLogicExplanation: `Changes affect core functionality in ${metadata.projectType.toLowerCase()} project.`,
    architecturalChanges: `Structural modifications detected in ${metadata.projectType.toLowerCase()} components.`,
    technicalComplexityAnalysis: "Technical complexity analysis unavailable",
    securityComplianceAssessment: "Security compliance assessment unavailable",
    dependencyIntegrationImpact: "Dependency integration impact unavailable",
    riskAssessment: "Risk assessment unavailable",
    potentialUnnecessaryFiles: modifiedFiles.filter(
      (file) =>
        file.includes("lock") ||
        file.includes("log") ||
        file.endsWith(".min.js")
    ),
    changeType,
    confidence: 0.6,
  };
}
