# 🤖 Claude Desktop Setup Guide

Complete guide to set up the Generate PR MCP server with Claude Desktop for zero-configuration AI-powered PR generation.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Claude Desktop** installed ([Download here](https://claude.ai/download))
- ✅ **Node.js** (v18 or later) ([Download here](https://nodejs.org/))
- ✅ **Git** repository with changes to analyze
- ✅ **Admin/write access** to Claude Desktop configuration directory

## 🚀 Quick Setup (5 minutes)

### Step 1: Install the MCP Server

```bash
# Install globally
npm install -g generate-pr-mcp

# Verify installation
npm list -g generate-pr-mcp
```

### Step 2: Get Installation Path

```bash
# macOS/Linux
npm list -g generate-pr-mcp --parseable

# Windows
npm list -g generate-pr-mcp --parseable
```

**Example output:**

```
/Users/username/.nvm/versions/node/v22.14.0/lib/node_modules/generate-pr-mcp
```

**Save this path** - you'll need it for configuration.

### Step 3: Configure Claude Desktop

#### For macOS:

```bash
# Open configuration directory
open ~/Library/Application\ Support/Claude/

# Or create the file directly
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### For Windows:

```bash
# Navigate to configuration directory
cd %APPDATA%\Claude\

# Create configuration file
type nul > claude_desktop_config.json
```

#### For Linux:

```bash
# Create configuration directory and file
mkdir -p ~/.config/Claude/
touch ~/.config/Claude/claude_desktop_config.json
```

### Step 4: Add MCP Server Configuration

Edit `claude_desktop_config.json` with your preferred editor:

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": ["/YOUR_NPM_PATH/node_modules/generate-pr-mcp/build/index.js"]
    }
  }
}
```

**Replace `/YOUR_NPM_PATH/` with the path from Step 2.**

#### Example Configurations:

**macOS with nvm:**

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": [
        "/Users/john/.nvm/versions/node/v22.14.0/lib/node_modules/generate-pr-mcp/build/index.js"
      ]
    }
  }
}
```

**Windows:**

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": [
        "C:\\Users\\John\\AppData\\Roaming\\npm\\node_modules\\generate-pr-mcp\\build\\index.js"
      ]
    }
  }
}
```

**Linux:**

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": [
        "/home/john/.npm-global/lib/node_modules/generate-pr-mcp/build/index.js"
      ]
    }
  }
}
```

### Step 5: Restart Claude Desktop

1. **Quit Claude Desktop completely** (don't just minimize)
2. **Relaunch Claude Desktop**
3. **Verify connection** - you should see MCP server status in Claude

## 🧪 Testing Your Setup

### Test 1: Check MCP Connection

In Claude Desktop, ask:

```
Are there any MCP servers connected?
```

You should see `generate-pr-mcp` listed as connected.

### Test 2: Generate a Test PR

1. Navigate to a git repository with changes
2. Stage some changes: `git add .`
3. In Claude Desktop, ask:

```
Generate a PR for my current changes with the title "Test PR Generation" and description "Testing the MCP server integration"
```

Claude should:

- ✅ Detect your git repository
- ✅ Analyze your changes
- ✅ Generate a comprehensive PR document
- ✅ Save it to your project directory

## 🔧 Advanced Configuration

### Custom Server Name

```json
{
  "mcpServers": {
    "my-pr-generator": {
      "command": "node",
      "args": ["/path/to/node_modules/generate-pr-mcp/build/index.js"]
    }
  }
}
```

### Multiple MCP Servers

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": ["/path/to/node_modules/generate-pr-mcp/build/index.js"]
    },
    "other-mcp-server": {
      "command": "node",
      "args": ["/path/to/other-mcp-server/index.js"]
    }
  }
}
```

### Environment Variables (Optional)

```json
{
  "mcpServers": {
    "generate-pr-mcp": {
      "command": "node",
      "args": ["/path/to/node_modules/generate-pr-mcp/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "DEBUG": "false"
      }
    }
  }
}
```

## 🔍 Troubleshooting

### Issue: MCP Server Not Found

**Error:** "MCP server not found" or "Connection failed"

**Solutions:**

1. ✅ Check the file path is correct
2. ✅ Ensure `build/index.js` exists at that location
3. ✅ Verify file permissions: `ls -la /path/to/build/index.js`
4. ✅ Make executable if needed: `chmod +x /path/to/build/index.js`

### Issue: JSON Configuration Error

**Error:** "Invalid configuration" or Claude won't start

**Solutions:**

1. ✅ Validate JSON syntax: Use [JSONLint](https://jsonlint.com/)
2. ✅ Check for trailing commas
3. ✅ Ensure proper quotes around strings
4. ✅ Verify file encoding is UTF-8

### Issue: Node.js Not Found

**Error:** "node command not found"

**Solutions:**

1. ✅ Install Node.js from [nodejs.org](https://nodejs.org/)
2. ✅ Add Node.js to PATH
3. ✅ Restart terminal/command prompt
4. ✅ Use full node path: `/usr/local/bin/node` instead of `node`

### Issue: Permission Denied

**Error:** "Permission denied" or "Access denied"

**Solutions:**

```bash
# Fix file permissions
chmod +x /path/to/build/index.js

# Fix directory permissions (if needed)
chmod 755 /path/to/node_modules/generate-pr-mcp/
```

### Issue: Git Repository Not Found

**Error:** "Not a git repository" when testing

**Solutions:**

1. ✅ Navigate to a valid git repository
2. ✅ Initialize git: `git init`
3. ✅ Make some changes and stage them: `git add .`
4. ✅ Ensure git is in PATH

## 📊 Expected Behavior

### ✅ Working Setup Indicators:

- Claude Desktop starts without errors
- MCP server shows as "Connected" in Claude
- Can ask Claude about MCP servers and see generate-pr-mcp listed
- PR generation commands work and create markdown files

### ❌ Problem Indicators:

- Claude Desktop fails to start after configuration
- MCP server shows as "Disconnected" or "Error"
- Claude doesn't recognize PR generation commands
- Error messages about file paths or permissions

## 💡 Usage Tips

### Natural Language Commands

Instead of technical tool calls, use natural language:

```
✅ "Generate a PR for my authentication feature"
✅ "Create a pull request description for these database changes"
✅ "Analyze my current git changes and make a PR"
❌ Direct tool calls (unless you're a developer)
```

### Best Practices

1. **Stage your changes** before generating PRs: `git add .`
2. **Use descriptive titles** and descriptions in your requests
3. **Review generated PRs** before using them
4. **Keep Claude Desktop updated** for best compatibility

## 🆘 Getting Help

If you still have issues:

1. **Check logs**: Look for Claude Desktop error logs
2. **Test MCP inspector**: Use `npx @modelcontextprotocol/inspector build/index.js`
3. **Verify installation**: `npm list -g generate-pr-mcp`
4. **Create an issue**: [GitHub Issues](https://github.com/kpndevroot/generate-pr-mcp/issues)

## 🎉 Success!

Once configured, you can:

- 🚀 Generate PRs instantly using natural language
- 🧠 Get AI-powered analysis of your code changes
- 📝 Create professional PR documentation
- 🔒 Keep everything private (no external API calls)

**Happy PR generating! 🎯**
