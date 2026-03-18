import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // 1. Configura o Supabase do Lovable (Origem)
    const lovableClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Configura o SEU Supabase (Destino)
    const seuSupabase = createClient(
      Deno.env.get('SUPA') ?? '',
      Deno.env.get('SUPA_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Iniciando varredura no bucket entregas-fotos...");

    // 3. Lista TODOS os arquivos (incluindo pastas 000, 004020, etc)
    const { data: allFiles, error: listError } = await lovableClient
      .storage
      .from('entregas-fotos')
      .list('', { recursive: true, limit: 1000 });

    if (listError) throw listError;

    let count = 0;
    for (const file of allFiles) {
      if (file.id) { // Ignora pastas vazias, foca em arquivos
        console.log(`Copiando: ${file.name}...`);

        // Download do Lovable
        const { data: blob, error: downloadError } = await lovableClient
          .storage
          .from('entregas-fotos')
          .download(file.name);

        if (downloadError) {
          console.error(`Erro no download de ${file.name}:`, downloadError);
          continue;
        }

        // Upload para o seu Supabase
        const { error: uploadError } = await seuSupabase
          .storage
          .from('entregas-fotos')
          .upload(file.name, blob, { upsert: true });

        if (uploadError) {
          console.error(`Erro no upload de ${file.name}:`, uploadError);
        } else {
          count++;
        }
      }
    }

    return new Response(JSON.stringify({ message: `Sucesso! ${count} fotos migradas.` }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
