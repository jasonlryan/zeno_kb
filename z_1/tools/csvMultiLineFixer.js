// csvMultiLineFixer.js
// Usage: node csvMultiLineFixer.js input.csv output.csv
// Fixes multi-line fields in CSVs by merging rows until the correct number of columns is reached.

const fs = require("fs");
const path = require("path");

if (process.argv.length < 4) {
  console.error("Usage: node csvMultiLineFixer.js <input.csv> <output.csv>");
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

const content = fs.readFileSync(inputPath, "utf8");
const lines = content.split(/\r?\n/);

const header = lines[0];
const expectedColumns = header.split(",").length;
const fixedRows = [header];

let buffer = "";
let bufferColumns = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue; // skip empty lines

  if (buffer) {
    buffer += "\n" + line;
  } else {
    buffer = line;
  }

  bufferColumns = buffer.split(",").length;

  if (bufferColumns === expectedColumns) {
    fixedRows.push(buffer);
    buffer = "";
    bufferColumns = 0;
  }
}

// If buffer remains, warn and add as-is
if (buffer) {
  console.warn("Warning: leftover buffer at end of file. Adding as-is.");
  fixedRows.push(buffer);
}

fs.writeFileSync(outputPath, fixedRows.join("\n"), "utf8");
console.log(`✅ Fixed CSV written to: ${outputPath}`);
