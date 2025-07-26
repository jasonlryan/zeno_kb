/**
 * Configuration Migration Planner
 *
 * PURPOSE:
 * This tool analyzes all configuration files (app-config.json, content.json, taxonomy.json, data.json)
 * and identifies what needs to be updated, migrated, or aligned when moving from dummy data to real data.
 * It goes beyond just data migration to ensure the entire configuration ecosystem is coherent.
 *
 * HOW IT WORKS:
 * 1. Loads and analyzes all configuration files
 * 2. Cross-references data consistency between configs
 * 3. Identifies mismatches, outdated settings, and missing configurations
 * 4. Suggests updates needed for each config file
 * 5. Validates feature flags and limits against real data requirements
 * 6. Checks taxonomy alignment with actual data categories
 * 7. Generates comprehensive migration plan for all configurations
 *
 * WHAT IT CHECKS:
 * - App metadata and versioning alignment
 * - Navigation structure relevance to actual data
 * - Feature flag appropriateness for real environment
 * - UI limits and pagination settings vs actual data volume
 * - Content text accuracy for real vs dummy scenarios
 * - Taxonomy categories matching actual tool types
 * - Function categories alignment with real tools
 * - Tag categories reflecting actual tool characteristics
 * - Search configuration optimization for real data
 *
 * INPUT: Configuration directory path
 * OUTPUT: Comprehensive migration plan with specific recommendations
 *
 * USAGE: node configMigrationPlanner.js [config-directory] [--analyze-only] [--output=file]
 */

const fs = require("fs");
const path = require("path");

class ConfigMigrationPlanner {
  constructor() {
    this.configs = {};
    this.issues = [];
    this.recommendations = [];
    this.migrationPlan = {};
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

    console.log("📁 Loading configuration files...");

    for (const [key, filename] of Object.entries(configFiles)) {
      const filepath = path.join(configDir, filename);
      try {
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, "utf8");
          this.configs[key] = JSON.parse(content);
          console.log(`  ✅ Loaded ${filename}`);
        } else {
          this.issues.push(`❌ Missing configuration file: ${filename}`);
        }
      } catch (error) {
        this.issues.push(`❌ Error loading ${filename}: ${error.message}`);
      }
    }
  }

  /**
   * Analyze app configuration for migration needs
   */
  analyzeAppConfig() {
    console.log("\n🔧 Analyzing app-config.json...");
    const app = this.configs.app;

    if (!app) {
      this.issues.push("❌ App configuration not loaded");
      return;
    }

    // Check version and metadata
    if (app.app?.version === "1.0.0") {
      this.recommendations.push({
        file: "app-config.json",
        section: "app.version",
        issue: "Version still at initial 1.0.0",
        recommendation:
          "Update version to reflect current state (e.g., 1.1.0 post-migration)",
        priority: "medium",
      });
    }

    // Check feature flags alignment
    const features = app.features || {};

    // AI Chat feature analysis
    if (features.aiChat?.enabled && features.aiChat?.provider === "gemini") {
      this.recommendations.push({
        file: "app-config.json",
        section: "features.aiChat",
        issue: "AI chat configured for Gemini but may need real API keys",
        recommendation:
          "Verify Gemini API configuration and credentials for production",
        priority: "high",
      });
    }

    // Access control analysis
    if (
      features.accessControl?.enabled &&
      features.accessControl?.defaultTier === "Foundation"
    ) {
      this.recommendations.push({
        file: "app-config.json",
        section: "features.accessControl",
        issue:
          "Default tier set to Foundation - may need adjustment based on real user base",
        recommendation:
          "Review default tier assignment based on actual user roles and permissions",
        priority: "medium",
      });
    }

    // Check limits against actual data
    const limits = app.limits || {};
    const actualToolCount = this.configs.data?.tools?.length || 0;

    if (limits.featuredTools && actualToolCount > 0) {
      const featuredCount =
        this.configs.data?.tools?.filter((tool) => tool.featured)?.length || 0;
      if (featuredCount > limits.featuredTools) {
        this.recommendations.push({
          file: "app-config.json",
          section: "limits.featuredTools",
          issue: `Featured tools limit (${limits.featuredTools}) is less than actual featured tools (${featuredCount})`,
          recommendation: `Increase featuredTools limit to at least ${featuredCount} or review featured tool selection`,
          priority: "high",
        });
      }
    }

    // Navigation structure analysis
    const navigation = app.navigation?.sidebar?.sections || [];
    const hasRestrictedTools =
      this.configs.data?.tools?.some((tool) => tool.tier === "Restricted") ||
      false;

    if (hasRestrictedTools) {
      const hasCuratorDashboard = navigation.some((section) =>
        section.items?.some((item) => item.id === "curator")
      );

      if (!hasCuratorDashboard) {
        this.recommendations.push({
          file: "app-config.json",
          section: "navigation.sidebar",
          issue:
            "Restricted tools exist but no curator dashboard in navigation",
          recommendation:
            "Ensure curator dashboard is accessible for managing restricted tools",
          priority: "high",
        });
      }
    }
  }

  /**
   * Analyze content configuration
   */
  analyzeContentConfig() {
    console.log("\n📝 Analyzing content.json...");
    const content = this.configs.content;

    if (!content) {
      this.issues.push("❌ Content configuration not loaded");
      return;
    }

    // Check for dummy/placeholder text
    const dummyPatterns = [
      /dummy/i,
      /placeholder/i,
      /lorem ipsum/i,
      /test/i,
      /example\.com/i,
      /mock/i,
    ];

    const checkForDummyText = (obj, path = "") => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === "string") {
          for (const pattern of dummyPatterns) {
            if (pattern.test(value)) {
              this.recommendations.push({
                file: "content.json",
                section: currentPath,
                issue: `Potential dummy text found: "${value}"`,
                recommendation: "Replace with production-appropriate content",
                priority: "medium",
              });
            }
          }
        } else if (typeof value === "object" && value !== null) {
          checkForDummyText(value, currentPath);
        }
      }
    };

    checkForDummyText(content);

    // Check search placeholder alignment
    const searchPlaceholder = content.pages?.search?.placeholder;
    const appSearchPlaceholder = this.configs.app?.search?.placeholder;

    if (searchPlaceholder !== appSearchPlaceholder) {
      this.recommendations.push({
        file: "content.json",
        section: "pages.search.placeholder",
        issue:
          "Search placeholder text differs between content.json and app-config.json",
        recommendation:
          "Ensure consistent search placeholder text across configurations",
        priority: "low",
      });
    }

    // Check for AI-specific content alignment
    const aiChatEnabled = this.configs.app?.features?.aiChat?.enabled;
    const hasChatContent = content.components?.chat;

    if (aiChatEnabled && !hasChatContent) {
      this.recommendations.push({
        file: "content.json",
        section: "components.chat",
        issue: "AI chat is enabled but no chat component content found",
        recommendation: "Add chat component content for AI assistant feature",
        priority: "high",
      });
    }
  }

  /**
   * Analyze taxonomy configuration alignment
   */
  analyzeTaxonomyConfig() {
    console.log("\n🏷️ Analyzing taxonomy.json...");
    const taxonomy = this.configs.taxonomy;
    const data = this.configs.data;

    if (!taxonomy) {
      this.issues.push("❌ Taxonomy configuration not loaded");
      return;
    }

    // Check tool types alignment
    const definedTypes = new Set(
      taxonomy.structure?.types?.map((t) => t.id) || []
    );
    const actualTypes = new Set(data?.tools?.map((t) => t.type) || []);

    // Find types used in data but not defined in taxonomy
    const undefinedTypes = [...actualTypes].filter(
      (type) => !definedTypes.has(type)
    );
    if (undefinedTypes.length > 0) {
      this.recommendations.push({
        file: "taxonomy.json",
        section: "structure.types",
        issue: `Tool types used in data but not defined in taxonomy: ${undefinedTypes.join(
          ", "
        )}`,
        recommendation:
          "Add missing tool type definitions to taxonomy structure",
        priority: "high",
      });
    }

    // Find defined types not used in data
    const unusedTypes = [...definedTypes].filter(
      (type) => !actualTypes.has(type)
    );
    if (unusedTypes.length > 0) {
      this.recommendations.push({
        file: "taxonomy.json",
        section: "structure.types",
        issue: `Taxonomy defines types not used in data: ${unusedTypes.join(
          ", "
        )}`,
        recommendation:
          "Consider removing unused type definitions or add tools of these types",
        priority: "low",
      });
    }

    // Check tier alignment
    const definedTiers = new Set(
      taxonomy.structure?.tiers?.map((t) => t.id) || []
    );
    const actualTiers = new Set(data?.tools?.map((t) => t.tier) || []);

    const undefinedTiers = [...actualTiers].filter(
      (tier) => !definedTiers.has(tier)
    );
    if (undefinedTiers.length > 0) {
      this.recommendations.push({
        file: "taxonomy.json",
        section: "structure.tiers",
        issue: `Tool tiers used in data but not defined in taxonomy: ${undefinedTiers.join(
          ", "
        )}`,
        recommendation: "Add missing tier definitions to taxonomy structure",
        priority: "high",
      });
    }

    // Check function categories alignment
    const definedFunctions = new Set();
    Object.values(taxonomy.functionCategories?.groups || {}).forEach(
      (group) => {
        group.functions?.forEach((func) => definedFunctions.add(func));
      }
    );

    const actualFunctions = new Set(data?.tools?.map((t) => t.function) || []);

    const undefinedFunctions = [...actualFunctions].filter(
      (func) => !definedFunctions.has(func)
    );
    if (undefinedFunctions.length > 0) {
      this.recommendations.push({
        file: "taxonomy.json",
        section: "functionCategories.groups",
        issue: `Tool functions used in data but not categorized: ${undefinedFunctions.join(
          ", "
        )}`,
        recommendation:
          "Add missing functions to appropriate function category groups",
        priority: "high",
      });
    }

    // Check version alignment
    const taxonomyVersion = taxonomy.version;
    const dataVersion = data?.metadata?.version;

    if (taxonomyVersion !== dataVersion) {
      this.recommendations.push({
        file: "taxonomy.json",
        section: "version",
        issue: `Taxonomy version (${taxonomyVersion}) differs from data version (${dataVersion})`,
        recommendation:
          "Synchronize version numbers across configuration files",
        priority: "medium",
      });
    }
  }

  /**
   * Analyze data configuration for migration readiness
   */
  analyzeDataConfig() {
    console.log("\n📊 Analyzing data.json...");
    const data = this.configs.data;

    if (!data) {
      this.issues.push("❌ Data configuration not loaded");
      return;
    }

    // Check for dummy URLs
    const tools = data.tools || [];
    const dummyUrlPatterns = [
      /example\.com/i,
      /placeholder/i,
      /mock/i,
      /dummy/i,
      /localhost/i,
    ];

    let dummyUrlCount = 0;
    tools.forEach((tool, index) => {
      if (tool.link) {
        for (const pattern of dummyUrlPatterns) {
          if (pattern.test(tool.link)) {
            dummyUrlCount++;
            break;
          }
        }
      }
    });

    if (dummyUrlCount > 0) {
      this.recommendations.push({
        file: "data.json",
        section: "tools[].link",
        issue: `${dummyUrlCount} tools still have dummy/placeholder URLs`,
        recommendation:
          "Replace dummy URLs with real tool links before production deployment",
        priority: "high",
      });
    }

    // Check user data
    const users = data.users || [];
    const hasRealUsers = users.some(
      (user) =>
        !user.email?.includes("example.com") &&
        !user.email?.includes("placeholder")
    );

    if (!hasRealUsers) {
      this.recommendations.push({
        file: "data.json",
        section: "users",
        issue: "All users appear to be placeholder/dummy accounts",
        recommendation:
          "Replace with real user accounts and proper email addresses",
        priority: "high",
      });
    }

    // Check announcements relevance
    const announcements = data.announcements || [];
    const hasCurrentAnnouncements = announcements.some((ann) => {
      const endDate = new Date(ann.endDate);
      return endDate > new Date();
    });

    if (!hasCurrentAnnouncements && announcements.length > 0) {
      this.recommendations.push({
        file: "data.json",
        section: "announcements",
        issue: "All announcements appear to be expired or outdated",
        recommendation:
          "Update announcements with current, relevant information",
        priority: "medium",
      });
    }

    // Check metadata
    const metadata = data.metadata || {};
    if (metadata.totalTools !== tools.length) {
      this.recommendations.push({
        file: "data.json",
        section: "metadata.totalTools",
        issue: `Metadata totalTools (${metadata.totalTools}) doesn't match actual tools count (${tools.length})`,
        recommendation: "Update metadata to reflect actual data counts",
        priority: "medium",
      });
    }
  }

  /**
   * Generate comprehensive migration plan
   */
  generateMigrationPlan() {
    console.log("\n📋 Generating migration plan...");

    this.migrationPlan = {
      summary: {
        totalIssues: this.issues.length,
        totalRecommendations: this.recommendations.length,
        highPriorityItems: this.recommendations.filter(
          (r) => r.priority === "high"
        ).length,
        mediumPriorityItems: this.recommendations.filter(
          (r) => r.priority === "medium"
        ).length,
        lowPriorityItems: this.recommendations.filter(
          (r) => r.priority === "low"
        ).length,
      },
      issues: this.issues,
      recommendations: this.recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      migrationSteps: this.generateMigrationSteps(),
      configUpdates: this.generateConfigUpdates(),
    };
  }

  /**
   * Generate step-by-step migration instructions
   */
  generateMigrationSteps() {
    const steps = [];

    // Pre-migration steps
    steps.push({
      phase: "Pre-Migration",
      step: 1,
      title: "Backup Current Configurations",
      description: "Create backups of all configuration files",
      commands: [
        "mkdir -p backups/config-$(date +%Y%m%d)",
        "cp config/*.json backups/config-$(date +%Y%m%d)/",
        "cp public/config/*.json backups/config-$(date +%Y%m%d)/public-",
      ],
    });

    // High priority fixes
    const highPriorityItems = this.recommendations.filter(
      (r) => r.priority === "high"
    );
    if (highPriorityItems.length > 0) {
      steps.push({
        phase: "Critical Updates",
        step: 2,
        title: "Address High Priority Configuration Issues",
        description:
          "Fix critical configuration mismatches and missing elements",
        items: highPriorityItems.map((item) => ({
          file: item.file,
          section: item.section,
          action: item.recommendation,
        })),
      });
    }

    // Data migration integration
    steps.push({
      phase: "Data Integration",
      step: 3,
      title: "Integrate Real Data with Configuration Updates",
      description: "Run data migration while updating related configurations",
      commands: [
        "node migrationPipeline.js ../data/zeno_kb_assets.csv --with-config-updates",
      ],
    });

    // Post-migration validation
    steps.push({
      phase: "Validation",
      step: 4,
      title: "Validate Configuration Consistency",
      description: "Ensure all configurations are aligned and functional",
      commands: [
        "node configMigrationPlanner.js public/config --validate-only",
      ],
    });

    return steps;
  }

  /**
   * Generate specific configuration update recommendations
   */
  generateConfigUpdates() {
    const updates = {
      "app-config.json": [],
      "content.json": [],
      "taxonomy.json": [],
      "data.json": [],
    };

    this.recommendations.forEach((rec) => {
      if (updates[rec.file]) {
        updates[rec.file].push({
          section: rec.section,
          issue: rec.issue,
          recommendation: rec.recommendation,
          priority: rec.priority,
        });
      }
    });

    return updates;
  }

  /**
   * Save migration plan to file
   */
  async saveMigrationPlan(outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = outputPath || `config-migration-plan-${timestamp}.json`;

    try {
      fs.writeFileSync(filename, JSON.stringify(this.migrationPlan, null, 2));
      console.log(`\n💾 Migration plan saved to: ${filename}`);
    } catch (error) {
      console.error(`❌ Error saving migration plan: ${error.message}`);
    }
  }

  /**
   * Print summary report
   */
  printSummary() {
    const summary = this.migrationPlan.summary;

    console.log("\n" + "=".repeat(60));
    console.log("📊 CONFIGURATION MIGRATION ANALYSIS SUMMARY");
    console.log("=".repeat(60));

    console.log(`\n📈 Overview:`);
    console.log(`  • Total Issues Found: ${summary.totalIssues}`);
    console.log(`  • Total Recommendations: ${summary.totalRecommendations}`);
    console.log(`  • High Priority Items: ${summary.highPriorityItems}`);
    console.log(`  • Medium Priority Items: ${summary.mediumPriorityItems}`);
    console.log(`  • Low Priority Items: ${summary.lowPriorityItems}`);

    if (this.issues.length > 0) {
      console.log(`\n❌ Critical Issues:`);
      this.issues.forEach((issue) => console.log(`  ${issue}`));
    }

    console.log(`\n🔥 High Priority Recommendations:`);
    const highPriority = this.recommendations.filter(
      (r) => r.priority === "high"
    );
    if (highPriority.length === 0) {
      console.log("  ✅ No high priority issues found!");
    } else {
      highPriority.forEach((rec) => {
        console.log(`  📄 ${rec.file} (${rec.section})`);
        console.log(`     Issue: ${rec.issue}`);
        console.log(`     Fix: ${rec.recommendation}\n`);
      });
    }

    console.log(`\n⚠️ Medium Priority Items: ${summary.mediumPriorityItems}`);
    console.log(`ℹ️ Low Priority Items: ${summary.lowPriorityItems}`);

    console.log("\n" + "=".repeat(60));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const configDir = args[0] || "public/config";
  const analyzeOnly = args.includes("--analyze-only");
  const outputFile = args
    .find((arg) => arg.startsWith("--output="))
    ?.split("=")[1];

  console.log("🔍 Configuration Migration Planner");
  console.log("=====================================");
  console.log(`Analyzing configuration directory: ${configDir}`);

  const planner = new ConfigMigrationPlanner();

  try {
    await planner.loadConfigurations(configDir);
    planner.analyzeAppConfig();
    planner.analyzeContentConfig();
    planner.analyzeTaxonomyConfig();
    planner.analyzeDataConfig();
    planner.generateMigrationPlan();

    planner.printSummary();

    if (!analyzeOnly) {
      await planner.saveMigrationPlan(outputFile);
    }

    // Exit with appropriate code
    const hasHighPriorityIssues = planner.recommendations.some(
      (r) => r.priority === "high"
    );
    const hasCriticalIssues = planner.issues.length > 0;

    if (hasCriticalIssues) {
      console.log(
        "\n🚨 Critical issues found - review before proceeding with migration"
      );
      process.exit(2);
    } else if (hasHighPriorityIssues) {
      console.log(
        "\n⚠️ High priority items found - address before production deployment"
      );
      process.exit(1);
    } else {
      console.log("\n✅ Configuration analysis complete - ready for migration");
      process.exit(0);
    }
  } catch (error) {
    console.error(`❌ Analysis failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConfigMigrationPlanner;
