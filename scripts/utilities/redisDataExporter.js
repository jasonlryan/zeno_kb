/**
 * ZENO KB - Redis Data Exporter
 *
 * PURPOSE: Exports Redis data (configs and tools) to CSV format for backup,
 *          reporting, and analysis. Extracts all configuration data and tool
 *          data from Redis and saves as structured CSV files.
 *
 * STATUS: PRODUCTION UTILITY - Used for data backup and export
 *
 * USAGE: node scripts/utilities/redisDataExporter.js [--output=./exports] [--format=csv]
 *
 * OUTPUT: CSV files with Redis data organized by type
 *
 * DEPENDENCIES: Redis, csv-stringify, lib/redisConfigManager
 */

const { Redis } = require("@upstash/redis");
const fs = require("fs");
const path = require("path");
const { stringify } = require("csv-stringify/sync");

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

class RedisDataExporter {
  constructor() {
    this.outputDir = "./exports";
    this.timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async exportAllData() {
    console.log("📊 Starting Redis data export...\n");

    try {
      // Export configuration data
      await this.exportConfigData();

      // Export tools data
      await this.exportToolsData();

      // Export users data
      await this.exportUsersData();

      // Export favorites data
      await this.exportFavoritesData();

      console.log("\n✅ All data exported successfully!");
      console.log(`📁 Output directory: ${path.resolve(this.outputDir)}`);
    } catch (error) {
      console.error("❌ Export failed:", error.message);
      process.exit(1);
    }
  }

  async exportConfigData() {
    console.log("🔧 Exporting configuration data...");

    const configs = {
      app: await redis.get("app-config"),
      content: await redis.get("content-config"),
      data: await redis.get("data-config"),
      taxonomy: await redis.get("taxonomy-config"),
    };

    for (const [configName, configData] of Object.entries(configs)) {
      if (configData) {
        const filename = `${configName}-config-${this.timestamp}.json`;
        const filepath = path.join(this.outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(configData, null, 2));
        console.log(`  ✅ ${configName}-config exported to ${filename}`);
      } else {
        console.log(`  ⚠️  No ${configName}-config found in Redis`);
      }
    }
  }

  async exportToolsData() {
    console.log("🛠️  Exporting tools data...");

    const dataConfig = await redis.get("data-config");
    if (!dataConfig || !dataConfig.tools) {
      console.log("  ⚠️  No tools data found in Redis");
      return;
    }

    const tools = dataConfig.tools;
    console.log(`  📊 Found ${tools.length} tools`);

    // Export as CSV
    const csvFilename = `tools-${this.timestamp}.csv`;
    const csvFilepath = path.join(this.outputDir, csvFilename);

    // Define CSV headers based on tool structure
    const headers = [
      "id",
      "title",
      "description",
      "shortDescription",
      "url",
      "type",
      "tier",
      "complexity",
      "tags",
      "function",
      "featured",
      "date_added",
      "added_by",
      "category",
    ];

    const csvData = tools.map((tool) => {
      return {
        id: tool.id || "",
        title: tool.title || "",
        description: tool.description || "",
        shortDescription: tool.shortDescription || "",
        url: tool.url || "",
        type: tool.type || "",
        tier: tool.tier || "",
        complexity: tool.complexity || "",
        tags: Array.isArray(tool.tags) ? tool.tags.join("; ") : tool.tags || "",
        function: tool.function || "",
        featured: tool.featured ? "true" : "false",
        date_added: tool.date_added || "",
        added_by: tool.added_by || "",
        category: tool.category || "",
      };
    });

    const csvContent = stringify(csvData, { header: true });
    fs.writeFileSync(csvFilepath, csvContent);
    console.log(`  ✅ Tools exported to ${csvFilename}`);

    // Also export as JSON for backup
    const jsonFilename = `tools-${this.timestamp}.json`;
    const jsonFilepath = path.join(this.outputDir, jsonFilename);
    fs.writeFileSync(jsonFilepath, JSON.stringify(tools, null, 2));
    console.log(`  ✅ Tools backup exported to ${jsonFilename}`);
  }

  async exportUsersData() {
    console.log("👥 Exporting users data...");

    const dataConfig = await redis.get("data-config");
    if (!dataConfig || !dataConfig.users) {
      console.log("  ⚠️  No users data found in Redis");
      return;
    }

    const users = dataConfig.users;
    console.log(`  📊 Found ${users.length} users`);

    const csvFilename = `users-${this.timestamp}.csv`;
    const csvFilepath = path.join(this.outputDir, csvFilename);

    const headers = [
      "id",
      "email",
      "name",
      "role",
      "date_created",
      "last_login",
    ];

    const csvData = users.map((user) => {
      return {
        id: user.id || "",
        email: user.email || "",
        name: user.name || "",
        role: user.role || "",
        date_created: user.date_created || "",
        last_login: user.last_login || "",
      };
    });

    const csvContent = stringify(csvData, { header: true });
    fs.writeFileSync(csvFilepath, csvContent);
    console.log(`  ✅ Users exported to ${csvFilename}`);
  }

  async exportFavoritesData() {
    console.log("⭐ Exporting favorites data...");

    const dataConfig = await redis.get("data-config");
    if (!dataConfig || !dataConfig.favorites) {
      console.log("  ⚠️  No favorites data found in Redis");
      return;
    }

    const favorites = dataConfig.favorites;
    console.log(`  📊 Found ${favorites.length} favorites`);

    const csvFilename = `favorites-${this.timestamp}.csv`;
    const csvFilepath = path.join(this.outputDir, csvFilename);

    const headers = ["user_id", "tool_id", "date_favorited"];

    const csvData = favorites.map((favorite) => {
      return {
        user_id: favorite.user_id || "",
        tool_id: favorite.tool_id || "",
        date_favorited: favorite.date_favorited || "",
      };
    });

    const csvContent = stringify(csvData, { header: true });
    fs.writeFileSync(csvFilepath, csvContent);
    console.log(`  ✅ Favorites exported to ${csvFilename}`);
  }

  async generateExportReport() {
    const report = {
      timestamp: this.timestamp,
      export_date: new Date().toISOString(),
      files_created: [],
      summary: {},
    };

    // Scan output directory for created files
    const files = fs.readdirSync(this.outputDir);
    report.files_created = files.filter((file) =>
      file.includes(this.timestamp)
    );

    // Generate summary
    const toolsFile = files.find(
      (f) => f.includes("tools-") && f.includes(this.timestamp)
    );
    if (toolsFile) {
      const toolsPath = path.join(this.outputDir, toolsFile);
      const toolsContent = fs.readFileSync(toolsPath, "utf8");
      const lines = toolsContent.split("\n").length - 1; // Subtract header
      report.summary.tools_count = lines;
    }

    const reportFilename = `export-report-${this.timestamp}.json`;
    const reportFilepath = path.join(this.outputDir, reportFilename);
    fs.writeFileSync(reportFilepath, JSON.stringify(report, null, 2));

    console.log(`📋 Export report saved to ${reportFilename}`);
    return report;
  }
}

// Main execution
async function main() {
  require("dotenv").config({ path: "../../.env.local" });

  const exporter = new RedisDataExporter();
  await exporter.exportAllData();
  await exporter.generateExportReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RedisDataExporter;
