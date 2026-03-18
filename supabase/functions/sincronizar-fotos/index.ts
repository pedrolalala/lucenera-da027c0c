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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const localClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await localClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Apenas administradores podem sincronizar" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // External Supabase client
    const externalUrl = Deno.env.get("SUPA");
    const externalKey = Deno.env.get("SUPA_SERVICE_ROLE_KEY");
    if (!externalUrl || !externalKey) {
      return new Response(JSON.stringify({ error: "Secrets SUPA e SUPA_SERVICE_ROLE_KEY não configuradas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const externalClient = createClient(externalUrl, externalKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const BUCKET = "entregas-fotos";
    let totalFolders = 0;
    let totalFiles = 0;
    const errors: string[] = [];

    // Recursive list function
    async function listAndSync(prefix: string) {
      const { data: items, error: listError } = await adminClient.storage
        .from(BUCKET)
        .list(prefix, { limit: 1000 });

      if (listError) {
        const msg = `Erro ao listar ${prefix}: ${listError.message}`;
        console.error(msg);
        errors.push(msg);
        return;
      }

      if (!items || items.length === 0) return;

      for (const item of items) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

        // If it's a folder (no metadata means folder)
        if (!item.metadata || item.id === null) {
          totalFolders++;
          console.log(`📁 Processando pasta: ${fullPath}`);
          await listAndSync(fullPath);
          continue;
        }

        // It's a file - download from local
        console.log(`⬇️  Baixando: ${fullPath}`);
        const { data: fileData, error: downloadError } = await adminClient.storage
          .from(BUCKET)
          .download(fullPath);

        if (downloadError || !fileData) {
          const msg = `Erro ao baixar ${fullPath}: ${downloadError?.message}`;
          console.error(msg);
          errors.push(msg);
          continue;
        }

        // Upload to external
        console.log(`⬆️  Enviando para externo: ${fullPath}`);
        const { error: uploadError } = await externalClient.storage
          .from(BUCKET)
          .upload(fullPath, fileData, {
            contentType: item.metadata?.mimetype || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) {
          const msg = `Erro ao enviar ${fullPath}: ${uploadError.message}`;
          console.error(msg);
          errors.push(msg);
          continue;
        }

        totalFiles++;
        console.log(`✅ Copiado: ${fullPath}`);
      }
    }

    console.log("🚀 Iniciando sincronização do bucket entregas-fotos...");
    await listAndSync("");

    const summary = {
      total_pastas_processadas: totalFolders,
      total_arquivos_copiados: totalFiles,
      erros: errors.length > 0 ? errors : "Nenhum erro",
    };

    console.log("📊 Resumo:", JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("❌ Erro fatal:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
