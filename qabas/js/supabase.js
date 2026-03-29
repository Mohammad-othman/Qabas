// ========================================
// Supabase client setup
// ========================================

// Replace these values with your real Supabase project credentials
const SUPABASE_URL = "https://lbctozzvhqkllxmbeuiz.supabase.co";
const SUPABASE_ANON_KEY = "lbctozzvhqkllxmbeuiz";

// Create a reusable Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);