import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Delivery {
  id: string;
  codigo_obra: string;
  cliente: string;
  endereco: string;
  responsavel_recebimento: string;
  telefone: string;
}

interface OptimizeRouteRequest {
  origin: string;
  deliveries: Delivery[];
  startTime?: string; // HH:mm format
  timePerDelivery?: number; // minutes
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { origin, deliveries, startTime = "08:00", timePerDelivery = 30 }: OptimizeRouteRequest = await req.json();

    if (!deliveries || deliveries.length === 0) {
      return new Response(
        JSON.stringify({ error: "No deliveries provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for the AI
    const deliveriesInfo = deliveries.map((d, i) => 
      `${i + 1}. Código: ${d.codigo_obra} | Cliente: ${d.cliente} | Endereço: ${d.endereco}`
    ).join("\n");

    const systemPrompt = `Você é um assistente especializado em otimização de rotas logísticas para entrega de materiais em Ribeirão Preto, SP, Brasil.

IMPORTANTE: Você deve usar seu conhecimento geográfico de Ribeirão Preto para estimar distâncias e tempos de deslocamento de forma realista.

Considere:
- Trânsito típico da cidade
- Localização dos bairros (Centro, Jardim América, Sumarezinho, Alto da Boa Vista, Campos Elíseos, etc.)
- Vias principais e acessos
- Distâncias médias entre regiões

Retorne APENAS um JSON válido, sem texto adicional.`;

    const userPrompt = `Otimize a rota de entregas a seguir:

ORIGEM (Ponto de Partida):
${origin}

ENTREGAS DO DIA:
${deliveriesInfo}

PARÂMETROS:
- Horário de saída: ${startTime}
- Tempo médio por entrega: ${timePerDelivery} minutos (descarga, conferência, vistoria)

OBJETIVO:
1. Minimizar distância total percorrida
2. Minimizar tempo em trânsito
3. Evitar voltar para regiões já visitadas
4. Agrupar entregas próximas geograficamente

RETORNE EXATAMENTE este formato JSON (sem markdown, sem texto extra):
{
  "rota_otimizada": [
    {
      "ordem": 1,
      "id": "[id da entrega]",
      "codigo_obra": "[codigo]",
      "cliente": "[nome]",
      "endereco": "[endereco]",
      "distancia_anterior_km": 0.0,
      "tempo_deslocamento_min": 0,
      "horario_chegada": "08:00",
      "horario_saida": "08:30"
    }
  ],
  "metricas": {
    "distancia_total_km": 0.0,
    "tempo_transito_min": 0,
    "tempo_entregas_min": 0,
    "tempo_total_min": 0,
    "horario_conclusao": "00:00"
  },
  "justificativa": "[Breve explicação da lógica de otimização]"
}`;

    console.log("Calling Lovable AI for route optimization...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione mais créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response:", content);

    // Parse the JSON response from AI
    // Clean up any markdown formatting if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    }
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    let optimizedRoute;
    try {
      optimizedRoute = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate the response structure
    if (!optimizedRoute.rota_otimizada || !Array.isArray(optimizedRoute.rota_otimizada)) {
      throw new Error("Invalid response structure from AI");
    }

    // Ensure all delivery IDs are properly mapped
    const deliveryMap = new Map(deliveries.map(d => [d.codigo_obra, d]));
    optimizedRoute.rota_otimizada = optimizedRoute.rota_otimizada.map((item: any, index: number) => {
      const originalDelivery = deliveryMap.get(item.codigo_obra);
      return {
        ...item,
        ordem: index + 1,
        id: originalDelivery?.id || item.id,
        responsavel_recebimento: originalDelivery?.responsavel_recebimento,
        telefone: originalDelivery?.telefone,
      };
    });

    return new Response(
      JSON.stringify(optimizedRoute),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in optimize-route:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao otimizar rota" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
