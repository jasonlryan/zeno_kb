require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUser(email) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'zeno2025',
    email_confirm: true,
  });
  if (error) {
    console.error(`Error creating ${email}:`, error.message);
  } else {
    console.log(`Created user: ${email}`);
  }
}

async function main() {
  await createUser('testuser1@example.com');
  await createUser('testuser2@example.com');
  await createUser('testuser3@example.com');
}

main(); 