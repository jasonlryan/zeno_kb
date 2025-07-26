/**
 * ZENO KB - Complete Data Exporter
 *
 * PURPOSE: Comprehensive data export utility that extracts all data from Redis
 *          including configuration data, tools, users, favorites, and analytics.
 *          Provides a single command to export everything for backup, reporting,
 *          and analysis purposes.
 *
 * STATUS: PRODUCTION UTILITY - Used for complete data backup and export
 *
 * USAGE: node scripts/utilities/completeDataExporter.js [--output=./backups] [--include-analytics]
 *
 * OUTPUT: Complete CSV and JSON exports with timestamped organization
 *
 * DEPENDENCIES: Redis, csv-stringify, RedisDataExporter, AnalyticsDataExporter
 */

const fs = require("fs");
const path = require("path");
const RedisDataExporter = require("./redisDataExporter");
const AnalyticsDataExporter = require("./analyticsDataExporter");

class CompleteDataExporter {
  constructor(options = {}) {
    this.outputDir = options.output || "./backups";
    this.includeAnalytics = options.includeAnalytics !== false; // Default to true
    this.timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async exportAllData() {
    console.log("🚀 Starting complete data export...\n");

    const startTime = new Date();
    const exportReport = {
      timestamp: this.timestamp,
      export_date: startTime.toISOString(),
      duration_seconds: 0,
      files_created: [],
      summary: {
        config_data: {},
        analytics_data: {},
      },
      status: "completed",
    };

    try {
      // Export Redis data (configs, tools, users, favorites)
      console.log("📊 Phase 1: Exporting Redis data...");
      const redisExporter = new RedisDataExporter();
      redisExporter.outputDir = path.join(this.outputDir, "redis-data");
      await redisExporter.exportAllData();

      // Get Redis export report
      const redisReport = await redisExporter.generateExportReport();
      exportReport.summary.config_data = redisReport;

      // Export analytics data if requested
      if (this.includeAnalytics) {
        console.log("\n📈 Phase 2: Exporting analytics data...");
        const analyticsExporter = new AnalyticsDataExporter();
        analyticsExporter.outputDir = path.join(
          this.outputDir,
          "analytics-data"
        );
        await analyticsExporter.exportAllAnalytics();

        // Get analytics export report
        const analyticsReport =
          await analyticsExporter.generateAnalyticsReport();
        exportReport.summary.analytics_data = analyticsReport;
      }

      // Create a comprehensive summary
      await this.createComprehensiveSummary(exportReport);

      const endTime = new Date();
      exportReport.duration_seconds = Math.round((endTime - startTime) / 1000);

      console.log("\n✅ Complete data export finished successfully!");
      console.log(`⏱️  Duration: ${exportReport.duration_seconds} seconds`);
      console.log(`📁 Output directory: ${path.resolve(this.outputDir)}`);

      return exportReport;
    } catch (error) {
      console.error("❌ Complete data export failed:", error.message);
      exportReport.status = "failed";
      exportReport.error = error.message;
      exportReport.duration_seconds = Math.round(
        (new Date() - startTime) / 1000
      );

      await this.createComprehensiveSummary(exportReport);
      process.exit(1);
    }
  }

  async createComprehensiveSummary(exportReport) {
    console.log("\n📋 Generating comprehensive export summary...");

    // Scan all created files
    const allFiles = this.scanAllFiles();
    exportReport.files_created = allFiles;

    // Create summary statistics
    const summary = await this.generateSummaryStats(allFiles);
    exportReport.summary.statistics = summary;

    // Save comprehensive report
    const reportFilename = `complete-export-report-${this.timestamp}.json`;
    const reportFilepath = path.join(this.outputDir, reportFilename);
    fs.writeFileSync(reportFilepath, JSON.stringify(exportReport, null, 2));

    // Create human-readable summary
    await this.createHumanReadableSummary(exportReport, summary);

    console.log(`📋 Comprehensive report saved to ${reportFilename}`);
  }

  scanAllFiles() {
    const files = [];

    const scanDirectory = (dir) => {
      if (fs.existsSync(dir)) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (stat.isFile() && item.includes(this.timestamp)) {
            files.push({
              name: item,
              path: fullPath,
              size_bytes: stat.size,
              size_mb: (stat.size / (1024 * 1024)).toFixed(2),
              type: path.extname(item).substring(1),
            });
          }
        }
      }
    };

    scanDirectory(this.outputDir);
    return files;
  }

  async generateSummaryStats(files) {
    const stats = {
      total_files: files.length,
      total_size_mb: 0,
      file_types: {},
      data_categories: {
        config: 0,
        tools: 0,
        users: 0,
        favorites: 0,
        analytics: 0,
      },
    };

    for (const file of files) {
      stats.total_size_mb += parseFloat(file.size_mb);

      // Count file types
      stats.file_types[file.type] = (stats.file_types[file.type] || 0) + 1;

      // Categorize files
      if (file.name.includes("config")) {
        stats.data_categories.config++;
      } else if (file.name.includes("tools")) {
        stats.data_categories.tools++;
      } else if (file.name.includes("users")) {
        stats.data_categories.users++;
      } else if (file.name.includes("favorites")) {
        stats.data_categories.favorites++;
      } else if (
        file.name.includes("analytics") ||
        file.name.includes("chat") ||
        file.name.includes("event") ||
        file.name.includes("session")
      ) {
        stats.data_categories.analytics++;
      }
    }

    stats.total_size_mb = stats.total_size_mb.toFixed(2);
    return stats;
  }

  async createHumanReadableSummary(exportReport, summary) {
    const summaryFilename = `export-summary-${this.timestamp}.txt`;
    const summaryFilepath = path.join(this.outputDir, summaryFilename);

    const summaryText = `
ZENO KB - Complete Data Export Summary
=====================================

Export Date: ${new Date(exportReport.export_date).toLocaleString()}
Duration: ${exportReport.duration_seconds} seconds
Status: ${exportReport.status}

📊 EXPORT STATISTICS
-------------------
Total Files: ${summary.total_files}
Total Size: ${summary.total_size_mb} MB

📁 DATA CATEGORIES
------------------
Configuration Files: ${summary.data_categories.config}
Tools Data: ${summary.data_categories.tools}
Users Data: ${summary.data_categories.users}
Favorites Data: ${summary.data_categories.favorites}
Analytics Data: ${summary.data_categories.analytics}

📄 FILE TYPES
-------------
${Object.entries(summary.file_types)
  .map(([type, count]) => `${type.toUpperCase()}: ${count}`)
  .join("\n")}

📋 FILES CREATED
----------------
${exportReport.files_created
  .map((file) => `• ${file.name} (${file.size_mb} MB)`)
  .join("\n")}

🔧 CONFIGURATION DATA
---------------------
${
  exportReport.summary.config_data.files_created
    ? exportReport.summary.config_data.files_created
        .map((file) => `• ${file}`)
        .join("\n")
    : "No configuration data exported"
}

📈 ANALYTICS DATA
-----------------
${
  exportReport.summary.analytics_data.files_created
    ? exportReport.summary.analytics_data.files_created
        .map((file) => `• ${file}`)
        .join("\n")
    : "No analytics data exported"
}

📁 OUTPUT DIRECTORY
-------------------
${path.resolve(this.outputDir)}

⚠️  IMPORTANT NOTES
-------------------
• All data is timestamped for version control
• CSV files are ready for import into spreadsheet applications
• JSON files contain complete data structures
• Use this export for backup, reporting, and analysis
• Keep this export secure as it contains all application data
`;

    fs.writeFileSync(summaryFilepath, summaryText);
    console.log(`📄 Human-readable summary saved to ${summaryFilename}`);
  }

  async createBackupArchive() {
    console.log("\n🗜️  Creating backup archive...");

    // This would require a compression library like 'archiver'
    // For now, we'll just note that this could be implemented
    console.log(
      "💡 Archive creation not implemented - files are ready for manual archiving"
    );
    console.log(`📁 Archive-ready directory: ${path.resolve(this.outputDir)}`);
  }
}

// Command line interface
async function main() {
  require("dotenv").config({ path: "../../.env.local" });

  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith("--output=")) {
      options.output = arg.split("=")[1];
    } else if (arg === "--no-analytics") {
      options.includeAnalytics = false;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
ZENO KB - Complete Data Exporter

USAGE: node scripts/utilities/completeDataExporter.js [options]

OPTIONS:
  --output=<path>        Output directory (default: ./backups)
  --no-analytics         Skip analytics data export
  --help, -h            Show this help message

EXAMPLES:
  node scripts/utilities/completeDataExporter.js
  node scripts/utilities/completeDataExporter.js --output=./my-backup
  node scripts/utilities/completeDataExporter.js --no-analytics
      `);
      process.exit(0);
    }
  }

  const exporter = new CompleteDataExporter(options);
  await exporter.exportAllData();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CompleteDataExporter;
