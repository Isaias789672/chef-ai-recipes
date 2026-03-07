import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyzeRequest {
  image: string; // Base64 encoded image
  type: "fridge" | "dish"; // Type of analysis
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, type } = (await req.json()) as AnalyzeRequest;

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Different prompts based on analysis type
    const systemPrompt = type === "fridge" 
      ? `Você é um chef especialista em identificar ingredientes e criar receitas deliciosas.
Analise a imagem e identifique todos os ingredientes visíveis.
Depois, crie uma receita completa usando esses ingredientes.

Responda SEMPRE em JSON válido com este formato exato:
{
  "ingredients": ["ingrediente 1", "ingrediente 2", ...],
  "recipe": {
    "name": "Nome da Receita",
    "time": "XX min",
    "difficulty": "Fácil" | "Médio" | "Difícil",
    "servings": número,
    "calories": número estimado,
    "ingredients": ["quantidade ingrediente 1", "quantidade ingrediente 2", ...],
    "steps": ["Passo 1", "Passo 2", ...]
  }
}`
      : `Você é um chef especialista em identificar pratos e recriar receitas.
Analise a imagem e identifique o prato mostrado.
Forneça a receita completa para replicar esse prato.

Responda SEMPRE em JSON válido com este formato exato:
{
  "dishName": "Nome do prato identificado",
  "confidence": "alta" | "média" | "baixa",
  "recipe": {
    "name": "Nome da Receita",
    "time": "XX min",
    "difficulty": "Fácil" | "Médio" | "Difícil",
    "servings": número,
    "calories": número estimado,
    "ingredients": ["quantidade ingrediente 1", "quantidade ingrediente 2", ...],
    "steps": ["Passo 1", "Passo 2", ...]
  }
}`;

    console.log(`Analyzing image, type: ${type}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: type === "fridge" 
                  ? "Analise esta foto de ingredientes e crie uma receita saudável e deliciosa."
                  : "Identifique este prato e forneça a receita completa para prepará-lo."
              },
              {
                type: "image_url",
                image_url: {
                  url: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao analisar imagem" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Nenhuma resposta da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to parse JSON from the response
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta da IA", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis successful:", result.recipe?.name || result.dishName);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
