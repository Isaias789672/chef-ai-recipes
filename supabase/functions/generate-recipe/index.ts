import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  ingredients: string[];
  filters: {
    diet: string | null;
    time: string | null;
    goal: string | null;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, filters } = (await req.json()) as GenerateRequest;

    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Ingredients are required" }),
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

    // Build filter instructions
    let filterInstructions = "";
    if (filters.diet) {
      const dietMap: { [key: string]: string } = {
        keto: "cetogênica (baixo carboidrato, alta gordura)",
        vegano: "vegana (sem ingredientes de origem animal)",
        vegetariano: "vegetariana (sem carne)",
        lowcarb: "low carb (baixo carboidrato)",
        normal: "equilibrada",
      };
      filterInstructions += `\n- Dieta: ${dietMap[filters.diet] || filters.diet}`;
    }
    if (filters.time) {
      const timeMap: { [key: string]: string } = {
        "15": "até 15 minutos",
        "30": "até 30 minutos",
        "60": "até 1 hora",
        any: "qualquer tempo",
      };
      filterInstructions += `\n- Tempo de preparo: ${timeMap[filters.time] || filters.time}`;
    }
    if (filters.goal) {
      const goalMap: { [key: string]: string } = {
        massa: "ganho de massa muscular (alto em proteínas)",
        perda: "perda de peso (baixo em calorias)",
        equilibrio: "alimentação equilibrada",
        energia: "aumento de energia (carboidratos complexos)",
      };
      filterInstructions += `\n- Objetivo: ${goalMap[filters.goal] || filters.goal}`;
    }

    const systemPrompt = `Você é um chef especialista em criar receitas personalizadas.
Com base nos ingredientes fornecidos, crie uma receita deliciosa que atenda aos filtros especificados.

Ingredientes disponíveis: ${ingredients.join(", ")}
${filterInstructions ? `\nFiltros aplicados:${filterInstructions}` : ""}

Regras importantes:
- Use APENAS os ingredientes listados (pode adicionar temperos básicos como sal, pimenta, azeite)
- Respeite rigorosamente os filtros de dieta se especificados
- Adapte a receita ao objetivo nutricional se especificado
- Respeite o tempo máximo de preparo se especificado

Responda SEMPRE em JSON válido com este formato exato:
{
  "recipe": {
    "name": "Nome criativo da Receita",
    "time": "XX min",
    "difficulty": "Fácil" | "Médio" | "Difícil",
    "servings": número,
    "calories": número estimado por porção,
    "ingredients": ["quantidade ingrediente 1", "quantidade ingrediente 2", ...],
    "steps": ["Passo 1 detalhado", "Passo 2 detalhado", ...]
  }
}`;

    console.log(`Generating recipe with ${ingredients.length} ingredients`);

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
          { role: "user", content: `Crie uma receita usando estes ingredientes: ${ingredients.join(", ")}` }
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
        JSON.stringify({ error: "Erro ao gerar receita" }),
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
      return new Response(
        JSON.stringify({ error: "Erro ao processar receita" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add ID to recipe
    if (result.recipe) {
      result.recipe.id = crypto.randomUUID();
    }

    console.log("Recipe generated:", result.recipe?.name);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-recipe:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
