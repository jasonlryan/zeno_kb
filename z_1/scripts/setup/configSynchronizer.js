/**
 * Configuration Synchronizer
 *
 * PURPOSE:
 * This tool ensures all configuration files remain synchronized and consistent with each other.
 * It handles updates that need to cascade across multiple config files and maintains referential
 * integrity between app-config.json, content.json, taxonomy.json, and data.json.
 *
 * HOW IT WORKS:
 * 1. Monitors configuration files for changes and dependencies
 * 2. Validates cross-references between different config files
 * 3. Automatically updates dependent configurations when source data changes
 * 4. Ensures version synchronization across all config files
 * 5. Maintains consistency in shared values (like search placeholders, limits, etc.)
 * 6. Updates taxonomy when new tool types/categories are added to data
 * 7. Synchronizes content labels with actual data structures
 *
 * WHAT IT SYNCHRONIZES:
 * - Version numbers across all config files
 * - Tool counts and metadata in data.json
 * - Taxonomy categories with actual tool data
 * - Feature flags with content availability
 * - Navigation structure with user permissions
 * - Search configuration with actual data fields
 * - UI limits with actual data volumes
 * - Content placeholders with app settings
 *
 * INPUT: Configuration directory and synchronization rules
 * OUTPUT: Updated, synchronized configuration files
 *
 * USAGE: node configSynchronizer.js [config-dir] [--auto-fix] [--dry-run] [--watch]
 */

const fs = require("fs");
const path = require("path");

class ConfigSynchronizer {
  constructor() {
    this.configs = {};
    this.syncRules = [];
    this.changes = [];
    this.dependencies = new Map();
    this.setupSyncRules();
  }

  /**
   * Define synchronization rules between config files
   */
  setupSyncRules() {
    this.syncRules = [
      // Version synchronization
      {
        id: "version-sync",
        description: "Synchronize version numbers across all configs",
        source: "app.app.version",
        targets: ["data.metadata.version", "taxonomy.version"],
        validator: (source, target) => source === target,
        updater: (sourceValue) => sourceValue,
      },

      // Metadata synchronization
      {
        id: "tool-count-sync",
        description: "Update tool count metadata",
        source: "data.tools.length",
        targets: ["data.metadata.totalTools"],
        validator: (source, target) => source === target,
        updater: (sourceValue) => sourceValue,
      },

      {
        id: "category-count-sync",
        description: "Update category count metadata",
        source: "data.categories.length",
        targets: ["data.metadata.totalCategories"],
        validator: (source, target) => source === target,
        updater: (sourceValue) => sourceValue,
      },

      {
        id: "user-count-sync",
        description: "Update user count metadata",
        source: "data.users.length",
        targets: ["data.metadata.totalUsers"],
        validator: (source, target) => source === target,
        updater: (sourceValue) => sourceValue,
      },

      // Search configuration synchronization
      {
        id: "search-placeholder-sync",
        description: "Synchronize search placeholder text",
        source: "app.search.placeholder",
        targets: ["content.pages.search.placeholder"],
        validator: (source, target) => source === target,
        updater: (sourceValue) => sourceValue,
      },

      // Feature flag and content synchronization
      {
        id: "ai-chat-content-sync",
        description: "Ensure AI chat content exists when feature is enabled",
        source: "app.features.aiChat.enabled",
        targets: ["content.components.chat"],
        validator: (enabled, chatContent) =>
          !enabled || (chatContent && Object.keys(chatContent).length > 0),
        updater: (enabled) =>
          enabled ? this.getDefaultChatContent() : undefined,
      },

      // Taxonomy and data alignment
      {
        id: "tool-types-sync",
        description: "Ensure taxonomy includes all tool types used in data",
        source: "data.tools",
        targets: ["taxonomy.structure.types"],
        validator: (tools, types) => {
          const usedTypes = new Set(tools.map((t) => t.type));
          const definedTypes = new Set(types.map((t) => t.id));
          return [...usedTypes].every((type) => definedTypes.has(type));
        },
        updater: (tools, currentTypes) =>
          this.updateToolTypes(tools, currentTypes),
      },

      {
        id: "tool-tiers-sync",
        description: "Ensure taxonomy includes all tiers used in data",
        source: "data.tools",
        targets: ["taxonomy.structure.tiers"],
        validator: (tools, tiers) => {
          const usedTiers = new Set(tools.map((t) => t.tier));
          const definedTiers = new Set(tiers.map((t) => t.id));
          return [...usedTiers].every((tier) => definedTiers.has(tier));
        },
        updater: (tools, currentTiers) =>
          this.updateToolTiers(tools, currentTiers),
      },

      {
        id: "function-categories-sync",
        description: "Ensure taxonomy includes all functions used in data",
        source: "data.tools",
        targets: ["taxonomy.functionCategories.groups"],
        validator: (tools, groups) => {
          const usedFunctions = new Set(tools.map((t) => t.function));
          const definedFunctions = new Set();
          Object.values(groups).forEach((group) => {
            group.functions?.forEach((func) => definedFunctions.add(func));
          });
          return [...usedFunctions].every((func) => definedFunctions.has(func));
        },
        updater: (tools, currentGroups) =>
          this.updateFunctionCategories(tools, currentGroups),
      },

      // UI limits validation
      {
        id: "featured-tools-limit-sync",
        description:
          "Ensure featured tools limit accommodates actual featured tools",
        source: "data.tools",
        targets: ["app.limits.featuredTools"],
        validator: (tools, limit) => {
          const featuredCount = tools.filter((t) => t.featured).length;
          return featuredCount <= limit;
        },
        updater: (tools) => {
          const featuredCount = tools.filter((t) => t.featured).length;
          return Math.max(featuredCount, 5); // Minimum of 5
        },
      },
    ];
  }

  /**
   * Load all configuration files
   */
  async loadConfigurations(configDir) {
    const configFiles = {
      app: "app-config.json",
      content: "content.json",
      data: "data.json",
      taxonomy: "taxonomy.json",
    };

    console.log("📁 Loading configuration files for synchronization...");

    for (const [key, filename] of Object.entries(configFiles)) {
      const filepath = path.join(configDir, filename);
      try {
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, "utf8");
          this.configs[key] = JSON.parse(content);
          console.log(`  ✅ Loaded ${filename}`);
        } else {
          throw new Error(`Configuration file not found: ${filename}`);
        }
      } catch (error) {
        throw new Error(`Error loading ${filename}: ${error.message}`);
      }
    }
  }

  /**
   * Get value from config using dot notation path
   */
  getValue(configKey, path) {
    const keys = path.split(".");
    let value = this.configs[configKey];

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set value in config using dot notation path
   */
  setValue(configKey, path, value) {
    const keys = path.split(".");
    let current = this.configs[configKey];

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    this.changes.push({
      config: configKey,
      path: path,
      oldValue: oldValue,
      newValue: value,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check all synchronization rules and identify issues
   */
  validateSynchronization() {
    console.log("\n🔄 Validating configuration synchronization...");
    const issues = [];

    for (const rule of this.syncRules) {
      try {
        const sourceValue = this.getValue(...rule.source.split(".", 2));

        for (const targetPath of rule.targets) {
          const [targetConfig, ...pathParts] = targetPath.split(".");
          const targetValue = this.getValue(targetConfig, pathParts.join("."));

          if (!rule.validator(sourceValue, targetValue)) {
            issues.push({
              ruleId: rule.id,
              description: rule.description,
              source: rule.source,
              target: targetPath,
              sourceValue: sourceValue,
              targetValue: targetValue,
              needsUpdate: true,
            });
          }
        }
      } catch (error) {
        issues.push({
          ruleId: rule.id,
          description: rule.description,
          error: error.message,
          needsUpdate: false,
        });
      }
    }

    return issues;
  }

  /**
   * Apply synchronization fixes
   */
  applySynchronization(issues, autoFix = false) {
    console.log("\n🔧 Applying synchronization fixes...");
    let fixedCount = 0;

    for (const issue of issues) {
      if (!issue.needsUpdate) continue;

      const rule = this.syncRules.find((r) => r.id === issue.ruleId);
      if (!rule) continue;

      try {
        const sourceValue = this.getValue(...issue.source.split(".", 2));
        const [targetConfig, ...pathParts] = issue.target.split(".");
        const targetPath = pathParts.join(".");
        const currentTargetValue = this.getValue(targetConfig, targetPath);

        let newValue;
        if (typeof rule.updater === "function") {
          newValue = rule.updater(sourceValue, currentTargetValue);
        } else {
          newValue = sourceValue;
        }

        if (autoFix) {
          this.setValue(targetConfig, targetPath, newValue);
          console.log(`  ✅ Fixed: ${issue.description}`);
          console.log(
            `     ${issue.target}: ${JSON.stringify(
              issue.targetValue
            )} → ${JSON.stringify(newValue)}`
          );
          fixedCount++;
        } else {
          console.log(`  🔍 Would fix: ${issue.description}`);
          console.log(
            `     ${issue.target}: ${JSON.stringify(
              issue.targetValue
            )} → ${JSON.stringify(newValue)}`
          );
        }
      } catch (error) {
        console.log(`  ❌ Error fixing ${issue.ruleId}: ${error.message}`);
      }
    }

    return fixedCount;
  }

  /**
   * Update tool types in taxonomy
   */
  updateToolTypes(tools, currentTypes) {
    const usedTypes = new Set(tools.map((t) => t.type));
    const definedTypes = new Set(currentTypes.map((t) => t.id));
    const newTypes = [...usedTypes].filter((type) => !definedTypes.has(type));

    const updatedTypes = [...currentTypes];

    for (const newType of newTypes) {
      updatedTypes.push({
        id: newType,
        label: newType,
        icon: this.getDefaultIconForType(newType),
        color: this.getDefaultColorForType(newType),
      });
    }

    return updatedTypes;
  }

  /**
   * Update tool tiers in taxonomy
   */
  updateToolTiers(tools, currentTiers) {
    const usedTiers = new Set(tools.map((t) => t.tier));
    const definedTiers = new Set(currentTiers.map((t) => t.id));
    const newTiers = [...usedTiers].filter((tier) => !definedTiers.has(tier));

    const updatedTiers = [...currentTiers];

    for (const newTier of newTiers) {
      updatedTiers.push({
        id: newTier,
        label: newTier,
        color: this.getDefaultColorForTier(newTier),
        description: `${newTier} access level`,
      });
    }

    return updatedTiers;
  }

  /**
   * Update function categories in taxonomy
   */
  updateFunctionCategories(tools, currentGroups) {
    const usedFunctions = new Set(tools.map((t) => t.function));
    const definedFunctions = new Set();

    Object.values(currentGroups).forEach((group) => {
      group.functions?.forEach((func) => definedFunctions.add(func));
    });

    const newFunctions = [...usedFunctions].filter(
      (func) => !definedFunctions.has(func)
    );
    const updatedGroups = { ...currentGroups };

    // Add new functions to appropriate groups or create new group
    for (const newFunction of newFunctions) {
      const groupKey = this.determineGroupForFunction(newFunction);

      if (updatedGroups[groupKey]) {
        if (!updatedGroups[groupKey].functions) {
          updatedGroups[groupKey].functions = [];
        }
        updatedGroups[groupKey].functions.push(newFunction);
      } else {
        // Create new group for unclassified functions
        updatedGroups["other"] = {
          name: "Other",
          icon: "🔧",
          color: "#6B7280",
          functions: [newFunction],
        };
      }
    }

    return updatedGroups;
  }

  /**
   * Get default content for AI chat feature
   */
  getDefaultChatContent() {
    return {
      title: "AI Assistant",
      placeholder: "Ask about tools, get recommendations, or seek guidance...",
      actions: {
        send: "Send",
        clear: "Clear Chat",
        newChat: "New Chat",
      },
      states: {
        thinking: "AI is thinking...",
        error: "Something went wrong. Please try again.",
        empty:
          "Start a conversation by asking about tools or getting recommendations.",
      },
    };
  }

  /**
   * Helper methods for defaults
   */
  getDefaultIconForType(type) {
    const iconMap = {
      GPT: "🤖",
      Platform: "🌐",
      Tool: "🔧",
      Doc: "📄",
      Video: "🎥",
      Bot: "🤖",
      Script: "📜",
    };
    return iconMap[type] || "🔧";
  }

  getDefaultColorForType(type) {
    const colorMap = {
      GPT: "#3B82F6",
      Platform: "#10B981",
      Tool: "#F59E0B",
      Doc: "#6B7280",
      Video: "#EF4444",
      Bot: "#8B5CF6",
      Script: "#059669",
    };
    return colorMap[type] || "#6B7280";
  }

  getDefaultColorForTier(tier) {
    const colorMap = {
      Foundation: "#10B981",
      Specialist: "#F59E0B",
      Restricted: "#DC2626",
    };
    return colorMap[tier] || "#6B7280";
  }

  determineGroupForFunction(functionName) {
    const groupMap = {
      content: ["Content & Creative", "Brand & Voice", "Content Creation"],
      strategy: [
        "Strategy & Planning",
        "Audience Insights",
        "Research & Analysis",
      ],
      media: ["Media Relations", "Media List Creation"],
      operations: ["AI Platforms", "Productivity Tools", "Collaboration"],
      data: ["Data & Analytics", "Monitoring & Alerts"],
    };

    for (const [group, functions] of Object.entries(groupMap)) {
      if (
        functions.some((func) =>
          functionName.toLowerCase().includes(func.toLowerCase())
        )
      ) {
        return group;
      }
    }

    return "other";
  }

  /**
   * Save synchronized configurations
   */
  async saveConfigurations(configDir, dryRun = false) {
    console.log("\n💾 Saving synchronized configurations...");

    const configFiles = {
      app: "app-config.json",
      content: "content.json",
      data: "data.json",
      taxonomy: "taxonomy.json",
    };

    for (const [key, filename] of Object.entries(configFiles)) {
      const filepath = path.join(configDir, filename);

      if (dryRun) {
        console.log(`  🔍 Would save: ${filename}`);
      } else {
        try {
          // Update lastUpdated timestamp
          if (this.configs[key].metadata) {
            this.configs[key].metadata.lastUpdated = new Date().toISOString();
          } else if (key === "taxonomy") {
            this.configs[key].lastUpdated = new Date().toISOString();
          }

          fs.writeFileSync(
            filepath,
            JSON.stringify(this.configs[key], null, 2)
          );
          console.log(`  ✅ Saved: ${filename}`);
        } catch (error) {
          console.error(`  ❌ Error saving ${filename}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Print synchronization summary
   */
  printSummary(issues, fixedCount) {
    console.log("\n" + "=".repeat(60));
    console.log("🔄 CONFIGURATION SYNCHRONIZATION SUMMARY");
    console.log("=".repeat(60));

    console.log(`\n📊 Analysis Results:`);
    console.log(`  • Total sync rules checked: ${this.syncRules.length}`);
    console.log(`  • Issues found: ${issues.length}`);
    console.log(`  • Issues fixed: ${fixedCount}`);
    console.log(`  • Configuration changes made: ${this.changes.length}`);

    if (issues.length > 0) {
      console.log(`\n🔍 Synchronization Issues:`);
      issues.forEach((issue, index) => {
        console.log(`\n  ${index + 1}. ${issue.description}`);
        console.log(
          `     Source: ${issue.source} = ${JSON.stringify(issue.sourceValue)}`
        );
        console.log(
          `     Target: ${issue.target} = ${JSON.stringify(issue.targetValue)}`
        );
        if (issue.error) {
          console.log(`     Error: ${issue.error}`);
        }
      });
    }

    if (this.changes.length > 0) {
      console.log(`\n📝 Changes Made:`);
      this.changes.forEach((change, index) => {
        console.log(`\n  ${index + 1}. ${change.config}:${change.path}`);
        console.log(
          `     ${JSON.stringify(change.oldValue)} → ${JSON.stringify(
            change.newValue
          )}`
        );
      });
    }

    console.log("\n" + "=".repeat(60));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const configDir = args[0] || "public/config";
  const autoFix = args.includes("--auto-fix");
  const dryRun = args.includes("--dry-run");
  const watch = args.includes("--watch");

  console.log("🔄 Configuration Synchronizer");
  console.log("==============================");
  console.log(`Configuration directory: ${configDir}`);
  console.log(`Auto-fix mode: ${autoFix ? "ON" : "OFF"}`);
  console.log(`Dry run mode: ${dryRun ? "ON" : "OFF"}`);

  const synchronizer = new ConfigSynchronizer();

  try {
    await synchronizer.loadConfigurations(configDir);
    const issues = synchronizer.validateSynchronization();
    const fixedCount = synchronizer.applySynchronization(issues, autoFix);

    if (autoFix && fixedCount > 0) {
      await synchronizer.saveConfigurations(configDir, dryRun);
    }

    synchronizer.printSummary(issues, fixedCount);

    // Exit codes
    if (issues.length > 0 && !autoFix) {
      console.log(
        "\n⚠️ Synchronization issues found - run with --auto-fix to resolve"
      );
      process.exit(1);
    } else if (fixedCount > 0) {
      console.log("\n✅ Configuration synchronization complete");
      process.exit(0);
    } else {
      console.log("\n✅ All configurations are synchronized");
      process.exit(0);
    }
  } catch (error) {
    console.error(`❌ Synchronization failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConfigSynchronizer;
