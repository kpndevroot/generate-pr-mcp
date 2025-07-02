# 🎯 Generate PR MCP

<div align="center">

![PR Generation Meme](https://i.imgflip.com/8i7s5k.jpg)

_When your PR description writes itself with zero configuration_

[![npm version](https://img.shields.io/npm/v/generate-pr-mcp.svg)](https://www.npmjs.com/package/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

## 📋 Overview

A zero-configuration Model Context Protocol server that automatically generates detailed Pull Request descriptions using built-in AI. Works seamlessly with **Claude Desktop** and **Cursor IDE** - no API keys, no setup, no hassle!

## ✨ Features

### 🎯 Zero Configuration

- ✅ **No API Keys Required** - Uses AI capabilities from your client
- 🚀 **Instant Setup** - Works out of the box with Claude Desktop and Cursor IDE
- 🎯 **Context-Aware** - Leverages your IDE's project understanding
- 🔒 **Privacy-First** - No external API calls or data sharing

### 🤖 Intelligent Analysis

- 🧠 **Smart Code Understanding** - AI analyzes business logic and intent
- 🎯 **Automatic Change Categorization** - Detects bug fixes, features, refactoring
- 📋 **Enhanced Descriptions** - Context-aware explanations of what changed and why
- ⚠️ **File Relevance Detection** - Identifies files with minimal functional impact
- 🔄 **Project Type Intelligence** - Advanced detection for React, Node.js, Python, Java, and more
- 💡 **Fallback Safety** - Graceful degradation when AI unavailable

### 📝 Professional Output

- 🔍 Analyzes git diffs to create comprehensive PR descriptions
- 📊 Highlights key implementation points and code changes
- 🧩 Professional template structure
- 🔎 Automatic project type detection
- 📝 Generates markdown files for easy sharing

## 🛠️ Installation

```bash
# Install globally
npm install -g generate-pr-mcp

# Or use with npx
npx generate-pr-mcp
```

## ⚙️ Configuration

### 🤖 **Claude Desktop Setup** (Recommended)

Claude Desktop provides the most powerful AI integration with no configuration required.

#### **Step 1: Get Installation Path**

```bash
# Get the path to the generate-pr-mcp package
npm list -g generate-pr-mcp --parseable

# Output example: /Users/username/.nvm/versions/node/v22.14.0/lib/node_modules/generate-pr-mcp/build/index.js
```

#### **Step 2: Configure Claude Desktop**

**For macOS:**

```bash
# Open Claude Desktop configuration directory
open ~/Library/Application\ Support/Claude/
```

**For Windows:**

```bash
# Navigate to Claude Desktop configuration directory
# %APPDATA%\Claude\
```

**For Linux:**

```bash
# Navigate to Claude Desktop configuration directory
~/.config/Claude/
```

#### **Step 3: Create/Edit Configuration File**

Create or edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": [
        "/path/to/your/npm/global/node_modules/generate-pr-mcp/build/index.js"
      ]
    }
  }
}
```

**Replace `/path/to/your/npm/global/` with your actual npm global path from Step 1.**

#### **Step 4: Restart Claude Desktop**

- Quit Claude Desktop completely
- Relaunch the application
- You should now see the MCP server connected in Claude Desktop

### 🎯 **Cursor IDE Setup**

For Cursor IDE users who prefer the original Cursor AI integration:

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": [
        "/path/to/your/npm/global/node_modules/generate-pr-mcp/build/index.js"
      ]
    }
  }
}
```

## 🚦 Usage

### 🤖 **With Claude Desktop**

Once configured, simply ask Claude in the desktop app:

```
Generate a PR for my current changes with the title "Add user authentication" and description "Implement JWT-based authentication with login/logout functionality"
```

Claude will automatically use the MCP server to analyze your project and generate a comprehensive PR document.

### 🎯 **Direct MCP Tool Usage**

For advanced users or programmatic access:

```json
{
  "name": "generate_ai_pr",
  "arguments": {
    "title": "Add user authentication system",
    "description": "Implement JWT-based authentication with login/logout functionality",
    "rootUri": "file:///path/to/your/project"
  }
}
```

### 📋 Parameters

| Parameter     | Type   | Required | Description                        |
| ------------- | ------ | -------- | ---------------------------------- |
| `title`       | string | ✅       | The title of the PR                |
| `description` | string | ✅       | Brief description of the changes   |
| `rootUri`     | string | ✅       | Root URI of your project directory |

### 📝 Example Output

The tool generates a comprehensive PR document including:

- 🎯 Professional PR title and description
- 📊 Summary of key changes with business context
- 🔧 Implementation details and technical approach
- ✅ Testing checklist and coverage details
- 📋 Change type categorization (feature/bugfix/refactor)
- 🧪 Reviewer guidance and checkpoints

## 🔄 How It Works

1. **Git Analysis**: Detects current branch and finds base branch (main/master)
2. **Diff Processing**: Analyzes differences between branches or staged changes
3. **AI Enhancement**: Uses your client's AI to understand code context and business logic
4. **Smart Generation**: Creates structured PR descriptions with intelligent insights
5. **File Output**: Saves professional markdown document to your project

## 🧪 Supported Project Types

Auto-detects and optimizes PR descriptions for:

- ⚛️ React applications
- 🟢 Node.js backends
- 🐍 Python web apps
- ☕ Java applications
- 🔷 TypeScript projects
- 🦀 Rust applications
- 🟦 Go services
- And more!

## 💡 Benefits & Comparison

### ✅ Benefits

- **🚀 Zero Setup Time**: Install and use immediately
- **🔒 Privacy-First**: No data leaves your development environment
- **💰 Cost-Free**: No API usage costs or subscription fees
- **🎯 Context-Aware**: Understands your specific project structure
- **🤖 Intelligent**: Real AI analysis without configuration hassle
- **📱 Multi-Platform**: Works with Claude Desktop and Cursor IDE

### ⚖️ Pros vs Cons

#### ✅ Pros

- Zero configuration required
- No API keys or accounts needed
- Privacy-focused (no external calls)
- Cost-effective (completely free)
- Instant setup and usage
- Professional PR templates
- Smart project type detection
- Works with multiple AI platforms

#### ⚠️ Cons

- Requires compatible AI client (Claude Desktop or Cursor)
- AI analysis depends on client AI availability
- Currently focused on PR generation

## 🎯 Perfect For

- **Claude Desktop Users**: Seamless integration with Claude's AI
- **Cursor Users**: Native integration with Cursor's AI capabilities
- **Privacy-Conscious Teams**: No external API calls
- **Quick Prototyping**: Zero setup for immediate productivity
- **Cost-Sensitive Projects**: No additional AI service costs
- **Enterprise Environments**: Privacy-compliant by design

## 🔧 Troubleshooting

### Common Issues:

1. **MCP Server Not Found**

   - Verify the path in your configuration file
   - Ensure the package is installed globally
   - Check that `build/index.js` exists

2. **Permission Errors**

   - Make sure the MCP server file is executable
   - Check file permissions: `chmod +x build/index.js`

3. **Git Repository Issues**

   - Ensure you're in a valid git repository
   - Make sure you have commits or staged changes
   - Verify git is installed and accessible

4. **Configuration Problems**
   - Validate JSON syntax in configuration file
   - Restart your AI client after configuration changes
   - Check the client's MCP server logs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for the Claude Desktop and Cursor communities**
