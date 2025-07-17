# Git Services Integration Example

## How It Works

The `generate-pr-request` prompt now automatically fetches Git data using the `gitService` functions instead of requiring manual input.

## What Gets Auto-Fetched

1. **Current Branch**: Uses `getCurrentBranch()` to get the actual current branch
2. **Git Diff**: Fetches the diff between base branch and HEAD
3. **Commit Messages**: Gets commit messages between base branch and HEAD
4. **Git Status**: Shows current working directory status
5. **Changed Files**: Lists files that have been modified

## Usage Examples

### Basic Usage (All Auto-Fetched)

```javascript
// MCP client call
{
  "method": "prompts/get",
  "params": {
    "name": "generate-pr-request"
  }
}
```

### With Custom Base Branch

```javascript
{
  "method": "prompts/get",
  "params": {
    "name": "generate-pr-request",
    "arguments": {
      "baseBranch": "develop"
    }
  }
}
```

### With Override Values

```javascript
{
  "method": "prompts/get",
  "params": {
    "name": "generate-pr-request",
    "arguments": {
      "baseBranch": "main",
      "templateType": "feature",
      "includeDiff": "true",
      "customSections": "{\"testing\": \"Unit tests added\", \"breaking\": \"None\"}"
    }
  }
}
```

## Git Service Functions Used

- `isContainGit()`: Validates that the project is a Git repository
- `getCurrentBranch()`: Gets the current branch name
- `getGitData(baseBranch)`: Fetches comprehensive Git data including:
  - Diff content
  - Commit messages
  - Git status
  - Changed files
- `formatGitDataForPrompt()`: Formats the raw Git data for better readability

## Error Handling

The system handles various error cases:

- Project not being a Git repository
- Git command failures
- Missing branches
- Empty diff/commit data

## Benefits

1. **Automatic Data Fetching**: No need to manually provide Git data
2. **Flexible Base Branch**: Can work with any base branch
3. **Override Capability**: Can still provide custom data if needed
4. **Error Resilience**: Graceful handling of Git operation failures
5. **Real-time Data**: Always uses current Git state
