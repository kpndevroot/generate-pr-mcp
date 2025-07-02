# 🚀 Generate PR MCP

<div align="center">

![PR Generation Meme](https://i.imgflip.com/8i7s5k.jpg)

_When your PR description writes itself_

[![npm version](https://img.shields.io/npm/v/generate-pr-mcp.svg)](https://www.npmjs.com/package/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

## 📋 Overview

A Model Context Protocol server that automatically generates detailed Pull Request descriptions from your code changes. Say goodbye to writing PR descriptions manually!

## ✨ Features

### Core Features

- 🔍 Analyzes git diffs to create comprehensive PR descriptions
- 📊 Highlights key implementation points and code changes
- 🧩 Modular template architecture for customized PR generation
- 🔎 Automatic project type detection
- 📝 Generates markdown files for easy sharing
- 🖼️ Support for including before/after screenshots

### 🤖 NEW: AI-Powered Analysis

#### 🎯 **Cursor AI Integration** (Recommended)

- ✅ **Zero Configuration** - No API keys required!
- 🚀 **Instant Setup** - Works out of the box with Cursor
- 🎯 **Context-Aware** - Leverages Cursor's project understanding
- 🔒 **Privacy-First** - No external API calls

#### 🧠 **Advanced AI Features**

- 🧠 **Intelligent Code Understanding** - AI analyzes business logic and intent
- 🎯 **Smart Change Categorization** - Automatic detection of bug fixes, features, refactoring
- 📋 **Enhanced Descriptions** - Context-aware explanations of what changed and why
- ⚠️ **Unnecessary File Detection** - AI identifies files with minimal functional impact
- 🔄 **Project Type Intelligence** - Advanced detection for React, Node.js, Python, Java, and more
- 💡 **Fallback Safety** - Graceful degradation to traditional analysis when AI unavailable

## 🛠️ Installation

```bash
# Install globally
npm install -g generate-pr-mcp

# Or use with npx
npx generate-pr-mcp
```

## configuration with cursor

````bash
# get the path to the generate-pr-mcp package

npm list -g generate-pr-mcp --parseable

## output => /Users/username/.nvm/versions/node/v22.14.0/lib/node_modules/generate-pr-mcp/build/index.js

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": [
        "/Users/username /.nvm/versions/node/v22.14.0/lib/node_modules/generate-pr-mcp/build/index.js"
      ]
    }
  }
}
````

## 🚦 Usage

### Traditional PR Generation

```bash
# Basic PR generation using the generate_pr tool
{
  "name": "generate_pr",
  "arguments": {
    "title": "Add user authentication system",
    "description": "Implement JWT-based authentication with login/logout functionality",
    "rootUri": "file:///path/to/your/project"
  }
}
```

### 🤖 AI-Powered PR Generation

```bash
# Enhanced AI analysis using the generate_ai_pr tool
{
  "name": "generate_ai_pr",
  "arguments": {
    "title": "Add user authentication system",
    "description": "Implement JWT-based authentication with login/logout functionality",
    "rootUri": "file:///path/to/your/project",
    "llmProvider": "openai",
    "apiKey": "your-api-key-here",
    "model": "gpt-4"
  }
}
```

### 🎯 Cursor AI Integration (Recommended)

```bash
# Use Cursor's built-in AI - no API keys required!
{
  "name": "generate_cursor_pr",
  "arguments": {
    "title": "Add user authentication system",
    "description": "Implement JWT-based authentication with login/logout functionality",
    "rootUri": "file:///path/to/your/project"
  }
}
```

### Available Tools

| Tool                  | Description               | AI Features                        | Configuration      |
| --------------------- | ------------------------- | ---------------------------------- | ------------------ |
| `generate_pr`         | Traditional analysis      | Basic diff processing              | None required      |
| `generate_cursor_pr`  | **Cursor AI integration** | **Intelligent code understanding** | **None required!** |
| `generate_ai_pr`      | External AI providers     | Advanced LLM analysis              | API keys required  |
| `show_working_stages` | Display processing stages | Progress visualization             | None required      |

> 📖 **Detailed Guides**:
>
> - 🎯 **Cursor AI Integration**: [examples/cursor-ai-example.md](examples/cursor-ai-example.md) - **Recommended** for zero-config AI analysis
> - 🤖 **External LLM Setup**: [examples/ai-pr-example.md](examples/ai-pr-example.md) - For OpenAI, Anthropic, and custom APIs

### 📝 Example Output

The tool generates a structured PR document including:

- PR title and description
- Summary of changes
- Key implementation points
- Code highlights
- Testing instructions

## 🔄 How It Works

1. Detects the current git branch and finds the base branch (main/master)
2. Analyzes the diff between branches or staged changes
3. Processes the diff to identify key changes
4. Generates a formatted PR description using templates
5. Saves the output to a markdown file

## 🧪 Supported Project Types

The tool automatically detects and optimizes PR descriptions for:

- JavaScript/TypeScript projects
- React applications
- Node.js backends
- And more!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
