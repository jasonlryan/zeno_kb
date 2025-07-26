/**
 * ZENO KB - Test User Creator
 *
 * PURPOSE: Creates test users in Supabase from a CSV file.
 *          Used for development and testing purposes to populate
 *          the authentication system with test accounts.
 *
 * STATUS: DEVELOPMENT UTILITY - Used for testing and development setup
 *
 * USAGE: node scripts/setup/create_test_users.js
 *
 * INPUT: CSV file with email addresses (users/users.csv)
 * OUTPUT: Test users created in Supabase Auth
 *
 * DEPENDENCIES: Supabase, csv-parse, .env.local with Supabase credentials
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const { parse } = require("csv-parse/sync");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUser(email) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: "zeno2025",
    email_confirm: true,
  });
  if (error) {
    console.error(`Error creating ${email}:`, error.message);
  } else {
    console.log(`Created user: ${email}`);
  }
}

async function main() {
  const csvPath = path.join(__dirname, "../../users/users.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    process.exit(1);
  }
  const csvContent = fs.readFileSync(csvPath, "utf8");
  const records = parse(csvContent, { columns: true });
  for (const row of records) {
    if (row.email) {
      await createUser(row.email.trim());
    }
  }
}

main();
