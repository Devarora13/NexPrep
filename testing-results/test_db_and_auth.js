const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables from .env
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('FATAL: Supabase URL or Anon Key is missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing Supabase connectivity...');
  console.log('Target URL:', supabaseUrl);

  // 1. Check tables accessibility
  const tables = ['Users', 'InterviewDetails', 'PostInterview', 'CareerProfiles', 'AssessmentAttempts'];
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table [${table}]: ERROR - ${error.message} (code: ${error.code})`);
    } else {
      console.log(`Table [${table}]: OK (accessible via anon client)`);
    }
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

