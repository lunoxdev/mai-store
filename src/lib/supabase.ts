import { createClient } from "@/utils/supabase/client";

// The Supabase client is created once and exported to be used throughout the app.

export const supabase = createClient();
