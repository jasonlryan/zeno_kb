/**
 * ZENO KB - CSV Robust Cleaner
 *
 * PURPOSE: Cleans CSV files by handling quoted multi-line fields and removing
 *          rows with missing required fields. Uses csv-parse for robust parsing.
 *
 * STATUS: DEVELOPMENT UTILITY - Used for data preparation during migration
 *
 * USAGE: node scripts/data/csvRobustCleaner.js input.csv output.csv
 *
 * INPUT: CSV file with potential formatting issues
 * OUTPUT: Cleaned CSV file with valid rows only
 *
 * DEPENDENCIES: csv-parse, csv-stringify
 */

const fs = require("fs");
const parse = require("csv-parse/sync").parse;
const stringify = require("csv-stringify/sync").stringify;

if (process.argv.length < 4) {
  console.error("Usage: node csvRobustCleaner.js <input.csv> <output.csv>");
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

const content = fs.readFileSync(inputPath, "utf8");

// Parse CSV robustly (handles quoted multi-line fields)
const records = parse(content, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
});

// Required fields for a valid row
const requiredFields = ["Title", "Description", "URL", "Business Category"];

// Filter out rows with missing required fields
const cleanedRecords = records.filter((row, idx) => {
  for (const field of requiredFields) {
    if (!row[field] || row[field].trim() === "") {
      console.warn(`Row ${idx + 2} missing required field: ${field}`);
      return false;
    }
  }
  return true;
});

// Stringify back to CSV
const output = stringify(cleanedRecords, {
  header: true,
  columns: Object.keys(records[0]),
});

fs.writeFileSync(outputPath, output, "utf8");
console.log(`✅ Cleaned CSV written to: ${outputPath}`);
