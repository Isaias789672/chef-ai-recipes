import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
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

    const systemPrompt = `Você é o Chef AI, um assistente culinário especializado e amigável.
Seu objetivo é criar receitas deliciosas, saudáveis e personalizadas para o usuário.

Quando o usuário pedir uma receita:
1. Crie uma receita completa e detalhada
2. Seja criativo e sugira pratos deliciosos
3. Adapte às restrições alimentares se mencionadas
4. Forneça dicas extras de preparo quando relevante

Responda SEMPRE em JSON válido com este formato exato:
{
  "message": "Uma mensagem amigável e curta sobre a receita (máximo 2 frases)",
  "recipe": {
    "name": "Nome da Receita",
    "time": "XX min",
    "difficulty": "Fácil" | "Médio" | "Difícil",
    "servings": número,
    "calories": número estimado por porção,
    "ingredients": ["quantidade ingrediente 1", "quantidade ingrediente 2", ...],
    "steps": ["Passo 1 detalhado", "Passo 2 detalhado", ...]
  }
}

Se o usuário fizer uma pergunta que não é sobre receita, responda normalmente mas sem o campo "recipe":
{
  "message": "Sua resposta aqui"
}`;

    console.log("Chat message:", message);

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
          { role: "user", content: message }
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
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao processar mensagem" }),
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

    // Parse JSON response
    let result;
    try {
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return as plain message if not valid JSON
      return new Response(
        JSON.stringify({ message: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add ID to recipe if present
    if (result.recipe) {
      result.recipe.id = crypto.randomUUID();
    }

    console.log("Chat response:", result.message);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in chat-recipe:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
