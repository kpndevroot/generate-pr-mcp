import fs from "fs";
import path from "path";

/**
 * Get available template types from the templates directory
 */
export const getAvailableTemplateTypes = () => {
  try {
    // Read the templateConfig.json file
    const configPath = path.join(
      process.cwd(),
      "src",
      "templates",
      "templateConfig.json"
    );
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    // Get available template types from the config
    const availableTemplates = Object.keys(config.templates || {}).filter(
      (template) => config.templates[template].enabled
    );

    // Always include the default template
    if (!availableTemplates.includes("default")) {
      availableTemplates.unshift("default");
    }

    return availableTemplates;
  } catch (error) {
    console.error("Error reading template config:", error);
    return ["default"]; // Fallback to default template
  }
};

/**
 * Get template content based on template type
 */
export const getTemplateContent = (templateType: string = "default") => {
  try {
    // First check if the requested template exists
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      `${templateType}Template.md`
    );

    // If the specific template doesn't exist, fall back to default
    if (!fs.existsSync(templatePath)) {
      const defaultTemplatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "defaultPRTemplate.md"
      );
      return fs.readFileSync(defaultTemplatePath, "utf-8");
    }

    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    console.error(`Error reading template ${templateType}:`, error);
    return "# PR Title\n\n## Description\n\n## Changes\n\n## Testing\n";
  }
};
