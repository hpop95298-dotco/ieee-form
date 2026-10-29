/**
 * Supabase Cloud Configuration for IEEE IU SB
 */

const SUPABASE_CONFIG = {
  // Official Supabase Project URL
  url: window.SUPABASE_URL || 'https://gznjwpskaztsfrxpzqbc.supabase.co',

  // Official Supabase public publishable key
  anonKey: window.SUPABASE_ANON_KEY || 'sb_publishable_CP_4zK--7D_z_uG86ZeGKA_YbA0zoc9',

  // Table name in Supabase
  tableName: 'registrations'
};

// Check if credentials have been populated
function isSupabaseConfigured() {
  return (
    typeof supabase !== 'undefined' &&
    SUPABASE_CONFIG.url &&
    !SUPABASE_CONFIG.url.includes('YOUR_PROJECT_ID') &&
    SUPABASE_CONFIG.anonKey
  );
}

// Initialize Supabase Client instance safely
let supabaseClient = null;
if (typeof supabase !== 'undefined' && isSupabaseConfigured()) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('[Supabase] Cloud database connected successfully:', SUPABASE_CONFIG.url);
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err);
  }
}
