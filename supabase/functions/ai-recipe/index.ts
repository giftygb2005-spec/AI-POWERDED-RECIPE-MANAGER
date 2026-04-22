import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  generate_recipe: `You are an expert AI chef. When asked, generate a complete recipe in the following JSON format (no markdown, just valid JSON):
{
  "title": "Recipe Title",
  "description": "Brief description",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "ingredients": [{"ingredient_name": "...", "quantity": 1, "unit": "cup"}],
  "instructions": [{"text": "Step 1..."}, {"text": "Step 2..."}],
  "nutrition": {"calories": 350, "protein": 20, "carbs": 40, "fat": 15},
  "categories": ["Italian", "Vegetarian"]
}
Be creative, accurate with measurements, and provide realistic nutritional estimates.`,

  meal_plan: `You are an AI meal planning expert. Generate a weekly meal plan based on user preferences. Return valid JSON (no markdown):
{
  "plan": [
    {"day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..."},
    {"day": "Tuesday", "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..."}
  ],
  "shopping_list": ["item1", "item2"],
  "total_estimated_calories_per_day": 2000,
  "tips": "..."
}
Provide balanced, realistic meals.`,

  nutrition_analysis: `You are an AI nutritionist. Analyze the ingredients or meal described and return valid JSON (no markdown):
{
  "total_calories": 500,
  "protein_g": 25,
  "carbs_g": 60,
  "fat_g": 15,
  "fiber_g": 8,
  "sugar_g": 10,
  "sodium_mg": 400,
  "vitamins": ["Vitamin A", "Vitamin C", "Iron"],
  "health_score": 8,
  "health_notes": "This meal is well-balanced...",
  "suggestions": ["Consider adding more fiber...", "..."]
}
Be accurate and helpful.`,

  substitution: `You are an AI cooking ingredient expert. When given an ingredient, suggest substitutes. Return valid JSON (no markdown):
{
  "original": "butter",
  "substitutes": [
    {"name": "Coconut oil", "ratio": "1:1", "notes": "Works well in baking, adds slight coconut flavor", "dietary": ["vegan", "dairy-free"]},
    {"name": "Applesauce", "ratio": "1:2", "notes": "Use half the amount, reduces fat content", "dietary": ["vegan", "low-fat"]}
  ],
  "tips": "When substituting butter..."
}
Provide practical, tested substitutions.`,

  cooking_assistant: `You are a friendly, knowledgeable AI cooking assistant called "ChefAI". You help users with:
- Cooking techniques and tips
- Recipe modifications and scaling
- Food safety questions
- Kitchen equipment recommendations
- Flavor pairing suggestions
- Troubleshooting cooking problems

Be warm, encouraging, and practical. Use markdown formatting for clarity. Keep responses concise but helpful.`,

  smart_scale: `You are an AI recipe scaling expert. When given a recipe and target servings, intelligently scale the recipe. Consider that not all ingredients scale linearly (e.g., spices, salt, baking powder). Return valid JSON (no markdown):
{
  "scaled_ingredients": [{"ingredient_name": "...", "quantity": 2, "unit": "cups", "note": "optional note about scaling"}],
  "cooking_adjustments": "Increase baking time by 10 minutes for larger batch...",
  "tips": "When scaling up..."
}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[action];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For chat-style (cooking assistant), use streaming
    if (action === "cooking_assistant") {
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
            ...(messages || []),
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", status, t);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // For structured actions, use non-streaming JSON response
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
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsed = null;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-recipe error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
