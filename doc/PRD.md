Product Requirement Document (PRD): Automated Pull Request Document Generation in Cursor IDE via MCP Server
Date: July 16, 2025

1. Objective
   Enable seamless, automated generation of professional and customizable pull request (PR) documents inside Cursor IDE, powered by an MCP (Model Context Protocol) server. The system analyzes local Git changes between feature and main branches, applies company PR standards, and integrates with the developer’s workflow—maximizing productivity and code quality.

2. Stakeholders

   - Developers using Cursor IDE
   - DevOps/Release engineering teams
   - QA and Reviewers
     d- Project/Product Managers

3. Key Features

   - Automated Git Change Detection:
     Compare current feature branch against main; extract modified files, commit messages, and code diffs.

   - Professional, Customizable PR Generation:
     Use LLM-driven templates to create PR titles, descriptions,
     changes made,business logic, ARD changes(architecture review document changes), checklists, related issue links and summaries—following predefined or company-specific formats.

   - MCP Server Integration:
     Communicate with Cursor IDE through the MCP protocol, exposing PR document generation as a discoverable prompt/tool.

   - User Customization:
     PR template sections and formats are user-modifiable within Cursor, supporting unique corporate or team standards,it may use with help of an json file.

   - Contextual and Code-aware:
     PR documents reference code changes, related comments, and documentation to ensure completeness.

   - IDE-native Workflow:
     All actions—triggering PR generation, modifying output—occur within the Cursor IDE with minimal user friction.

4. High-Level User Flow
   text

   ```mermaid
   flowchart TD
   A[User opens Cursor IDE] --> B[User switches to a feature branch]
   B --> C[User invokes PR generation prompt/tool]
   C --> D[Cursor sends MCP request to PR Doc Server]
   D --> E[Server executes: git diff feature ↔ main, aggregates changes]
   E --> F[Server generates PR doc with LLM and configured template]
   F --> G[Server returns generated PR doc markdown to Cursor]
   G --> H[User reviews & edits PR doc in IDE]
   H --> I[User executes PR creation to GitHub/GitLab]
   I --> J[Cursor tracks PR status, updates, and links to the PR]
   ```

5. Detailed Functional Requirements
   5.1 Git Change Extraction
   Detect the base (main) and compare with the current (feature) branch.

Summarize:

List of affected files

Commit messages and links (if available)

Code snippets (optional)

Change statistics

5.2 LLM-driven PR Document Generation
Inputs:

Diff summary

Commit messages

Related issues (parsed via keywords or manually specified)

Template/Prompt preferences

Outputs:

Title

Description (issue addressed, approach, rationale)

Changes list

Business logic

ARD changes

Testing instructions

Checklist (customizable)

Linked issues/tickets

Employ prompt templates that can be company-specific and easily updated by users.

5.3 MCP Server & Cursor Integration
Expose PR generation as a prompt or tool via MCP interface.

Register prompt/tool metadata for discovery within Cursor’s UI.

Support argument schemas for customizable PR generation.

Enable “@” referencing for code or documentation context inside PRs.

5.4 User Customization
Users can edit PR templates via:

Project-level config (.cursor/pr-templates/) is must a json file.

In-line edits in Cursor after PR draft generation

5.5 PR Submission and Status Tracking
Enable single-click PR creation within Cursor, integrating with local git in mcp , after that it will be submitted to the remote git repository.

Display PR creation progress and status updates.

Show links to created PRs and related commits.

6. Non-Functional Requirements
   Speed: PR drafts generated in <3 seconds for midsize repos.

Reliability: Robust error handling if git status/diff fails or repo is dirty.

Security: Operate only on local repo data, no external egress unless explicitly authorized.

Extensibility: Easily add new PR templates, company policies, or review checklists.

```code
7. Project Structure (Recommended)
   text
   cursor-pr-doc-server/
   ├── src/
   │ ├── server.js
   │ ├── tools/
   │ │ └── prDocTool.js
   │ ├── prompts/
   │ │ └── prDocPrompt.js # For MCP prompt capability
   │ ├── services/
   │ │ └── gitService.js
   │ └── templates/
   │ └── defaultPRTemplate.md
   ├── config/
   │ └── prTemplates/
   │ └── companyStandard.md
   ├── package.json
   └── README.md
```

8. Technical Implementation
   Procedural: User triggers → git diff → LLM prompt → PR doc → review/submit

Computational: Efficient parsing and summarization of git diff/log outputs show in code context of cursor as .md format.

Analytical: Intelligent LLM context construction (related issues, meaningful change summaries)

Logical: Validation of branch states and PR doc content (required fields present, correct format)

9. References
   [Actual Budget: Cursor IDE and MCP server setup, automation, and PR guidance]

[Cursor community: Generating PR descriptions from diff and prompt modification]

[Cursor IDE: AI features, code automation, and prompt usage]

[Documentation from Cursor: Using context for documentation generation]

[Cursor Doc Automation extension: PR automation, doc generation]

10. Future Roadmap
    - Suggest reviewers and reviewers checklist from company config
    - Integration with Jira and ticketing systems for cross-linking PRs and tasks
    - Auto-detection and summarization of large, multi-commit/feature PRs
    - Make pull request as draft with remote repo using github/gitlab api

This PRD enables rapid, professional, and adaptive PR creation in Cursor IDE leveraging an MCP server and best-in-class AI tooling.
