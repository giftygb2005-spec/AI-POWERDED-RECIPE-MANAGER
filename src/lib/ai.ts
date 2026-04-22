import { supabase } from "@/integrations/supabase/client";

const AI_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recipe`;

export interface AIRecipe {
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: { ingredient_name: string; quantity: number; unit: string }[];
  instructions: { text: string }[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  categories: string[];
}

export interface AIMealPlan {
  plan: { day: string; breakfast: string; lunch: string; dinner: string; snack: string }[];
  shopping_list: string[];
  total_estimated_calories_per_day: number;
  tips: string;
}

export interface AINutritionAnalysis {
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamins: string[];
  health_score: number;
  health_notes: string;
  suggestions: string[];
}

export interface AISubstitution {
  original: string;
  substitutes: { name: string; ratio: string; notes: string; dietary: string[] }[];
  tips: string;
}

async function callAI(action: string, prompt: string) {
  const response = await fetch(AI_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action, prompt }),
  });

  if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
  if (response.status === 402) throw new Error("AI credits exhausted. Please add funds to continue.");
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "AI service error");
  }

  const data = await response.json();
  return data.result;
}

export async function generateRecipe(prompt: string): Promise<AIRecipe> {
  return callAI("generate_recipe", prompt);
}

export async function generateMealPlan(prompt: string): Promise<AIMealPlan> {
  return callAI("meal_plan", prompt);
}

export async function analyzeNutrition(prompt: string): Promise<AINutritionAnalysis> {
  return callAI("nutrition_analysis", prompt);
}

export async function suggestSubstitutions(prompt: string): Promise<AISubstitution> {
  return callAI("substitution", prompt);
}

export async function smartScaleRecipe(prompt: string) {
  return callAI("smart_scale", prompt);
}

type Msg = { role: "user" | "assistant"; content: string };

export async function streamCookingAssistant({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(AI_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action: "cooking_assistant", messages }),
  });

  if (resp.status === 429) throw new Error("Rate limit exceeded. Please wait a moment.");
  if (resp.status === 402) throw new Error("AI credits exhausted. Please add funds.");
  if (!resp.ok || !resp.body) throw new Error("Failed to start AI stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
