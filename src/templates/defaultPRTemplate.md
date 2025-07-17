# {{title}}

## 📋 Summary

{{description}}

## 🔗 Related Issues

{{#if linkedIssues}}
{{#each linkedIssues}}

- {{type}} {{url}}
  {{/each}}
  {{else}}
- [ ] No related issues
      {{/if}}

## 🚀 Changes Made

{{#if changes}}
{{#each changes}}

- {{description}}
  {{/each}}
  {{else}}

### Modified Files

{{#each modifiedFiles}}

- `{{file}}` - {{description}}
  {{/each}}
  {{/if}}

## 🏗️ Business Logic Changes

{{#if businessLogic}}
{{businessLogic}}
{{else}}

- [ ] No business logic changes
- [ ] Minor refactoring/cleanup
- [ ] UI/UX improvements only
      {{/if}}

## 🏛️ Architecture Review Document (ARD) Changes

{{#if ardChanges}}
{{ardChanges}}
{{else}}

- [ ] No architectural changes
- [ ] Database schema changes: None
- [ ] API changes: None
- [ ] External dependencies: None
      {{/if}}

## 🧪 Testing Instructions

{{#if testingInstructions}}
{{testingInstructions}}
{{else}}

### Manual Testing

1. Pull this branch
2. Run `npm install` (if dependencies changed)
3. Start the application
4. Navigate to affected areas
5. Verify functionality works as expected

### Automated Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
      {{/if}}

## 📊 Impact Assessment

### Performance Impact

- [ ] No performance impact
- [ ] Improved performance
- [ ] Potential performance impact (explain below)

### Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes (document migration path below)

### Security Considerations

- [ ] No security implications
- [ ] Security improvements
- [ ] Potential security impact (explain below)

## 🔍 Code Quality

### Code Review Focus Areas

- [ ] Logic correctness
- [ ] Error handling
- [ ] Performance implications
- [ ] Security considerations
- [ ] Code maintainability

### Static Analysis

- [ ] Linting passes
- [ ] Type checking passes
- [ ] Security scan passes

## ✅ Pre-merge Checklist

### Development

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)

### Testing

- [ ] New tests added for new functionality
- [ ] All existing tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

### Deployment

- [ ] Migration scripts created (if needed)
- [ ] Environment variables updated (if needed)
- [ ] Feature flags configured (if applicable)
- [ ] Rollback plan documented (if needed)

### Communication

- [ ] Stakeholders notified (if applicable)
- [ ] Documentation updated
- [ ] Changelog updated

## 📝 Additional Notes

{{#if additionalNotes}}
{{additionalNotes}}
{{else}}
_No additional notes_
{{/if}}

## 🔄 Deployment Plan

{{#if deploymentPlan}}
{{deploymentPlan}}
{{else}}

- [ ] Standard deployment process
- [ ] No special deployment requirements
- [ ] Can be deployed during business hours
      {{/if}}

---

**Reviewer Guidelines:**

- Focus on code quality, security, and maintainability
- Verify all checklist items are completed
- Test the changes in your local environment
- Check for potential edge cases or error scenarios
- Ensure documentation is up to date

**Merge Criteria:**

- [ ] All CI/CD checks pass
- [ ] At least one approval from code owner
- [ ] All conversations resolved
- [ ] Pre-merge checklist completed
