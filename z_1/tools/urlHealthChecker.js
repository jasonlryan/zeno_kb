#!/usr/bin/env node

/**
 * URL HEALTH CHECKER TOOL
 * ========================
 *
 * PURPOSE:
 * This tool validates the accessibility and performance of all URLs in your data.
 * It ensures that links to ChatGPT, SharePoint, and other resources are working
 * properly before migration, preventing broken links in the live application.
 *
 * HOW IT WORKS:
 * 1. Extracts all URLs from the data file (CSV or JSON)
 * 2. Makes HTTP HEAD requests to check accessibility without downloading content
 * 3. Measures response times to identify slow-loading resources
 * 4. Categorizes URLs by type (ChatGPT, SharePoint, GitHub, etc.)
 * 5. Processes URLs in batches to avoid overwhelming servers
 * 6. Generates detailed health reports with recommendations
 *
 * WHAT IT CHECKS:
 * - HTTP status codes (200=healthy, 404=not found, 500=server error, etc.)
 * - Response times and identifies slow URLs (>3 seconds)
 * - Redirect chains and their destinations
 * - Server errors and client errors
 * - URL accessibility from current network location
 * - SSL certificate validity for HTTPS URLs
 *
 * URL TYPES DETECTED:
 * - ChatGPT custom GPTs (chatgpt.com/g/*)
 * - SharePoint documents and sites
 * - GitHub repositories and files
 * - YouTube videos and channels
 * - Generic web resources
 *
 * OUTPUT:
 * - Console report with real-time progress and summary
 * - Detailed JSON report saved to url-health-report.json
 * - Performance statistics and problem URL identification
 * - Exit code 0 if all URLs healthy, 1 if issues found
 *
 * USAGE:
 * node urlHealthChecker.js <path-to-data-file> [batch-size]
 *
 * EXAMPLES:
 * node urlHealthChecker.js ../config/data.json 5
 * node urlHealthChecker.js ../data/zeno_kb_assets.csv 3
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

class URLHealthChecker {
  constructor() {
    // Array to store individual URL check results
    this.results = [];

    // Overall statistics for the health check
    this.stats = {
      total: 0, // Total URLs checked
      healthy: 0, // URLs returning 200 status
      unhealthy: 0, // URLs with errors or issues
      unreachable: 0, // URLs that couldn't be contacted
      slow: 0, // URLs taking longer than threshold
    };

    // Configuration for URL checking behavior
    this.timeout = 10000; // 10 seconds timeout for requests
    this.slowThreshold = 3000; // 3 seconds considered "slow"
  }

  // Main health check function - orchestrates the entire URL validation process
  async checkHealth(filePath, options = {}) {
    console.log("🔗 Starting URL Health Check...\n");

    try {
      // Load and parse the data file
      const data = this.loadData(filePath);
      const urls = this.extractUrls(data);

      console.log(`📊 Found ${urls.length} URLs to check`);

      // Process URLs in batches to avoid overwhelming servers
      const batchSize = options.batchSize || 5;
      const batches = this.createBatches(urls, batchSize);

      // Check each batch with progress reporting
      for (let i = 0; i < batches.length; i++) {
        console.log(`\n🔄 Checking batch ${i + 1}/${batches.length}...`);
        await this.checkBatch(batches[i]);

        // Add delay between batches to be respectful to servers
        if (i < batches.length - 1) {
          await this.delay(1000);
        }
      }

      // Generate comprehensive report
      this.generateReport();

      // Return true if no unhealthy URLs found
      return this.stats.unhealthy === 0;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  // Load data from JSON or CSV files with automatic format detection
  loadData(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, "utf8");

    if (ext === ".json") {
      return JSON.parse(content);
    } else if (ext === ".csv") {
      return this.parseCSV(content);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  // Simple CSV parser that converts to JSON structure expected by the checker
  parseCSV(content) {
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = this.parseCSVLine(lines[0]);
    const tools = [];

    // Parse each data row into tool object
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const tool = {};

      // Map CSV columns to object properties
      headers.forEach((header, index) => {
        const key = header
          .replace(/\r/g, "")
          .toLowerCase()
          .replace(/\s+/g, "_");
        tool[key] = values[index]
          ? values[index].replace(/^"|"$/g, "").replace(/\r/g, "").trim()
          : "";
      });

      tools.push(tool);
    }

    // Return in expected JSON structure
    return { tools };
  }

  // Parse CSV line handling quoted values and embedded commas
  parseCSVLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    // Character-by-character parsing to handle quotes properly
    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current); // Add the last value
    return values;
  }

  // Extract all URLs from the data along with context information
  extractUrls(data) {
    const urls = [];

    data.tools.forEach((tool, index) => {
      if (tool.url && tool.url.trim()) {
        urls.push({
          url: tool.url.trim(),
          toolIndex: index,
          toolTitle: tool.title || `Tool ${index + 1}`,
          toolId: tool.id || `tool_${index}`,
        });
      }
    });

    this.stats.total = urls.length;
    return urls;
  }

  // Split URLs into batches for concurrent but controlled processing
  createBatches(urls, batchSize) {
    const batches = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }
    return batches;
  }

  // Check a batch of URLs concurrently using Promise.all
  async checkBatch(batch) {
    const promises = batch.map((urlInfo) => this.checkSingleUrl(urlInfo));
    await Promise.all(promises);
  }

  // Check a single URL and record detailed results
  async checkSingleUrl(urlInfo) {
    const startTime = Date.now();

    try {
      // Make HTTP request and measure response time
      const result = await this.makeRequest(urlInfo.url);
      const responseTime = Date.now() - startTime;

      // Determine overall status based on response
      const status = this.determineStatus(result.statusCode, responseTime);

      // Create detailed result record
      const urlResult = {
        ...urlInfo,
        status,
        statusCode: result.statusCode,
        responseTime,
        error: null,
        redirects: result.redirects || [],
        headers: this.extractImportantHeaders(result.headers),
      };

      this.results.push(urlResult);
      this.updateStats(status);

      // Log real-time progress with status icons
      const statusIcon = this.getStatusIcon(status);
      console.log(
        `  ${statusIcon} ${urlInfo.toolTitle}: ${result.statusCode} (${responseTime}ms)`
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record error details for unreachable URLs
      const urlResult = {
        ...urlInfo,
        status: "unreachable",
        statusCode: null,
        responseTime,
        error: error.message,
        redirects: [],
        headers: {},
      };

      this.results.push(urlResult);
      this.updateStats("unreachable");

      console.log(`  ❌ ${urlInfo.toolTitle}: ${error.message}`);
    }
  }

  // Make HTTP/HTTPS request using Node.js built-in modules
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === "https:";
      const client = isHttps ? https : http;

      // Configure request options
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: "HEAD", // Use HEAD to avoid downloading content
        timeout: this.timeout,
        headers: {
          "User-Agent": "Zeno-KB-Health-Checker/1.0",
        },
      };

      const req = client.request(options, (res) => {
        // Handle redirects by recording the destination
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            redirects: [res.headers.location],
          });
        } else {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            redirects: [],
          });
        }
      });

      // Handle request timeout
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      // Handle connection errors
      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    });
  }

  // Determine overall URL status based on HTTP response and performance
  determineStatus(statusCode, responseTime) {
    if (!statusCode) return "unreachable";

    if (statusCode >= 200 && statusCode < 300) {
      // Success status codes - check if slow
      return responseTime > this.slowThreshold ? "slow" : "healthy";
    } else if (statusCode >= 300 && statusCode < 400) {
      return "redirect";
    } else if (statusCode >= 400 && statusCode < 500) {
      return "client_error"; // 404 Not Found, 403 Forbidden, etc.
    } else if (statusCode >= 500) {
      return "server_error"; // 500 Internal Server Error, etc.
    }

    return "unknown";
  }

  // Extract important HTTP headers for analysis
  extractImportantHeaders(headers) {
    const important = {};
    const relevantHeaders = [
      "content-type",
      "server",
      "x-powered-by",
      "cache-control",
    ];

    relevantHeaders.forEach((header) => {
      if (headers[header]) {
        important[header] = headers[header];
      }
    });

    return important;
  }

  // Update overall statistics based on individual URL status
  updateStats(status) {
    switch (status) {
      case "healthy":
        this.stats.healthy++;
        break;
      case "slow":
        this.stats.slow++;
        this.stats.healthy++; // Slow but still working
        break;
      case "unreachable":
        this.stats.unreachable++;
        this.stats.unhealthy++;
        break;
      default:
        this.stats.unhealthy++;
    }
  }

  // Get emoji icon for different URL statuses
  getStatusIcon(status) {
    const icons = {
      healthy: "✅",
      slow: "🐌",
      redirect: "↩️",
      client_error: "❌",
      server_error: "🔥",
      unreachable: "��",
      unknown: "❓",
    };
    return icons[status] || "❓";
  }

  // Generate comprehensive health check report
  generateReport() {
    console.log("\n🔗 URL HEALTH CHECK REPORT");
    console.log("=".repeat(60));

    // Overall summary statistics
    console.log("\n📊 SUMMARY:");
    console.log(`Total URLs: ${this.stats.total}`);
    console.log(
      `Healthy: ${this.stats.healthy} (${(
        (this.stats.healthy / this.stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Unhealthy: ${this.stats.unhealthy} (${(
        (this.stats.unhealthy / this.stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`Unreachable: ${this.stats.unreachable}`);
    console.log(`Slow (>${this.slowThreshold}ms): ${this.stats.slow}`);

    // Performance analysis for accessible URLs
    const responseTimes = this.results
      .filter((r) => r.responseTime && r.status !== "unreachable")
      .map((r) => r.responseTime);

    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      console.log("\n⚡ PERFORMANCE:");
      console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`Fastest Response: ${minResponseTime}ms`);
      console.log(`Slowest Response: ${maxResponseTime}ms`);
    }

    // List problematic URLs that need attention
    const problemUrls = this.results.filter(
      (r) =>
        r.status === "unreachable" ||
        r.status === "client_error" ||
        r.status === "server_error"
    );

    if (problemUrls.length > 0) {
      console.log("\n❌ PROBLEM URLs:");
      problemUrls.forEach((result) => {
        const statusInfo = result.error || `HTTP ${result.statusCode}`;
        console.log(`  ${result.toolTitle}: ${statusInfo}`);
        console.log(`    URL: ${result.url}`);
      });
    }

    // Report redirects that might need updating
    const redirectUrls = this.results.filter((r) => r.status === "redirect");
    if (redirectUrls.length > 0) {
      console.log("\n↩️  REDIRECTS:");
      redirectUrls.forEach((result) => {
        console.log(
          `  ${result.toolTitle}: ${result.statusCode} -> ${result.redirects[0]}`
        );
      });
    }

    // Report slow URLs that might affect user experience
    const slowUrls = this.results.filter((r) => r.status === "slow");
    if (slowUrls.length > 0) {
      console.log("\n🐌 SLOW URLs (>3s):");
      slowUrls.forEach((result) => {
        console.log(`  ${result.toolTitle}: ${result.responseTime}ms`);
      });
    }

    // Analyze URL types for patterns
    this.analyzeUrlTypes();

    // Final health check status
    console.log("\n" + "=".repeat(60));
    if (this.stats.unhealthy === 0) {
      console.log("✅ ALL URLs ARE HEALTHY");
    } else {
      console.log(`❌ ${this.stats.unhealthy} URLs NEED ATTENTION`);
    }
    console.log("=".repeat(60));

    // Save detailed report for further analysis
    this.saveDetailedReport();
  }

  // Analyze and categorize URLs by type to identify patterns
  analyzeUrlTypes() {
    const types = {};

    this.results.forEach((result) => {
      const url = result.url.toLowerCase();
      let type = "other";

      // Categorize URLs by domain/service
      if (url.includes("chatgpt.com")) {
        type = "ChatGPT";
      } else if (url.includes("sharepoint.com")) {
        type = "SharePoint";
      } else if (url.includes("github.com")) {
        type = "GitHub";
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        type = "YouTube";
      }

      // Initialize type statistics if not seen before
      if (!types[type]) {
        types[type] = { total: 0, healthy: 0, unhealthy: 0 };
      }

      // Update statistics for this URL type
      types[type].total++;
      if (result.status === "healthy" || result.status === "slow") {
        types[type].healthy++;
      } else {
        types[type].unhealthy++;
      }
    });

    console.log("\n🔍 URL TYPE ANALYSIS:");
    Object.entries(types).forEach(([type, stats]) => {
      const healthRate = ((stats.healthy / stats.total) * 100).toFixed(1);
      console.log(
        `  ${type}: ${stats.healthy}/${stats.total} healthy (${healthRate}%)`
      );
    });
  }

  // Save comprehensive health check results to JSON file
  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      results: this.results,
      settings: {
        timeout: this.timeout,
        slowThreshold: this.slowThreshold,
      },
    };

    const reportPath = path.join(__dirname, "url-health-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  // Utility function to add delays between batch processing
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Command-line interface when run directly
if (require.main === module) {
  const checker = new URLHealthChecker();
  const filePath = process.argv[2];
  const batchSize = parseInt(process.argv[3]) || 5;

  if (!filePath) {
    console.log(
      "Usage: node urlHealthChecker.js <path-to-data-file> [batch-size]"
    );
    console.log("Example: node urlHealthChecker.js ../config/data.json 3");
    console.log(
      "Example: node urlHealthChecker.js ../data/zeno_kb_assets.csv 5"
    );
    process.exit(1);
  }

  checker
    .checkHealth(filePath, { batchSize })
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Health check failed:", error);
      process.exit(1);
    });
}

module.exports = URLHealthChecker;
