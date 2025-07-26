/**
 * ZENO KB - Analytics Data Exporter
 *
 * PURPOSE: Exports analytics data from Redis to CSV format for reporting,
 *          analysis, and backup. Extracts chat queries, tool views, favorites,
 *          and other analytics events with timestamps and metadata.
 *
 * STATUS: PRODUCTION UTILITY - Used for analytics reporting and backup
 *
 * USAGE: node scripts/utilities/analyticsDataExporter.js [--output=./analytics] [--days=30]
 *
 * OUTPUT: CSV files with analytics data organized by event type and date
 *
 * DEPENDENCIES: Redis, csv-stringify, date-fns
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

class AnalyticsDataExporter {
  constructor(options = {}) {
    this.outputDir = options.output || "./analytics";
    this.days = options.days || 30;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async exportAllAnalytics() {
    console.log("📊 Starting analytics data export...\n");

    try {
      // Export different types of analytics data
      await this.exportChatAnalytics();
      await this.exportToolAnalytics();
      await this.exportUserAnalytics();
      await this.exportDailyStats();
      await this.exportEventLogs();

      console.log("\n✅ All analytics data exported successfully!");
      console.log(`📁 Output directory: ${path.resolve(this.outputDir)}`);
    } catch (error) {
      console.error("❌ Analytics export failed:", error.message);
      process.exit(1);
    }
  }

  async exportChatAnalytics() {
    console.log("💬 Exporting chat analytics...");

    try {
      // Get chat queries from Redis
      const chatQueries = await this.getChatQueries();
      const chatResponses = await this.getChatResponses();

      if (chatQueries.length > 0) {
        const csvFilename = `chat-queries-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = chatQueries.map((query) => ({
          timestamp: query.timestamp,
          session_id: query.session_id,
          query: query.query,
          response_length: query.response_length || 0,
          user_agent: query.user_agent || "",
          ip_address: query.ip_address || "",
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ Chat queries exported to ${csvFilename} (${chatQueries.length} records)`
        );
      }

      if (chatResponses.length > 0) {
        const csvFilename = `chat-responses-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = chatResponses.map((response) => ({
          timestamp: response.timestamp,
          session_id: response.session_id,
          response_length: response.response_length,
          processing_time: response.processing_time || 0,
          tokens_used: response.tokens_used || 0,
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ Chat responses exported to ${csvFilename} (${chatResponses.length} records)`
        );
      }
    } catch (error) {
      console.log(`  ⚠️  Error exporting chat analytics: ${error.message}`);
    }
  }

  async exportToolAnalytics() {
    console.log("🛠️  Exporting tool analytics...");

    try {
      // Get tool views and favorites
      const toolViews = await this.getToolViews();
      const toolFavorites = await this.getToolFavorites();

      if (toolViews.length > 0) {
        const csvFilename = `tool-views-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = toolViews.map((view) => ({
          timestamp: view.timestamp,
          tool_id: view.tool_id,
          tool_title: view.tool_title || "",
          session_id: view.session_id,
          user_agent: view.user_agent || "",
          ip_address: view.ip_address || "",
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ Tool views exported to ${csvFilename} (${toolViews.length} records)`
        );
      }

      if (toolFavorites.length > 0) {
        const csvFilename = `tool-favorites-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = toolFavorites.map((favorite) => ({
          timestamp: favorite.timestamp,
          tool_id: favorite.tool_id,
          tool_title: favorite.tool_title || "",
          session_id: favorite.session_id,
          action: favorite.action || "favorite",
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ Tool favorites exported to ${csvFilename} (${toolFavorites.length} records)`
        );
      }
    } catch (error) {
      console.log(`  ⚠️  Error exporting tool analytics: ${error.message}`);
    }
  }

  async exportUserAnalytics() {
    console.log("👥 Exporting user analytics...");

    try {
      // Get user activity data
      const userSessions = await this.getUserSessions();
      const userActivity = await this.getUserActivity();

      if (userSessions.length > 0) {
        const csvFilename = `user-sessions-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = userSessions.map((session) => ({
          session_id: session.session_id,
          start_time: session.start_time,
          end_time: session.end_time,
          duration_seconds: session.duration_seconds || 0,
          page_views: session.page_views || 0,
          tools_viewed: session.tools_viewed || 0,
          chats_initiated: session.chats_initiated || 0,
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ User sessions exported to ${csvFilename} (${userSessions.length} records)`
        );
      }

      if (userActivity.length > 0) {
        const csvFilename = `user-activity-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = userActivity.map((activity) => ({
          timestamp: activity.timestamp,
          session_id: activity.session_id,
          event_type: activity.event_type,
          event_data: JSON.stringify(activity.event_data || {}),
          user_agent: activity.user_agent || "",
          ip_address: activity.ip_address || "",
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ User activity exported to ${csvFilename} (${userActivity.length} records)`
        );
      }
    } catch (error) {
      console.log(`  ⚠️  Error exporting user analytics: ${error.message}`);
    }
  }

  async exportDailyStats() {
    console.log("📈 Exporting daily statistics...");

    try {
      // Get daily aggregated stats
      const dailyStats = await this.getDailyStats();

      if (dailyStats.length > 0) {
        const csvFilename = `daily-stats-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = dailyStats.map((stat) => ({
          date: stat.date,
          total_queries: stat.total_queries || 0,
          total_responses: stat.total_responses || 0,
          total_tool_views: stat.total_tool_views || 0,
          total_tool_favorites: stat.total_tool_favorites || 0,
          unique_users: stat.unique_users || 0,
          unique_sessions: stat.unique_sessions || 0,
          avg_session_duration: stat.avg_session_duration || 0,
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ Daily stats exported to ${csvFilename} (${dailyStats.length} records)`
        );
      }
    } catch (error) {
      console.log(`  ⚠️  Error exporting daily stats: ${error.message}`);
    }
  }

  async exportEventLogs() {
    console.log("📋 Exporting event logs...");

    try {
      // Get all recent events
      const events = await this.getRecentEvents();

      if (events.length > 0) {
        const csvFilename = `event-logs-${this.timestamp}.csv`;
        const csvFilepath = path.join(this.outputDir, csvFilename);

        const csvData = events.map((event) => ({
          timestamp: event.timestamp,
          event_type: event.type,
          session_id: event.session_id,
          user_agent: event.user_agent || "",
          ip_address: event.ip_address || "",
          event_data: JSON.stringify(event.data || {}),
          score: event.score || 0,
        }));

        const csvContent = stringify(csvData, { header: true });
        fs.writeFileSync(csvFilepath, csvContent);
        console.log(
          `  ✅ Event logs exported to ${csvFilename} (${events.length} records)`
        );
      }
    } catch (error) {
      console.log(`  ⚠️  Error exporting event logs: ${error.message}`);
    }
  }

  // Helper methods to extract data from Redis
  async getChatQueries() {
    try {
      const keys = await redis.keys("analytics:chat_query:*");
      const queries = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          queries.push({
            timestamp: data.timestamp,
            session_id: data.session_id,
            query: data.query,
            response_length: data.response_length,
            user_agent: data.user_agent,
            ip_address: data.ip_address,
          });
        }
      }

      return queries.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting chat queries: ${error.message}`);
      return [];
    }
  }

  async getChatResponses() {
    try {
      const keys = await redis.keys("analytics:chat_response:*");
      const responses = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          responses.push({
            timestamp: data.timestamp,
            session_id: data.session_id,
            response_length: data.response_length,
            processing_time: data.processing_time,
            tokens_used: data.tokens_used,
          });
        }
      }

      return responses.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting chat responses: ${error.message}`);
      return [];
    }
  }

  async getToolViews() {
    try {
      const keys = await redis.keys("analytics:tool_view:*");
      const views = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          views.push({
            timestamp: data.timestamp,
            tool_id: data.tool_id,
            tool_title: data.tool_title,
            session_id: data.session_id,
            user_agent: data.user_agent,
            ip_address: data.ip_address,
          });
        }
      }

      return views.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting tool views: ${error.message}`);
      return [];
    }
  }

  async getToolFavorites() {
    try {
      const keys = await redis.keys("analytics:tool_favorite:*");
      const favorites = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          favorites.push({
            timestamp: data.timestamp,
            tool_id: data.tool_id,
            tool_title: data.tool_title,
            session_id: data.session_id,
            action: data.action,
          });
        }
      }

      return favorites.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting tool favorites: ${error.message}`);
      return [];
    }
  }

  async getUserSessions() {
    try {
      const keys = await redis.keys("analytics:session:*");
      const sessions = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          sessions.push({
            session_id: data.session_id,
            start_time: data.start_time,
            end_time: data.end_time,
            duration_seconds: data.duration_seconds,
            page_views: data.page_views,
            tools_viewed: data.tools_viewed,
            chats_initiated: data.chats_initiated,
          });
        }
      }

      return sessions.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting user sessions: ${error.message}`);
      return [];
    }
  }

  async getUserActivity() {
    try {
      const keys = await redis.keys("analytics:activity:*");
      const activities = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          activities.push({
            timestamp: data.timestamp,
            session_id: data.session_id,
            event_type: data.event_type,
            event_data: data.event_data,
            user_agent: data.user_agent,
            ip_address: data.ip_address,
          });
        }
      }

      return activities.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting user activity: ${error.message}`);
      return [];
    }
  }

  async getDailyStats() {
    try {
      const keys = await redis.keys("analytics:daily:*");
      const stats = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          stats.push({
            date: data.date,
            total_queries: data.total_queries,
            total_responses: data.total_responses,
            total_tool_views: data.total_tool_views,
            total_tool_favorites: data.total_tool_favorites,
            unique_users: data.unique_users,
            unique_sessions: data.unique_sessions,
            avg_session_duration: data.avg_session_duration,
          });
        }
      }

      return stats.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.log(`    ⚠️  Error getting daily stats: ${error.message}`);
      return [];
    }
  }

  async getRecentEvents() {
    try {
      const keys = await redis.keys("analytics:event:*");
      const events = [];

      for (const key of keys) {
        const data = await redis.hgetall(key);
        if (data) {
          events.push({
            timestamp: data.timestamp,
            type: data.type,
            session_id: data.session_id,
            user_agent: data.user_agent,
            ip_address: data.ip_address,
            data: data.data,
            score: data.score,
          });
        }
      }

      return events.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.log(`    ⚠️  Error getting recent events: ${error.message}`);
      return [];
    }
  }

  async generateAnalyticsReport() {
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
    const eventLogsFile = files.find(
      (f) => f.includes("event-logs-") && f.includes(this.timestamp)
    );
    if (eventLogsFile) {
      const eventLogsPath = path.join(this.outputDir, eventLogsFile);
      const eventLogsContent = fs.readFileSync(eventLogsPath, "utf8");
      const lines = eventLogsContent.split("\n").length - 1; // Subtract header
      report.summary.total_events = lines;
    }

    const reportFilename = `analytics-report-${this.timestamp}.json`;
    const reportFilepath = path.join(this.outputDir, reportFilename);
    fs.writeFileSync(reportFilepath, JSON.stringify(report, null, 2));

    console.log(`📋 Analytics report saved to ${reportFilename}`);
    return report;
  }
}

// Main execution
async function main() {
  require("dotenv").config({ path: "../../.env.local" });

  const exporter = new AnalyticsDataExporter();
  await exporter.exportAllAnalytics();
  await exporter.generateAnalyticsReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AnalyticsDataExporter;
