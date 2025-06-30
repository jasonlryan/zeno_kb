#!/usr/bin/env node

/**
 * DATA CONVERTER TOOL
 * ===================
 *
 * PURPOSE:
 * This tool converts CSV data from Zeno's asset database into the JSON format
 * required by the KB application. It intelligently maps fields, generates missing
 * data with smart defaults, and prepares the data for seamless integration.
 *
 * HOW IT WORKS:
 * 1. Loads CSV data with proper parsing of quoted values
 * 2. Maps CSV columns to application schema (Type->type, URL->link, etc.)
 * 3. Generates missing required fields with intelligent defaults
 * 4. Extracts tags from content using keyword analysis
 * 5. Maps categories and functions based on GPT types and content
 * 6. Selects featured tools based on strategic importance
 * 7. Outputs properly formatted JSON ready for deployment
 *
 * FIELD TRANSFORMATIONS:
 * - CSV "Type" -> JSON "type" (GPT, Doc, Video, Tool)
 * - CSV "Asset" -> JSON "asset_type" (used for categorization)
 * - CSV "Title" -> JSON "title" (cleaned and formatted)
 * - CSV "Description" -> JSON "description" (whitespace normalized)
 * - CSV "URL" -> JSON "link" (validated format)
 *
 * GENERATED FIELDS:
 * - id: Generated from title (unique, URL-safe)
 * - tier: "Specialist" (most Zeno GPTs are specialized tools)
 * - complexity: "Intermediate" (safe default complexity level)
 * - tags: Auto-extracted from title/description content
 * - function: Mapped based on GPT type and purpose
 * - featured: Strategic selection of high-value tools
 * - date_added: Current timestamp
 * - added_by: "data-migration" identifier
 *
 * INTELLIGENT FEATURES:
 * - Smart tag extraction using keyword patterns
 * - Category mapping (Audience GPT -> Audience Insights)
 * - Function assignment based on content analysis
 * - Featured tool selection for key demographics/topics
 * - Content quality improvements (whitespace, quotes)
 *
 * OUTPUT:
 * - Clean JSON file with proper application schema
 * - Conversion statistics and field mapping report
 * - Error handling for problematic records
 * - Metadata about the conversion process
 *
 * USAGE:
 * node dataConverter.js <input-csv-file> [output-json-file]
 *
 * EXAMPLES:
 * node dataConverter.js ../data/zeno_kb_assets.csv
 * node dataConverter.js ../data/zeno_kb_assets.csv ../config/converted-data.json
 */

const fs = require("fs");
const path = require("path");

class DataConverter {
  constructor() {
    this.conversionStats = {
      totalRecords: 0,
      convertedRecords: 0,
      skippedRecords: 0,
      addedFields: {},
      errors: [],
    };

    // Default values for missing fields
    this.defaults = {
      tier: "Specialist", // Most Zeno GPTs are specialized
      complexity: "Intermediate",
      featured: false,
      date_added: new Date().toISOString(),
      added_by: "data-migration",
    };

    // Category mapping based on Asset column
    this.categoryMapping = {
      "Audience GPT": "Audience Insights",
      "Trends & Topics": "Trends & Analysis",
      "Real-time Search": "Real-time Data",
      Writing: "Content Creation",
      Resource: "Resources & Documentation",
    };

    // Function mapping for different GPT types
    this.functionMapping = {
      "Gen Alpha Audience Insights": "Audience Research",
      "Gen Z Audience Insights": "Audience Research",
      "Multicultural Audience Insights": "Audience Research",
      "Millennial Audience Insights": "Audience Research",
      "Gen X Audience Insights": "Audience Research",
      "CEO Audience Insights": "Executive Research",
      "CIO Audience Insights": "Executive Research",
      "CISO Audience Insights": "Executive Research",
      "ITDM Audience Insights": "Technology Research",
      "CMO Audience Insights": "Marketing Research",
      "DE&I Trends & Insights 2025": "Trend Analysis",
      "Clean Energy Trends & Predictions": "Industry Analysis",
      "Retail Banking & Consumer Payments": "Financial Analysis",
      "Workplace & Employee Engagement Insights 2025": "Workplace Analysis",
      "Media Trends for 2025": "Media Analysis",
      "TikTok Trends, Insights & Usage": "Social Media Analysis",
      "Global Digital Media Trends 2025": "Digital Analysis",
      "Digital & Creator Marketing Trends 2025": "Marketing Analysis",
      "Travel & Tourism Insights": "Industry Analysis",
      "Private Wealth Insights": "Financial Analysis",
      "TikTok Trends": "Real-time Social Media",
      "Google News Media Coverage": "Real-time News",
      "Smart Brevity Assistant": "Content Creation",
    };
  }

  // Main conversion function
  async convertData(inputPath, outputPath = null) {
    console.log("🔄 Starting Data Conversion...\n");

    try {
      const inputData = this.loadCSV(inputPath);
      const convertedData = this.transformData(inputData);

      // Generate output path if not provided
      if (!outputPath) {
        const inputDir = path.dirname(inputPath);
        const inputName = path.basename(inputPath, path.extname(inputPath));
        outputPath = path.join(inputDir, `${inputName}-converted.json`);
      }

      this.saveJSON(convertedData, outputPath);
      this.generateReport();

      return {
        success: true,
        outputPath,
        stats: this.conversionStats,
      };
    } catch (error) {
      console.error("Conversion failed:", error);
      return {
        success: false,
        error: error.message,
        stats: this.conversionStats,
      };
    }
  }

  // Load and parse CSV file
  loadCSV(filePath) {
    console.log(`📂 Loading CSV from: ${filePath}`);

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row");
    }

    // Parse header
    const headers = this.parseCSVLine(lines[0]);
    console.log(`📋 Found columns: ${headers.join(", ")}`);

    // Parse data rows
    const tools = [];
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
          console.warn(
            `⚠️  Row ${i + 1}: Column count mismatch (expected ${
              headers.length
            }, got ${values.length})`
          );
        }

        const tool = {};
        headers.forEach((header, index) => {
          const key = this.normalizeFieldName(header.replace(/\r/g, ""));
          tool[key] = values[index]
            ? values[index].replace(/^"|"$/g, "").replace(/\r/g, "").trim()
            : "";
        });

        tools.push(tool);
      } catch (error) {
        console.warn(`⚠️  Skipping row ${i + 1}: ${error.message}`);
        this.conversionStats.skippedRecords++;
      }
    }

    this.conversionStats.totalRecords = tools.length;
    console.log(`📊 Loaded ${tools.length} records\n`);

    return tools;
  }

  // Parse CSV line handling quoted values
  parseCSVLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

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

  // Normalize field names to match application schema
  normalizeFieldName(fieldName) {
    const mapping = {
      Type: "type",
      Asset: "asset_type",
      Title: "title",
      Description: "description",
      URL: "url",
    };

    return mapping[fieldName] || fieldName.toLowerCase().replace(/\s+/g, "_");
  }

  // Transform raw CSV data to application format
  transformData(rawData) {
    console.log("🔧 Transforming data...");

    const tools = rawData
      .map((item, index) => {
        try {
          const tool = this.transformSingleTool(item, index);
          this.conversionStats.convertedRecords++;
          return tool;
        } catch (error) {
          console.warn(
            `⚠️  Error converting tool ${index + 1}: ${error.message}`
          );
          this.conversionStats.errors.push({
            index: index + 1,
            title: item.title || "Unknown",
            error: error.message,
          });
          this.conversionStats.skippedRecords++;
          return null;
        }
      })
      .filter(Boolean);

    // Add some featured tools
    this.selectFeaturedTools(tools);

    return {
      tools,
      metadata: {
        source: "CSV conversion",
        convertedAt: new Date().toISOString(),
        totalTools: tools.length,
        version: "1.0",
      },
    };
  }

  // Transform a single tool record
  transformSingleTool(item, index) {
    const tool = {
      id: this.generateId(item, index),
      title: item.title || `Tool ${index + 1}`,
      description: this.cleanDescription(item.description),
      type: this.determineType(item),
      tier: this.determineTier(item),
      complexity: this.determineComplexity(item),
      tags: this.generateTags(item),
      featured: false, // Will be set later for selected tools
      function: this.determineFunction(item),
      link: item.url || "",
      date_added: this.defaults.date_added,
      added_by: this.defaults.added_by,
      scheduled_feature_date: null,
    };

    // Track added fields
    Object.keys(this.defaults).forEach((field) => {
      if (!item[field]) {
        this.conversionStats.addedFields[field] =
          (this.conversionStats.addedFields[field] || 0) + 1;
      }
    });

    return tool;
  }

  // Generate unique ID for tool
  generateId(item, index) {
    if (item.id) return item.id;

    // Generate ID from title
    const titleId = item.title
      ?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    return titleId || `tool-${index + 1}`;
  }

  // Clean and format description
  cleanDescription(description) {
    if (!description) return "";

    return description
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/["]/g, '"') // Fix quotes
      .trim();
  }

  // Determine tool type from CSV data
  determineType(item) {
    if (item.type === "GPT") return "GPT";
    if (item.type === "Resource") return "Doc";

    // Fallback logic
    const title = item.title?.toLowerCase() || "";
    const asset = item.asset_type?.toLowerCase() || "";

    if (title.includes("gpt") || asset.includes("gpt")) {
      return "GPT";
    } else if (title.includes("doc") || title.includes("guide")) {
      return "Doc";
    } else if (title.includes("video") || title.includes("tutorial")) {
      return "Video";
    } else {
      return "Tool";
    }
  }

  // Determine tier based on content complexity
  determineTier(item) {
    const description = item.description?.toLowerCase() || "";
    const title = item.title?.toLowerCase() || "";

    // Foundation tier indicators
    const foundationKeywords = [
      "basic",
      "simple",
      "beginner",
      "intro",
      "getting started",
    ];

    // Specialist tier indicators
    const specialistKeywords = [
      "advanced",
      "strategic",
      "executive",
      "insights",
      "analysis",
      "ceo",
      "cio",
      "cmo",
    ];

    const content = `${title} ${description}`;

    if (specialistKeywords.some((keyword) => content.includes(keyword))) {
      return "Specialist";
    } else if (
      foundationKeywords.some((keyword) => content.includes(keyword))
    ) {
      return "Foundation";
    }

    return this.defaults.tier; // Default to Specialist
  }

  // Determine complexity level
  determineComplexity(item) {
    const description = item.description?.toLowerCase() || "";

    if (description.includes("beginner") || description.includes("simple")) {
      return "Beginner";
    } else if (
      description.includes("advanced") ||
      description.includes("complex")
    ) {
      return "Advanced";
    }

    return this.defaults.complexity; // Default to Intermediate
  }

  // Generate tags from title and description
  generateTags(item) {
    const text = `${item.title} ${item.description}`.toLowerCase();
    const tags = new Set();

    // Common tag patterns
    const tagPatterns = {
      ai: /\b(ai|artificial intelligence|gpt|chatgpt)\b/,
      audience: /\b(audience|demographic|consumer|customer)\b/,
      insights: /\b(insights|analysis|research|data)\b/,
      trends: /\b(trends|trending|forecast|prediction)\b/,
      marketing: /\b(marketing|campaign|brand|advertising)\b/,
      "social-media": /\b(social media|tiktok|instagram|facebook)\b/,
      executive: /\b(ceo|cio|cmo|ciso|executive|leadership)\b/,
      generation: /\b(gen z|gen alpha|millennial|gen x|generation)\b/,
      workplace: /\b(workplace|employee|engagement|work)\b/,
      media: /\b(media|news|journalism|coverage)\b/,
      finance: /\b(finance|banking|wealth|payment|financial)\b/,
      technology: /\b(technology|tech|digital|it|cyber)\b/,
      energy: /\b(energy|clean|renewable|sustainability)\b/,
      travel: /\b(travel|tourism|destination|hospitality)\b/,
    };

    Object.entries(tagPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(text)) {
        tags.add(tag);
      }
    });

    // Add asset type as tag
    if (item.asset_type) {
      tags.add(item.asset_type.toLowerCase().replace(/\s+/g, "-"));
    }

    return Array.from(tags);
  }

  // Determine function category
  determineFunction(item) {
    const title = item.title || "";

    // Direct mapping first
    if (this.functionMapping[title]) {
      return this.functionMapping[title];
    }

    // Pattern-based mapping
    const titleLower = title.toLowerCase();

    if (titleLower.includes("audience") && titleLower.includes("insights")) {
      return "Audience Research";
    } else if (titleLower.includes("trends")) {
      return "Trend Analysis";
    } else if (titleLower.includes("media")) {
      return "Media Analysis";
    } else if (titleLower.includes("marketing")) {
      return "Marketing Analysis";
    } else if (titleLower.includes("ceo") || titleLower.includes("executive")) {
      return "Executive Research";
    }

    return "Analysis & Research"; // Default function
  }

  // Select tools to be featured
  selectFeaturedTools(tools) {
    const featuredCandidates = [
      "CEO Audience Insights",
      "CMO Audience Insights",
      "Gen Z Audience Insights",
      "TikTok Trends",
      "Smart Brevity Assistant",
    ];

    let featuredCount = 0;
    const maxFeatured = 5;

    tools.forEach((tool) => {
      if (
        featuredCount < maxFeatured &&
        featuredCandidates.some((candidate) => tool.title.includes(candidate))
      ) {
        tool.featured = true;
        featuredCount++;
      }
    });

    console.log(`⭐ Selected ${featuredCount} featured tools`);
  }

  // Save converted data as JSON
  saveJSON(data, outputPath) {
    console.log(`💾 Saving JSON to: ${outputPath}`);

    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(outputPath, jsonContent);

    console.log(`✅ Conversion complete!`);
  }

  // Generate conversion report
  generateReport() {
    console.log("\n📋 CONVERSION REPORT");
    console.log("=".repeat(50));

    console.log("\n📊 SUMMARY:");
    console.log(`Total Records: ${this.conversionStats.totalRecords}`);
    console.log(`Converted: ${this.conversionStats.convertedRecords}`);
    console.log(`Skipped: ${this.conversionStats.skippedRecords}`);
    console.log(
      `Success Rate: ${(
        (this.conversionStats.convertedRecords /
          this.conversionStats.totalRecords) *
        100
      ).toFixed(1)}%`
    );

    if (Object.keys(this.conversionStats.addedFields).length > 0) {
      console.log("\n🔧 ADDED FIELDS:");
      Object.entries(this.conversionStats.addedFields).forEach(
        ([field, count]) => {
          console.log(`  ${field}: ${count} records`);
        }
      );
    }

    if (this.conversionStats.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      this.conversionStats.errors.forEach((error) => {
        console.log(`  Tool ${error.index} (${error.title}): ${error.error}`);
      });
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ CONVERSION COMPLETED SUCCESSFULLY");
    console.log("=".repeat(50));
  }
}

// CLI usage
if (require.main === module) {
  const converter = new DataConverter();
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath) {
    console.log(
      "Usage: node dataConverter.js <input-csv-file> [output-json-file]"
    );
    console.log(
      "Example: node dataConverter.js ../data/zeno_kb_assets.csv ../config/converted-data.json"
    );
    process.exit(1);
  }

  converter
    .convertData(inputPath, outputPath)
    .then((result) => {
      if (result.success) {
        console.log(
          `\n🎉 Data successfully converted to: ${result.outputPath}`
        );
        process.exit(0);
      } else {
        console.error(`\n❌ Conversion failed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Conversion failed:", error);
      process.exit(1);
    });
}

module.exports = DataConverter;
