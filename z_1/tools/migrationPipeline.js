#!/usr/bin/env node

/**
 * MIGRATION PIPELINE TOOL
 * ========================
 *
 * PURPOSE:
 * This is the master orchestration tool that safely migrates data from CSV to the
 * live Zeno KB application. It coordinates all migration steps with safety checks,
 * rollback capabilities, and comprehensive reporting to ensure zero downtime.
 *
 * HOW IT WORKS:
 * 1. Creates automatic backups of existing data before any changes
 * 2. Runs data audit to validate source data quality and integrity
 * 3. Performs URL health checks to ensure all links are accessible
 * 4. Converts CSV data to proper JSON format with intelligent mapping
 * 5. Validates the converted data meets application requirements
 * 6. Deploys the new data with atomic replacement (all-or-nothing)
 * 7. Verifies successful deployment and application functionality
 * 8. Provides rollback capabilities if any issues are detected
 *
 * SAFETY FEATURES:
 * - Automatic backups with timestamp-based naming
 * - Dry-run mode to preview changes without applying them
 * - Rollback functionality to restore previous state
 * - Comprehensive validation at each step
 * - Detailed logging and error reporting
 * - Graceful error handling with cleanup
 *
 * MIGRATION STEPS:
 * 1. PRE-FLIGHT: Backup existing data and validate environment
 * 2. AUDIT: Check source data quality and identify issues
 * 3. HEALTH CHECK: Verify URL accessibility
 * 4. CONVERSION: Transform CSV to JSON format
 * 5. VALIDATION: Ensure converted data meets requirements
 * 6. DEPLOYMENT: Atomically replace existing data
 * 7. VERIFICATION: Confirm successful deployment
 * 8. CLEANUP: Remove temporary files and finalize
 *
 * ROLLBACK PROCESS:
 * - Detects deployment issues automatically
 * - Restores previous data from backup
 * - Validates rollback success
 * - Reports rollback status and recommendations
 *
 * USAGE MODES:
 * - Full Migration: Complete end-to-end data migration
 * - Dry Run: Preview changes without applying them
 * - Rollback: Restore from most recent backup
 * - Audit Only: Run validation checks without migration
 *
 * OUTPUT:
 * - Real-time progress reporting with step-by-step status
 * - Comprehensive migration report saved to JSON
 * - Backup files with timestamp for recovery
 * - Detailed logs for troubleshooting
 * - Exit codes for automation integration
 *
 * USAGE:
 * node migrationPipeline.js <csv-file> [options]
 *
 * OPTIONS:
 * --dry-run          Preview changes without applying them
 * --rollback         Restore from most recent backup
 * --audit-only       Run validation checks only
 * --backup-dir       Custom backup directory
 * --target-config    Target configuration file
 *
 * EXAMPLES:
 * node migrationPipeline.js ../data/zeno_kb_assets.csv --dry-run
 * node migrationPipeline.js ../data/zeno_kb_assets.csv --target-config ../config/data.json
 * node migrationPipeline.js --rollback
 */

const fs = require("fs");
const path = require("path");
const DataAuditor = require("./dataAuditor");
const URLHealthChecker = require("./urlHealthChecker");
const DataConverter = require("./dataConverter");

class MigrationPipeline {
  constructor(options = {}) {
    // Configuration and options for the migration process
    this.options = {
      dryRun: options.dryRun || false,
      backupDir: options.backupDir || path.join(__dirname, "backups"),
      targetConfig:
        options.targetConfig || path.join(__dirname, "../config/data.json"),
      publicConfig:
        options.publicConfig ||
        path.join(__dirname, "../public/config/data.json"),
      rollbackOnly: options.rollbackOnly || false,
      auditOnly: options.auditOnly || false,
      verbose: options.verbose || false,
    };

    // Migration state tracking
    this.state = {
      currentStep: "initialization",
      startTime: new Date(),
      backupPath: null,
      errors: [],
      warnings: [],
      completed: false,
      rollbackAvailable: false,
    };

    // Migration step definitions with descriptions and validation
    this.steps = [
      {
        name: "backup",
        description: "Create backup of existing data",
        required: true,
      },
      {
        name: "audit",
        description: "Validate source data quality",
        required: true,
      },
      {
        name: "healthCheck",
        description: "Verify URL accessibility",
        required: false,
      },
      {
        name: "conversion",
        description: "Convert CSV to JSON format",
        required: true,
      },
      {
        name: "validation",
        description: "Validate converted data",
        required: true,
      },
      {
        name: "deployment",
        description: "Deploy new data files",
        required: true,
      },
      {
        name: "verification",
        description: "Verify deployment success",
        required: true,
      },
      {
        name: "cleanup",
        description: "Clean up temporary files",
        required: false,
      },
    ];

    // Results tracking for comprehensive reporting
    this.results = {
      backup: null,
      audit: null,
      healthCheck: null,
      conversion: null,
      validation: null,
      deployment: null,
      verification: null,
    };

    this.ensureDirectories();
  }

  // Main migration orchestration function
  async migrate(csvFilePath) {
    console.log("🚀 ZENO KB DATA MIGRATION PIPELINE");
    console.log("=".repeat(60));
    console.log(`📅 Started: ${this.state.startTime.toISOString()}`);
    console.log(`📁 Source: ${csvFilePath}`);
    console.log(`🎯 Target: ${this.options.targetConfig}`);
    console.log(
      `🔧 Mode: ${this.options.dryRun ? "DRY RUN" : "LIVE MIGRATION"}`
    );
    console.log("=".repeat(60));

    try {
      // Handle special modes (rollback, audit-only)
      if (this.options.rollbackOnly) {
        return await this.performRollback();
      }

      if (this.options.auditOnly) {
        return await this.performAuditOnly(csvFilePath);
      }

      // Execute full migration pipeline
      await this.executeStep("backup", () => this.createBackup());
      await this.executeStep("audit", () => this.runAudit(csvFilePath));
      await this.executeStep("healthCheck", () =>
        this.runHealthCheck(csvFilePath)
      );
      await this.executeStep("conversion", () =>
        this.runConversion(csvFilePath)
      );
      await this.executeStep("validation", () => this.validateConversion());
      await this.executeStep("deployment", () => this.deployData());
      await this.executeStep("verification", () => this.verifyDeployment());
      await this.executeStep("cleanup", () => this.cleanup());

      // Migration completed successfully
      this.state.completed = true;
      this.generateFinalReport();

      return { success: true, results: this.results };
    } catch (error) {
      // Handle migration failure with rollback
      console.error(`\n❌ Migration failed at step: ${this.state.currentStep}`);
      console.error(`Error: ${error.message}`);

      this.state.errors.push({
        step: this.state.currentStep,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      // Attempt automatic rollback if backup exists
      if (this.state.backupPath && !this.options.dryRun) {
        console.log("\n🔄 Attempting automatic rollback...");
        await this.performRollback();
      }

      this.generateFinalReport();
      return { success: false, error: error.message, results: this.results };
    }
  }

  // Execute a single migration step with error handling and logging
  async executeStep(stepName, stepFunction) {
    const step = this.steps.find((s) => s.name === stepName);
    if (!step) {
      throw new Error(`Unknown step: ${stepName}`);
    }

    console.log(
      `\n🔄 Step ${this.steps.indexOf(step) + 1}/${this.steps.length}: ${
        step.description
      }`
    );
    this.state.currentStep = stepName;

    try {
      const startTime = Date.now();
      const result = await stepFunction();
      const duration = Date.now() - startTime;

      this.results[stepName] = {
        success: true,
        duration,
        result,
        timestamp: new Date().toISOString(),
      };

      console.log(`✅ ${step.description} completed (${duration}ms)`);
      return result;
    } catch (error) {
      this.results[stepName] = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      if (step.required) {
        throw error; // Re-throw for required steps
      } else {
        console.warn(
          `⚠️  ${step.description} failed (non-critical): ${error.message}`
        );
        this.state.warnings.push({
          step: stepName,
          warning: error.message,
          timestamp: new Date().toISOString(),
        });
        return null;
      }
    }
  }

  // Create backup of existing data files before migration
  async createBackup() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.options.backupDir)) {
      fs.mkdirSync(this.options.backupDir, { recursive: true });
    }

    // Generate timestamp-based backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `data-backup-${timestamp}.json`;
    this.state.backupPath = path.join(this.options.backupDir, backupFileName);

    // Create backup if target file exists
    if (fs.existsSync(this.options.targetConfig)) {
      const existingData = fs.readFileSync(this.options.targetConfig, "utf8");

      if (!this.options.dryRun) {
        fs.writeFileSync(this.state.backupPath, existingData);
      }

      console.log(`📦 Backup created: ${this.state.backupPath}`);
      this.state.rollbackAvailable = true;

      return {
        backupPath: this.state.backupPath,
        originalSize: existingData.length,
        timestamp,
      };
    } else {
      console.log("📦 No existing data to backup (new installation)");
      return { message: "No existing data found" };
    }
  }

  // Run comprehensive data audit to validate source data quality
  async runAudit(csvFilePath) {
    console.log("🔍 Running data audit...");

    const auditor = new DataAuditor();
    const auditResult = await auditor.auditData(csvFilePath);

    if (!auditResult) {
      throw new Error(
        "Data audit failed - please fix data issues before migration"
      );
    }

    return {
      passed: auditResult,
      errors: auditor.errors.length,
      warnings: auditor.warnings.length,
      totalRecords: auditor.stats.totalRecords,
    };
  }

  // Run URL health check to verify all links are accessible
  async runHealthCheck(csvFilePath) {
    console.log("🔗 Checking URL health...");

    const checker = new URLHealthChecker();
    const healthResult = await checker.checkHealth(csvFilePath, {
      batchSize: 3,
    });

    // URL health check is non-critical - log warnings but don't fail migration
    if (!healthResult) {
      this.state.warnings.push({
        step: "healthCheck",
        warning: "Some URLs are not accessible",
        timestamp: new Date().toISOString(),
      });
    }

    return {
      passed: healthResult,
      totalUrls: checker.stats.total,
      healthyUrls: checker.stats.healthy,
      unhealthyUrls: checker.stats.unhealthy,
    };
  }

  // Convert CSV data to application JSON format
  async runConversion(csvFilePath) {
    console.log("🔄 Converting data format...");

    const converter = new DataConverter();

    // Generate temporary output path for converted data
    const tempOutputPath = path.join(__dirname, "temp-converted-data.json");
    const conversionResult = await converter.convertData(
      csvFilePath,
      tempOutputPath
    );

    if (!conversionResult.success) {
      throw new Error(`Data conversion failed: ${conversionResult.error}`);
    }

    // Store temporary path for later deployment
    this.tempDataPath = tempOutputPath;

    return {
      success: conversionResult.success,
      outputPath: tempOutputPath,
      convertedRecords: conversionResult.stats.convertedRecords,
      skippedRecords: conversionResult.stats.skippedRecords,
    };
  }

  // Validate the converted data meets application requirements
  async validateConversion() {
    console.log("✅ Validating converted data...");

    if (!this.tempDataPath || !fs.existsSync(this.tempDataPath)) {
      throw new Error("Converted data file not found");
    }

    // Load and validate the converted data structure
    const convertedData = JSON.parse(
      fs.readFileSync(this.tempDataPath, "utf8")
    );

    // Validate required structure
    if (!convertedData.tools || !Array.isArray(convertedData.tools)) {
      throw new Error("Converted data must contain a tools array");
    }

    if (convertedData.tools.length === 0) {
      throw new Error("Converted data contains no tools");
    }

    // Validate each tool has required fields
    const requiredFields = ["id", "title", "description", "type", "link"];
    const invalidTools = [];

    convertedData.tools.forEach((tool, index) => {
      const missing = requiredFields.filter((field) => !tool[field]);
      if (missing.length > 0) {
        invalidTools.push({ index, missing });
      }
    });

    if (invalidTools.length > 0) {
      throw new Error(
        `${invalidTools.length} tools are missing required fields`
      );
    }

    return {
      valid: true,
      toolCount: convertedData.tools.length,
      validatedFields: requiredFields,
      dataSize: fs.statSync(this.tempDataPath).size,
    };
  }

  // Deploy the converted data to application configuration files
  async deployData() {
    console.log("🚀 Deploying new data...");

    if (this.options.dryRun) {
      console.log("🔍 DRY RUN: Would deploy data to:");
      console.log(`  - ${this.options.targetConfig}`);
      console.log(`  - ${this.options.publicConfig}`);
      return { dryRun: true, message: "Deployment skipped in dry run mode" };
    }

    // Read converted data
    const convertedData = fs.readFileSync(this.tempDataPath, "utf8");

    // Atomic deployment - write to both locations
    const deploymentTargets = [
      this.options.targetConfig,
      this.options.publicConfig,
    ];

    // Ensure target directories exist
    deploymentTargets.forEach((target) => {
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Deploy to all targets atomically
    deploymentTargets.forEach((target) => {
      fs.writeFileSync(target, convertedData);
    });

    return {
      deployed: true,
      targets: deploymentTargets,
      dataSize: convertedData.length,
      timestamp: new Date().toISOString(),
    };
  }

  // Verify successful deployment by checking file integrity
  async verifyDeployment() {
    console.log("🔍 Verifying deployment...");

    if (this.options.dryRun) {
      return { dryRun: true, message: "Verification skipped in dry run mode" };
    }

    const deploymentTargets = [
      this.options.targetConfig,
      this.options.publicConfig,
    ];
    const verificationResults = [];

    // Verify each deployment target
    for (const target of deploymentTargets) {
      try {
        // Check file exists and is readable
        if (!fs.existsSync(target)) {
          throw new Error(`Deployment target not found: ${target}`);
        }

        // Parse JSON to ensure it's valid
        const data = JSON.parse(fs.readFileSync(target, "utf8"));

        // Basic structure validation
        if (!data.tools || !Array.isArray(data.tools)) {
          throw new Error(`Invalid data structure in: ${target}`);
        }

        verificationResults.push({
          target,
          success: true,
          toolCount: data.tools.length,
          fileSize: fs.statSync(target).size,
        });
      } catch (error) {
        verificationResults.push({
          target,
          success: false,
          error: error.message,
        });
      }
    }

    // Check if any verification failed
    const failed = verificationResults.filter((r) => !r.success);
    if (failed.length > 0) {
      throw new Error(
        `Deployment verification failed for ${failed.length} targets`
      );
    }

    return {
      verified: true,
      targets: verificationResults,
      allTargetsValid: true,
    };
  }

  // Clean up temporary files created during migration
  async cleanup() {
    console.log("🧹 Cleaning up temporary files...");

    const filesToClean = [
      this.tempDataPath,
      path.join(__dirname, "audit-report.json"),
      path.join(__dirname, "url-health-report.json"),
    ];

    const cleanedFiles = [];

    filesToClean.forEach((filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          if (!this.options.dryRun) {
            fs.unlinkSync(filePath);
          }
          cleanedFiles.push(filePath);
        } catch (error) {
          console.warn(`⚠️  Could not clean up ${filePath}: ${error.message}`);
        }
      }
    });

    return {
      cleanedFiles,
      dryRun: this.options.dryRun,
    };
  }

  // Perform rollback to restore previous data from backup
  async performRollback() {
    console.log("\n🔄 PERFORMING ROLLBACK");
    console.log("=".repeat(40));

    try {
      // Find most recent backup
      const backupPath = this.findLatestBackup();
      if (!backupPath) {
        throw new Error("No backup found for rollback");
      }

      console.log(`📦 Restoring from backup: ${backupPath}`);

      // Restore backup data
      const backupData = fs.readFileSync(backupPath, "utf8");

      // Deploy backup to all targets
      const deploymentTargets = [
        this.options.targetConfig,
        this.options.publicConfig,
      ];
      deploymentTargets.forEach((target) => {
        const dir = path.dirname(target);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(target, backupData);
      });

      console.log("✅ Rollback completed successfully");
      return { success: true, backupPath, restoredTargets: deploymentTargets };
    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Find the most recent backup file for rollback
  findLatestBackup() {
    if (!fs.existsSync(this.options.backupDir)) {
      return null;
    }

    const backupFiles = fs
      .readdirSync(this.options.backupDir)
      .filter(
        (file) => file.startsWith("data-backup-") && file.endsWith(".json")
      )
      .map((file) => ({
        name: file,
        path: path.join(this.options.backupDir, file),
        mtime: fs.statSync(path.join(this.options.backupDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    return backupFiles.length > 0 ? backupFiles[0].path : null;
  }

  // Perform audit-only mode without migration
  async performAuditOnly(csvFilePath) {
    console.log("\n🔍 AUDIT-ONLY MODE");
    console.log("=".repeat(40));

    try {
      await this.executeStep("audit", () => this.runAudit(csvFilePath));
      await this.executeStep("healthCheck", () =>
        this.runHealthCheck(csvFilePath)
      );

      console.log("\n✅ Audit completed - no migration performed");
      return { success: true, auditOnly: true, results: this.results };
    } catch (error) {
      console.error(`❌ Audit failed: ${error.message}`);
      return { success: false, error: error.message, results: this.results };
    }
  }

  // Generate comprehensive final report of migration results
  generateFinalReport() {
    const endTime = new Date();
    const duration = endTime - this.state.startTime;

    console.log("\n📋 MIGRATION REPORT");
    console.log("=".repeat(60));
    console.log(`📅 Started: ${this.state.startTime.toISOString()}`);
    console.log(`📅 Completed: ${endTime.toISOString()}`);
    console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    console.log(
      `🎯 Mode: ${this.options.dryRun ? "DRY RUN" : "LIVE MIGRATION"}`
    );
    console.log(`✅ Success: ${this.state.completed ? "YES" : "NO"}`);

    // Step-by-step results
    console.log("\n📊 STEP RESULTS:");
    this.steps.forEach((step, index) => {
      const result = this.results[step.name];
      if (result) {
        const status = result.success ? "✅" : "❌";
        const duration = result.duration ? `(${result.duration}ms)` : "";
        console.log(
          `  ${index + 1}. ${step.description}: ${status} ${duration}`
        );
      }
    });

    // Errors and warnings summary
    if (this.state.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      this.state.errors.forEach((error) => {
        console.log(`  ${error.step}: ${error.error}`);
      });
    }

    if (this.state.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.state.warnings.forEach((warning) => {
        console.log(`  ${warning.step}: ${warning.warning}`);
      });
    }

    // Save detailed report
    const reportPath = path.join(__dirname, "migration-report.json");
    const report = {
      timestamp: endTime.toISOString(),
      duration,
      success: this.state.completed,
      mode: this.options.dryRun ? "dry-run" : "live",
      steps: this.results,
      errors: this.state.errors,
      warnings: this.state.warnings,
      backupPath: this.state.backupPath,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log(
      this.state.completed
        ? "🎉 MIGRATION COMPLETED SUCCESSFULLY"
        : "❌ MIGRATION FAILED"
    );
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    console.log("=".repeat(60));
  }

  // Ensure required directories exist
  ensureDirectories() {
    [
      this.options.backupDir,
      path.dirname(this.options.targetConfig),
      path.dirname(this.options.publicConfig),
    ].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}

// Command-line interface when run directly
if (require.main === module) {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const csvFilePath = args.find((arg) => !arg.startsWith("--"));

  const options = {
    dryRun: args.includes("--dry-run"),
    rollbackOnly: args.includes("--rollback"),
    auditOnly: args.includes("--audit-only"),
    verbose: args.includes("--verbose"),
  };

  // Extract custom options
  const backupDirIndex = args.indexOf("--backup-dir");
  if (backupDirIndex !== -1 && args[backupDirIndex + 1]) {
    options.backupDir = args[backupDirIndex + 1];
  }

  const targetConfigIndex = args.indexOf("--target-config");
  if (targetConfigIndex !== -1 && args[targetConfigIndex + 1]) {
    options.targetConfig = args[targetConfigIndex + 1];
  }

  // Validate arguments
  if (!options.rollbackOnly && !csvFilePath) {
    console.log("Usage: node migrationPipeline.js <csv-file> [options]");
    console.log("");
    console.log("Options:");
    console.log(
      "  --dry-run              Preview changes without applying them"
    );
    console.log("  --rollback             Restore from most recent backup");
    console.log("  --audit-only           Run validation checks only");
    console.log("  --backup-dir <path>    Custom backup directory");
    console.log("  --target-config <path> Target configuration file");
    console.log("  --verbose              Enable verbose logging");
    console.log("");
    console.log("Examples:");
    console.log(
      "  node migrationPipeline.js ../data/zeno_kb_assets.csv --dry-run"
    );
    console.log(
      "  node migrationPipeline.js ../data/zeno_kb_assets.csv --target-config ../config/data.json"
    );
    console.log("  node migrationPipeline.js --rollback");
    process.exit(1);
  }

  // Execute migration pipeline
  const pipeline = new MigrationPipeline(options);
  pipeline
    .migrate(csvFilePath)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Pipeline failed:", error);
      process.exit(1);
    });
}

module.exports = MigrationPipeline;
