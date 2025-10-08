// src/supabase.js
import { createClient } from "@supabase/supabase-js";

// ✅ قيمك
export const SUPABASE_URL = "https://czqlubmumdxhovznvvlu.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6cWx1Ym11bWR4aG92em52dmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODkwNjUsImV4cCI6MjA3NTQ2NTA2NX0.l4NB_4eaaORbV8Vermv4kB3nYcSfEZdLDyccdz_ssBk";

export const SUPABASE_BUCKET = "products"; // هنعمله كمان شوية من لوحة التحكم

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // مش محتاجين جلسات Supabase Auth في المشروع ده
    persistSession: false,
    autoRefreshToken: false,
  },
});
