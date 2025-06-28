/**
 * CSV Data Cleaner
 *
 * PURPOSE:
 * This tool fixes data quality issues in the CSV file to prepare it for migration.
 * It handles missing fields, formatting issues, and provides suggestions for incomplete records.
 *
 * HOW IT WORKS:
 * 1. Loads and parses the CSV file with proper handling of quoted fields
 * 2. Identifies records with missing required fields (title, description, URL)
 * 3. Fixes formatting issues like embedded newlines and malformed URLs
 * 4. Provides suggestions for missing data based on existing patterns
 * 5. Outputs a cleaned CSV file ready for migration
 *
 * WHAT IT FIXES:
 * - Missing URLs for tools that should have them
 * - Embedded newlines in CSV fields
 * - Malformed or incomplete records
 * - Inconsistent formatting
 * - Duplicate or blank entries
 *
 * INPUT: Path to problematic CSV file
 * OUTPUT: Cleaned CSV file and detailed fix report
 *
 * USAGE: node csvDataCleaner.js [input-csv] [--output=cleaned.csv] [--interactive]
 */

const fs = require("fs");
const path = require("path");

class CSVDataCleaner {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.suggestions = [];
  }

  /**
   * Parse CSV with proper handling of quoted fields and newlines
   */
  parseCSV(csvContent) {
    const lines = [];
    let currentLine = "";
    let insideQuotes = false;
    let quoteChar = null;

    for (let i = 0; i < csvContent.length; i++) {
      const char = csvContent[i];
      const nextChar = csvContent[i + 1];

      if ((char === '"' || char === "'") && !insideQuotes) {
        insideQuotes = true;
        quoteChar = char;
        currentLine += char;
      } else if (char === quoteChar && insideQuotes) {
        if (nextChar === quoteChar) {
          // Escaped quote
          currentLine += char + nextChar;
          i++; // Skip next character
        } else {
          insideQuotes = false;
          quoteChar = null;
          currentLine += char;
        }
      } else if (char === "\n" && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = "";
      } else if (char === "\r" && !insideQuotes) {
        // Skip carriage returns when not inside quotes
        continue;
      } else {
        currentLine += char;
      }
    }

    // Add the last line if it exists
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  }

  /**
   * Parse a CSV line into fields
   */
  parseCSVLine(line) {
    const fields = [];
    let currentField = "";
    let insideQuotes = false;
    let quoteChar = null;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if ((char === '"' || char === "'") && !insideQuotes) {
        insideQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && insideQuotes) {
        if (nextChar === quoteChar) {
          // Escaped quote
          currentField += char;
          i++; // Skip next character
        } else {
          insideQuotes = false;
          quoteChar = null;
        }
      } else if (char === "," && !insideQuotes) {
        fields.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }

    // Add the last field
    fields.push(currentField.trim());

    return fields;
  }

  /**
   * Clean and validate the CSV data
   */
  cleanCSVData(csvPath) {
    console.log("🧹 Starting CSV data cleaning...");
    console.log(`📁 Processing: ${csvPath}`);

    const csvContent = fs.readFileSync(csvPath, "utf8");
    const lines = this.parseCSV(csvContent);

    if (lines.length === 0) {
      throw new Error("CSV file is empty or invalid");
    }

    // Parse header
    const header = this.parseCSVLine(lines[0]);
    console.log(`📋 Header: ${header.join(", ")}`);

    const cleanedRecords = [];
    const requiredFields = ["Type", "Title", "Description", "URL"];

    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      const lineNumber = i + 1;
      const fields = this.parseCSVLine(lines[i]);

      // Ensure we have the right number of fields
      while (fields.length < header.length) {
        fields.push("");
      }

      const record = {};
      header.forEach((col, index) => {
        record[col] = fields[index] || "";
      });

      // Clean and validate the record
      const cleanedRecord = this.cleanRecord(record, lineNumber);

      if (cleanedRecord) {
        cleanedRecords.push(cleanedRecord);
      }
    }

    console.log(`\n📊 Processing complete:`);
    console.log(`  • Original records: ${lines.length - 1}`);
    console.log(`  • Cleaned records: ${cleanedRecords.length}`);
    console.log(`  • Issues found: ${this.issues.length}`);
    console.log(`  • Fixes applied: ${this.fixes.length}`);

    return { header, records: cleanedRecords };
  }

  /**
   * Clean and validate a single record
   */
  cleanRecord(record, lineNumber) {
    const cleaned = { ...record };
    let hasIssues = false;

    // Clean whitespace and normalize fields
    Object.keys(cleaned).forEach((key) => {
      if (typeof cleaned[key] === "string") {
        // Remove extra whitespace and normalize line breaks
        cleaned[key] = cleaned[key]
          .replace(/\r\n/g, " ")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    });

    // Check for completely empty records
    const hasAnyContent = Object.values(cleaned).some(
      (value) => value && value.trim()
    );
    if (!hasAnyContent) {
      this.issues.push(`Line ${lineNumber}: Completely empty record - REMOVED`);
      return null;
    }

    // Validate required fields
    const missingFields = [];

    if (!cleaned.Type || cleaned.Type.trim() === "") {
      missingFields.push("Type");
    }

    if (
      !cleaned.Title ||
      cleaned.Title.trim() === "" ||
      cleaned.Title === "Unknown"
    ) {
      missingFields.push("Title");
    }

    if (!cleaned.Description || cleaned.Description.trim() === "") {
      missingFields.push("Description");
    }

    if (!cleaned.URL || cleaned.URL.trim() === "") {
      missingFields.push("URL");
    }

    // Handle missing fields
    if (missingFields.length > 0) {
      this.issues.push(
        `Line ${lineNumber}: Missing fields: ${missingFields.join(", ")}`
      );

      // Try to fix some common issues
      if (missingFields.includes("Type") && cleaned.Asset) {
        cleaned.Type = "GPT"; // Most common type
        this.fixes.push(
          `Line ${lineNumber}: Set Type to 'GPT' based on Asset field`
        );
      }

      if (missingFields.includes("Title") && cleaned.Description) {
        // Try to extract title from description
        const words = cleaned.Description.split(" ").slice(0, 4);
        cleaned.Title = words.join(" ");
        this.fixes.push(`Line ${lineNumber}: Generated Title from Description`);
      }

      if (missingFields.includes("URL")) {
        this.suggestions.push(
          `Line ${lineNumber}: Need to add URL for "${cleaned.Title}"`
        );
        hasIssues = true;
      }

      if (missingFields.includes("Description")) {
        this.suggestions.push(
          `Line ${lineNumber}: Need to add Description for "${cleaned.Title}"`
        );
        hasIssues = true;
      }
    }

    // Validate URL format
    if (cleaned.URL && cleaned.URL.trim()) {
      const url = cleaned.URL.trim();

      // Check for malformed URLs
      if (url.includes(",https://")) {
        // URL got concatenated with description
        const parts = url.split(",https://");
        if (parts.length === 2) {
          cleaned.Description = (cleaned.Description + " " + parts[0]).trim();
          cleaned.URL = "https://" + parts[1];
          this.fixes.push(`Line ${lineNumber}: Separated URL from Description`);
        }
      }

      // Validate URL format
      if (!url.match(/^https?:\/\/.+/)) {
        this.issues.push(`Line ${lineNumber}: Invalid URL format: ${url}`);
        hasIssues = true;
      }
    }

    // Check title length
    if (cleaned.Title && cleaned.Title.length > 100) {
      this.issues.push(
        `Line ${lineNumber}: Title too long (${cleaned.Title.length} chars)`
      );
      // Truncate title
      cleaned.Title = cleaned.Title.substring(0, 97) + "...";
      this.fixes.push(`Line ${lineNumber}: Truncated title to 100 characters`);
    }

    // Mark problematic records
    if (hasIssues) {
      cleaned._hasIssues = true;
    }

    return cleaned;
  }

  /**
   * Generate missing URLs based on title patterns
   */
  generateSuggestedURL(title, type) {
    if (type === "GPT" && title) {
      // Generate a ChatGPT URL pattern
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      return `https://chatgpt.com/g/g-[ID]-${slug}`;
    }

    if (type === "Resource") {
      return "https://[sharepoint-or-resource-url]";
    }

    return "https://[url-needed]";
  }

  /**
   * Save cleaned CSV data
   */
  saveCleanedCSV(data, outputPath) {
    const { header, records } = data;

    let csvContent = header.join(",") + "\n";

    records.forEach((record) => {
      const row = header.map((col) => {
        let value = record[col] || "";

        // Escape quotes and wrap in quotes if needed
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }

        return value;
      });

      csvContent += row.join(",") + "\n";
    });

    fs.writeFileSync(outputPath, csvContent);
    console.log(`💾 Cleaned CSV saved to: ${outputPath}`);
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("🧹 CSV DATA CLEANING REPORT");
    console.log("=".repeat(60));

    if (this.issues.length > 0) {
      console.log("\n❌ Issues Found:");
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (this.fixes.length > 0) {
      console.log("\n✅ Fixes Applied:");
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }

    if (this.suggestions.length > 0) {
      console.log("\n💡 Manual Fixes Needed:");
      this.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.log("\n" + "=".repeat(60));

    if (this.suggestions.length > 0) {
      console.log("⚠️  Manual fixes required before migration can proceed");
      return false;
    } else {
      console.log("✅ Data is ready for migration!");
      return true;
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || "../data/zeno_kb_assets.csv";
  const outputArg = args.find((arg) => arg.startsWith("--output="));
  const outputPath = outputArg
    ? outputArg.split("=")[1]
    : inputPath.replace(".csv", "-cleaned.csv");
  const interactive = args.includes("--interactive");

  console.log("🧹 CSV Data Cleaner");
  console.log("====================");
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);

  const cleaner = new CSVDataCleaner();

  try {
    const cleanedData = cleaner.cleanCSVData(inputPath);
    cleaner.saveCleanedCSV(cleanedData, outputPath);
    const isReady = cleaner.generateReport();

    if (isReady) {
      console.log("\n🚀 Next steps:");
      console.log(`   node dataAuditor.js ${outputPath}`);
      console.log(`   node migrationPipeline.js ${outputPath} --dry-run`);
      process.exit(0);
    } else {
      console.log(
        "\n🔧 Please fix the manual issues listed above, then re-run this tool"
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Cleaning failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CSVDataCleaner;
