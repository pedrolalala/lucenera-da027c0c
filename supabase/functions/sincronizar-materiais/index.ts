import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const lovableClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const seuSupabase = createClient(
      Deno.env.get('SUPA') ?? '',
      Deno.env.get('SUPA_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Iniciando varredura recursiva no bucket materiais-separacao...")

    let totalArquivos = 0
    let totalPastas = 0
    const erros: string[] = []

    async function listarRecursivo(pasta: string) {
      const { data: items, error } = await lovableClient
        .storage
        .from('materiais-separacao')
        .list(pasta, { limit: 1000 })

      if (error) {
        console.error(`Erro ao listar pasta '${pasta}':`, error)
        erros.push(`Erro ao listar: ${pasta}`)
        return
      }

      if (!items || items.length === 0) return

      for (const item of items) {
        const fullPath = pasta ? `${pasta}/${item.name}` : item.name

        if (!item.id) {
          totalPastas++
          console.log(`📁 Entrando na pasta: ${fullPath}`)
          await listarRecursivo(fullPath)
        } else {
          console.log(`⬇️ Baixando: ${fullPath}...`)

          const { data: blob, error: downloadError } = await lovableClient
            .storage
            .from('materiais-separacao')
            .download(fullPath)

          if (downloadError) {
            console.error(`❌ Erro no download de ${fullPath}:`, downloadError)
            erros.push(`Download falhou: ${fullPath}`)
            continue
          }

          const { error: uploadError } = await seuSupabase
            .storage
            .from('materiais-separacao')
            .upload(fullPath, blob, { upsert: true })

          if (uploadError) {
            console.error(`❌ Erro no upload de ${fullPath}:`, uploadError)
            erros.push(`Upload falhou: ${fullPath}`)
          } else {
            totalArquivos++
            console.log(`✅ Copiado: ${fullPath}`)
          }
        }
      }
    }

    await listarRecursivo('')

    const resultado = {
      message: `Sincronização concluída!`,
      total_pastas_processadas: totalPastas,
      total_arquivos_copiados: totalArquivos,
      erros: erros.length > 0 ? erros : 'Nenhum erro'
    }

    console.log("📊 Resultado final:", JSON.stringify(resultado))

    return new Response(JSON.stringify(resultado), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
