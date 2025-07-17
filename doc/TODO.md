# MVP Development Todo List - Cursor PR Doc Generator

## Key Insight: LLM-First Approach 🧠

**Why This Approach is Superior:**

Instead of manually parsing Git output, we leverage Cursor's LLM to:

- **Intelligently analyze** raw Git diffs and commit messages
- **Understand context** better than regex patterns ever could
- **Generate professional content** directly from code changes
- **Adapt to different** coding styles and project types
- **Reduce development time** by 60-70%

**Example Implementation:**

```javascript
// Old approach: Manual parsing 😴
function parseGitDiff(diff) {
  const lines = diff.split("\n");
  const changes = [];
  // 100+ lines of regex and parsing...
}

// New approach: LLM-powered 🚀
async function analyzeChanges(gitDiff, commits) {
  const prompt = `
    Analyze this git diff and commits:
    
    DIFF:
    ${gitDiff}
    
    COMMITS:
    ${commits}
    
    Generate a professional PR analysis with:
    - Summary of changes
    - Impact assessment
    - Testing recommendations
  `;

  return await llm.generate(prompt);
}
```

---

## Phase 1: Project Setup & Foundation

### 1.1 Initial Project Structure

- [x] Create project directory structure as per PRD specification
- [x] Initialize npm project with `package.json`
- [x] Set up basic folder structure:
  ```
  cursor-pr-doc-server/
  ├── src/
  │ ├── server.js
  │ ├── tools/
  │ ├── prompts/
  │ ├── services/
  │ └── templates/
  ├── config/
  │ └── prTemplates/
  └── README.md
  ```

### 1.2 Dependencies Installation

- [x] Install MCP server dependencies (`@modelcontextprotocol/sdk-typescript`)
- [x] implement git commands with exec
- [ ] Install file system and path utilities
- [ ] Install markdown processing libraries
- [ ] Set up development dependencies (eslint, prettier, nodemon)

### 1.3 Basic Configuration

- [ ] Create default PR template (`templates/defaultPRTemplate.md`)
- [ ] Set up company standard template (`config/prTemplates/companyStandard.md`)
- [ ] Create configuration schema for PR templates
- [ ] Set up environment configuration

---

## Phase 2: Git Data Collection (Zero Analysis Approach)

### 2.1 Raw Git Data Extraction Only

- [ ] Implement `gitService.js` with **ONLY** these Git commands:
  - [ ] `git status` - get current branch and working directory state
  - [ ] `git diff main...HEAD` - get raw diff between branches
  - [ ] `git log main..HEAD --oneline` - get commit messages
  - [ ] `git branch` - verify branch existence
  - [ ] `git diff --name-status main...HEAD` - get file change status

### 2.2 Data Aggregation (No Analysis!)

- [ ] **Simply collect and pass raw Git output to LLM - NO PROCESSING**
- [ ] Create data collection function that returns:
  ```javascript
  {
    rawDiff: "git diff output...",
    rawCommits: "git log output...",
    rawStatus: "git status output...",
    rawFileChanges: "git diff --name-status output..."
  }
  ```
- [ ] Add basic string concatenation for LLM context (no parsing!)

### 2.3 Error Handling (Minimal)

- [ ] Basic Git command execution validation
- [ ] Return error messages as raw text (let LLM handle explanations)
- [ ] Simple fallback: "Unable to get Git data" message

---

## Phase 3: Template System

### 3.1 Template Engine

- [ ] Create template parsing system for markdown files
- [ ] Implement variable substitution in templates
- [ ] Add support for conditional template sections
- [ ] Create template validation functionality

### 3.2 Default Templates

- [ ] Design and implement default PR template with:
  - [ ] Title generation
  - [ ] Description section
  - [ ] Changes list
  - [ ] Business logic section
  - [ ] ARD changes section
  - [ ] Testing instructions
  - [ ] Checklist items
  - [ ] Related issues links

### 3.3 Customization Support

- [ ] Implement JSON-based template configuration
- [ ] Add support for project-level templates (`.cursor/pr-templates/`)
- [ ] Create template override mechanism
- [ ] Add template validation and error handling

---

## Phase 4: MCP Server Integration

### 4.1 MCP Server Setup

- [ ] Initialize MCP server with proper configuration
- [ ] Set up server connection handling
- [ ] Implement server lifecycle management
- [ ] Add proper logging and monitoring

### 4.2 Tool Implementation

- [ ] Create `prDocTool.js` as MCP tool
- [ ] Define tool schema and parameters
- [ ] Implement tool execution logic
- [ ] Add tool result formatting

### 4.3 Prompt Implementation

- [ ] Create `prDocPrompt.js` for MCP prompt capability
- [ ] Define prompt schema and arguments
- [ ] Implement prompt execution
- [ ] Add context-aware prompt generation

---

## Phase 5: LLM-Centric Content Generation

### 5.1 Smart Content Generation (Leveraging Cursor's LLM)

- [ ] **Feed raw Git data directly to LLM for intelligent analysis**
- [ ] Create comprehensive prompts that include:
  - [ ] Raw git diff output
  - [ ] Commit message history
  - [ ] Current branch context
  - [ ] Template requirements
- [ ] Let LLM generate:
  - [ ] PR titles based on actual code changes
  - [ ] Detailed descriptions from diff analysis
  - [ ] Business logic impact assessment
  - [ ] Testing strategies based on changed files
  - [ ] Intelligent checklists based on change types

### 5.2 Context-Aware LLM Prompts

- [ ] **Replace manual parsing with intelligent prompting**
- [ ] Create prompts like:
  - [ ] "Analyze this git diff and generate a professional PR description..."
  - [ ] "Based on these file changes, suggest appropriate testing approaches..."
  - [ ] "Extract the business logic changes from this code diff..."
- [ ] Implement dynamic prompt construction based on change types
- [ ] Add code context injection for better LLM understanding

### 5.3 LLM Output Processing

- [ ] Implement structured output parsing from LLM responses
- [ ] Add validation for LLM-generated content
- [ ] Create fallback templates for LLM failures
- [ ] Format LLM output into proper markdown structure

---

## Phase 6: Core Functionality Testing

### 6.1 Unit Tests

- [ ] Test Git service functions
- [ ] Test template parsing and generation
- [ ] Test MCP tool and prompt functionality
- [ ] Test content generation logic

### 6.2 Integration Tests

- [ ] Test end-to-end PR document generation
- [ ] Test with different repository states
- [ ] Test custom template functionality
- [ ] Test error handling scenarios

### 6.3 Performance Testing

- [ ] Ensure PR generation completes in <10 seconds
- [ ] Test with various repository sizes
- [ ] Optimize Git operations for speed
- [ ] Test memory usage with large diffs

---

## Phase 7: Cursor IDE Integration

### 7.1 MCP Protocol Implementation

- [ ] Implement proper MCP message handling
- [ ] Add tool discovery mechanism
- [ ] Create argument schema for customization
- [ ] Implement proper response formatting

### 7.2 IDE Workflow Integration

- [ ] Test tool invocation from Cursor IDE
- [ ] Verify markdown output display in IDE
- [ ] Test "@" referencing functionality
- [ ] Ensure seamless user experience

### 7.3 Configuration Management

- [ ] Implement project-level configuration detection
- [ ] Add user preference handling
- [ ] Create configuration validation
- [ ] Add configuration update mechanisms

---

## Phase 8: Documentation & Deployment

### 8.1 Documentation

- [ ] Create comprehensive README.md
- [ ] Document installation and setup process
- [ ] Add usage examples and screenshots
- [ ] Create template customization guide
- [ ] Document MCP server configuration

### 8.2 Deployment Preparation

- [ ] Create installation scripts
- [ ] Add proper package.json scripts
- [ ] Create distribution build process
- [ ] Add version management

### 8.3 User Onboarding

- [ ] Create quick start guide
- [ ] Add template examples
- [ ] Create troubleshooting guide
- [ ] Add FAQ section

---

## Phase 9: MVP Validation & Refinement

### 9.1 MVP Testing

- [ ] Test with real repositories and branches
- [ ] Validate generated PR documents quality
- [ ] Test custom template functionality
- [ ] Verify performance requirements

### 9.2 User Experience Refinement

- [ ] Improve error messages and user feedback
- [ ] Optimize generated content quality
- [ ] Refine template customization process
- [ ] Enhance IDE integration smoothness

### 9.3 Bug Fixes & Polish

- [ ] Fix any discovered bugs
- [ ] Optimize performance bottlenecks
- [ ] Improve code quality and documentation
- [ ] Add missing edge case handling

---

## Development Priorities for MVP

### Must-Have Features (P0)

1. **Raw Git data extraction** (just run git commands)
2. **LLM-powered analysis** of Git output (let AI do the heavy lifting)
3. **MCP server integration** with Cursor IDE
4. **Template-guided LLM generation** for consistent output

### Should-Have Features (P1)

1. **Advanced LLM prompts** for better content quality
2. **Context-aware generation** based on file types and frameworks
3. **Structured output validation** from LLM responses
4. **Fallback mechanisms** for LLM failures

### Could-Have Features (P2)

1. **Multi-turn LLM conversations** for iterative improvement
2. **Project-specific LLM training** or fine-tuning
3. **LLM-generated template suggestions**
4. **Intelligent reviewer recommendations** via LLM analysis

---

## Success Criteria for MVP

- [ ] PR documents generated in <3 seconds
- [ ] Successfully integrates with Cursor IDE via MCP
- [ ] Supports basic template customization
- [ ] Handles common Git repository scenarios
- [ ] Provides professional, readable PR documents
- [ ] Includes proper error handling and user feedback

---

## Estimated Timeline (LLM-Optimized)

- **Phase 1-2**: (Setup + Simple Git Commands + LLM Integration)
- **Phase 3-4**: (LLM-Driven Templates + MCP Integration)
- **Phase 5-6**: (LLM Content Generation + Testing)
- **Phase 7-8**: (IDE Integration + Documentation)
- **Phase 9**: C(Validation + Refinement)

**Time Savings: ~30-40% reduction** by leveraging LLM for analysis instead of manual parsing!

---

## Next Steps After MVP

1. Integration with GitHub/GitLab APIs for direct PR creation as Draft
2. Advanced reviewer suggestion system
3. Jira/ticketing system integration
4. Multi-commit PR summarization
5. Draft PR creation with remote repositories
