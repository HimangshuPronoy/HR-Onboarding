// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ilvlrxpjuswmsghgdyta.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdmxyeHBqdXN3bXNnaGdkeXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzc1NTcsImV4cCI6MjA1NzcxMzU1N30._iAaI7lmZLXDNQl84Zd9emqs5WWGeNSAaz5w6r0OJU0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);