#!/usr/bin/env node

/**
 * DATA AUDITOR TOOL
 * =================
 *
 * PURPOSE:
 * This tool validates data integrity and quality before migration. It ensures that
 * your source data (CSV or JSON) meets the requirements for the Zeno KB application
 * and identifies potential issues that could cause problems during migration.
 *
 * HOW IT WORKS:
 * 1. Loads data from CSV or JSON files
 * 2. Validates data structure and required fields
 * 3. Checks for duplicates and data consistency
 * 4. Validates URL formats and identifies problematic links
 * 5. Analyzes content quality (length, placeholders, etc.)
 * 6. Generates comprehensive audit reports with recommendations
 *
 * WHAT IT CHECKS:
 * - Required fields: title, description, url, type
 * - Optional fields: tier, complexity, tags, featured, function
 * - Data types and format validation
 * - Duplicate IDs and titles
 * - URL format validation
 * - Content quality issues (too short/long, placeholders)
 * - Data consistency across records
 *
 * OUTPUT:
 * - Console report with summary and issues
 * - Detailed JSON report saved to audit-report.json
 * - Exit code 0 for success, 1 for failure
 *
 * USAGE:
 * node dataAuditor.js <path-to-data-file>
 *
 * EXAMPLES:
 * node dataAuditor.js ../config/data.json
 * node dataAuditor.js ../data/zeno_kb_assets.csv
 */

const fs = require("fs");
const path = require("path");

class DataAuditor {
  constructor() {
    // Arrays to store validation results
    this.errors = []; // Critical issues that must be fixed
    this.warnings = []; // Non-critical issues that should be reviewed

    // Statistics tracking for the audit
    this.stats = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      missingFields: {}, // Count of missing optional fields
      duplicates: [], // List of duplicate identifiers
    };

    // Load and parse schema.json once for the instance
    const schemaPath = path.resolve(__dirname, "../data/schema.json");
    this.schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  }

  // Main audit function - orchestrates the entire validation process
  async auditData(filePath) {
    console.log("🔍 Starting Data Audit...\n");

    try {
      // Load and parse the data file
      const data = this.loadData(filePath);

      // Load and parse schema.json
      // const schemaPath = path.resolve(__dirname, "../data/schema.json");
      // const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

      // Helper: Get schema field by name
      // function getSchemaField(name) {
      //   return schema.fields.find((f) => f.name === name);
      // }

      // Run all validation checks
      this.validateStructure(data); // Check overall data structure
      this.checkRequiredFields(data); // Verify required fields are present
      this.validateDataTypes(data); // Check data types and formats
      this.checkDuplicates(data); // Find duplicate records
      this.validateUrls(data); // Validate URL formats
      this.checkContentQuality(data); // Analyze content quality

      // Generate and display the final report
      this.generateReport();

      // Return true if no critical errors found
      return this.errors.length === 0;
    } catch (error) {
      this.addError("CRITICAL", `Failed to audit data: ${error.message}`);
      this.generateReport();
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

  // Simple CSV parser that handles quoted values and converts to JSON structure
  parseCSV(content) {
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = this.parseCSVLine(lines[0]);
    const tools = [];

    // Build a mapping from schema field name to CSV column index
    const fieldToIndex = {};
    this.schema.fields.forEach((field) => {
      const source = field.source || field.name;
      const idx = headers.findIndex(
        (h) => h.trim().toLowerCase() === source.trim().toLowerCase()
      );
      if (idx !== -1) fieldToIndex[field.name] = idx;
    });

    // Parse each data row
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const tool = {};
      this.schema.fields.forEach((field) => {
        const idx = fieldToIndex[field.name];
        let value = idx !== undefined ? values[idx] : undefined;
        if (typeof value === "string")
          value = value.replace(/^"|"$/g, "").replace(/\r/g, "").trim();
        // Handle array fields
        if (field.type === "array" && value) {
          value = value
            .split(field.delimiter)
            .map((v) => v.trim())
            .filter(Boolean);
        }
        tool[field.name] = value || "";
      });
      // Generate ID if missing and required
      const idField = this.schema.fields.find((f) => f.name === "id");
      if (idField && idField.generated && (!tool.id || tool.id.trim() === "")) {
        tool.id = `tool_${i}`;
      }
      tools.push(tool);
    }
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

  // Validate the overall structure of the data object
  validateStructure(data) {
    if (!data || typeof data !== "object") {
      this.addError("CRITICAL", "Data must be an object");
      return;
    }

    if (!Array.isArray(data.tools)) {
      this.addError("CRITICAL", 'Data must contain a "tools" array');
      return;
    }

    this.stats.totalRecords = data.tools.length;
    console.log(`📊 Found ${this.stats.totalRecords} tools to audit`);
  }

  // Helper: Get schema field by name
  getSchemaField(name) {
    return this.schema.fields.find((f) => f.name === name);
  }

  // Update checkRequiredFields to use this.schema
  checkRequiredFields(data) {
    data.tools.forEach((tool, index) => {
      const missing = [];
      this.schema.fields.forEach((field) => {
        // Map source field if needed
        let value = tool[field.name];
        if (field.type === "array" && typeof value === "string") {
          value = value
            .split(field.delimiter)
            .map((v) => v.trim())
            .filter(Boolean);
          tool[field.name] = value;
        }
        if (
          field.required &&
          (!value || (Array.isArray(value) && value.length === 0))
        ) {
          missing.push(field.name);
        }
        // Generate ID if required and missing
        if (
          field.generated &&
          (!tool[field.name] || tool[field.name].trim() === "")
        ) {
          tool[field.name] = `tool_${index + 1}`;
        }
      });
      if (missing.length > 0) {
        this.addError(
          "ERROR",
          `Tool ${index + 1} (${
            tool.title || "Unknown"
          }) missing required fields: ${missing.join(", ")}`
        );
        this.stats.invalidRecords++;
      } else {
        this.stats.validRecords++;
      }
    });
  }

  // Update validateDataTypes to use this.schema
  validateDataTypes(data) {
    data.tools.forEach((tool, index) => {
      this.schema.fields.forEach((field) => {
        const value = tool[field.name];
        if (field.type === "array" && value && !Array.isArray(value)) {
          tool[field.name] = value
            .split(field.delimiter)
            .map((v) => v.trim())
            .filter(Boolean);
        }
        if (field.type === "string" && value && typeof value !== "string") {
          this.addWarning(
            `Tool ${index + 1}: Field ${
              field.name
            } should be string, got: ${typeof value}`
          );
        }
      });
      // Existing URL and boolean checks
      if (tool.url && !this.isValidUrl(tool.url)) {
        this.addWarning(`Tool ${index + 1}: Invalid URL format - ${tool.url}`);
      }
    });
  }

  // Find duplicate records that could cause conflicts
  checkDuplicates(data) {
    const seen = new Set();
    const duplicateIds = [];
    const duplicateTitles = [];

    data.tools.forEach((tool, index) => {
      // Check for duplicate IDs (critical issue)
      if (seen.has(tool.id)) {
        duplicateIds.push(tool.id);
      }
      seen.add(tool.id);

      // Check for duplicate titles (warning - might be intentional)
      const titleLower = tool.title?.toLowerCase();
      if (titleLower) {
        const existing = data.tools.find(
          (t, i) => i !== index && t.title?.toLowerCase() === titleLower
        );
        if (existing && !duplicateTitles.includes(titleLower)) {
          duplicateTitles.push(titleLower);
        }
      }
    });

    // Report findings
    if (duplicateIds.length > 0) {
      this.addError("ERROR", `Duplicate IDs found: ${duplicateIds.join(", ")}`);
    }

    if (duplicateTitles.length > 0) {
      this.addWarning(`Duplicate titles found: ${duplicateTitles.join(", ")}`);
    }

    this.stats.duplicates = [...duplicateIds, ...duplicateTitles];
  }

  // Validate URL formats and check for common issues
  validateUrls(data) {
    // Expected URL patterns for different types of tools
    const urlPatterns = {
      chatgpt: /^https:\/\/chatgpt\.com\/g\//, // ChatGPT custom GPTs
      sharepoint: /sharepoint\.com/, // SharePoint documents
      generic: /^https?:\/\/.+/, // Any valid HTTP/HTTPS URL
    };

    data.tools.forEach((tool, index) => {
      if (!tool.url) return;

      const url = tool.url.trim();
      let validPattern = false;

      // Check if URL matches any expected pattern
      for (const [type, pattern] of Object.entries(urlPatterns)) {
        if (pattern.test(url)) {
          validPattern = true;
          break;
        }
      }

      if (!validPattern) {
        this.addWarning(
          `Tool ${index + 1}: URL doesn't match expected patterns - ${url}`
        );
      }

      // Check for common URL formatting issues
      if (url.includes(" ")) {
        this.addError(
          "ERROR",
          `Tool ${index + 1}: URL contains spaces - ${url}`
        );
      }

      if (url.length > 2000) {
        this.addWarning(
          `Tool ${index + 1}: URL is very long (${url.length} chars)`
        );
      }
    });
  }

  // Analyze content quality and identify potential issues
  checkContentQuality(data) {
    data.tools.forEach((tool, index) => {
      // Check title length for UI compatibility
      if (tool.title && tool.title.length > 100) {
        this.addWarning(
          `Tool ${index + 1}: Title is very long (${tool.title.length} chars)`
        );
      }

      // Check description length and quality
      if (tool.description) {
        if (tool.description.length < 20) {
          this.addWarning(
            `Tool ${index + 1}: Description is very short (${
              tool.description.length
            } chars)`
          );
        }
        if (tool.description.length > 500) {
          this.addWarning(
            `Tool ${index + 1}: Description is very long (${
              tool.description.length
            } chars)`
          );
        }
      }

      // Check for placeholder content that should be replaced
      const placeholders = [
        "lorem ipsum",
        "placeholder",
        "todo",
        "tbd",
        "coming soon",
      ];
      const content = `${tool.title} ${tool.description}`.toLowerCase();

      placeholders.forEach((placeholder) => {
        if (content.includes(placeholder)) {
          this.addWarning(
            `Tool ${index + 1}: Contains placeholder content: "${placeholder}"`
          );
        }
      });
    });
  }

  // Utility function to validate URL format
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Add an error or warning to the appropriate collection
  addError(level, message) {
    const error = { level, message, timestamp: new Date().toISOString() };
    if (level === "ERROR" || level === "CRITICAL") {
      this.errors.push(error);
    } else {
      this.warnings.push(error);
    }
  }

  // Convenience method for adding warnings
  addWarning(message) {
    this.addError("WARNING", message);
  }

  // Generate and display comprehensive audit report
  generateReport() {
    console.log("\n📋 DATA AUDIT REPORT");
    console.log("=".repeat(50));

    // Summary statistics
    console.log("\n📊 SUMMARY:");
    console.log(`Total Records: ${this.stats.totalRecords}`);
    console.log(`Valid Records: ${this.stats.validRecords}`);
    console.log(`Invalid Records: ${this.stats.invalidRecords}`);
    console.log(
      `Success Rate: ${(
        (this.stats.validRecords / this.stats.totalRecords) *
        100
      ).toFixed(1)}%`
    );

    // Report on missing optional fields
    console.log("\n⚠️  MISSING OPTIONAL FIELDS:");
    Object.entries(this.stats.missingFields).forEach(([field, count]) => {
      console.log(
        `  ${field}: ${count} records (${(
          (count / this.stats.totalRecords) *
          100
        ).toFixed(1)}%)`
      );
    });

    // Display critical errors that must be fixed
    if (this.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      this.errors.forEach((error) => {
        console.log(`  [${error.level}] ${error.message}`);
      });
    }

    // Display warnings that should be reviewed
    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.warnings.slice(0, 10).forEach((warning) => {
        console.log(`  ${warning.message}`);
      });

      if (this.warnings.length > 10) {
        console.log(`  ... and ${this.warnings.length - 10} more warnings`);
      }
    }

    // Final audit status
    console.log("\n" + "=".repeat(50));
    if (this.errors.length === 0) {
      console.log("✅ AUDIT PASSED - Data is ready for migration");
    } else {
      console.log("❌ AUDIT FAILED - Please fix errors before migration");
    }
    console.log("=".repeat(50));

    // Save detailed report for further analysis
    this.saveDetailedReport();
  }

  // Save comprehensive audit results to JSON file
  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      errors: this.errors,
      warnings: this.warnings,
    };

    const reportPath = path.join(__dirname, "audit-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Command-line interface when run directly
if (require.main === module) {
  const auditor = new DataAuditor();
  const filePath = process.argv[2];

  if (!filePath) {
    console.log("Usage: node dataAuditor.js <path-to-data-file>");
    console.log("Example: node dataAuditor.js ../config/data.json");
    console.log("Example: node dataAuditor.js ../data/zeno_kb_assets.csv");
    process.exit(1);
  }

  auditor
    .auditData(filePath)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Audit failed:", error);
      process.exit(1);
    });
}

module.exports = DataAuditor;
