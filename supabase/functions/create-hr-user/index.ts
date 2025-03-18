
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const { email, name, password } = await req.json();

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Email and name are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating new user account for: ${email}`);

    // Generate a password if not provided
    const userPassword = password || Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(2, 8) + "!A9";

    // Create the new user with admin client
    const { data: userData, error: createUserError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: userPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: { full_name: name }
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      
      // Check if error is because user already exists
      if (createUserError.message.includes("already exists")) {
        return new Response(
          JSON.stringify({ 
            message: "User already exists", 
            password: null, 
            user: null, 
            error: createUserError.message 
          }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw createUserError;
    }

    console.log("User created successfully:", userData.user?.id);

    // Return success response with user data and generated password
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        password: userPassword,
        user: userData.user,
        error: null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
