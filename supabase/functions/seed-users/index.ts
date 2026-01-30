import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const usersToCreate = [
      { email: "vinicius@lucenera.com.br", password: "Lucenera2026!" },
      { email: "filippo@lucenera.com.br", password: "Lucenera2026!" },
      { email: "mariane@lucenera.com.br", password: "Lucenera2026!" },
      { email: "pedro@lucenera.com.br", password: "Lucenera2026!" },
      { email: "matheus@lucenera.com.br", password: "Lucenera2026!" },
    ];

    const results = [];

    for (const user of usersToCreate) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUsers?.users?.some(u => u.email === user.email);

      if (userExists) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
      });

      if (error) {
        results.push({ email: user.email, status: "error", message: error.message });
      } else {
        results.push({ email: user.email, status: "created", userId: data.user?.id });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
