import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePublishedRecipes = (searchTerm?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ["recipes", "published", searchTerm, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("recipes")
        .select(`
          *,
          recipe_categories(category_id, categories(name)),
          recipe_ingredients(ingredient_name),
          reviews(rating)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author names from profiles
      const authorIds = [...new Set((data || []).map((r: any) => r.author_id))];
      let profileMap: Record<string, string> = {};
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", authorIds);
        (profiles || []).forEach((p: any) => {
          profileMap[p.user_id] = p.display_name;
        });
      }

      let results = (data || []).map((r: any) => ({
        ...r,
        author_name: profileMap[r.author_id] || "AI Chef",
        categories: r.recipe_categories?.map((rc: any) => rc.categories?.name).filter(Boolean) || [],
        ingredients: r.recipe_ingredients?.map((ri: any) => ri.ingredient_name) || [],
        avg_rating: r.reviews?.length ? r.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0) / r.reviews.length : 0,
      }));

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(r =>
          r.title.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term) ||
          r.ingredients.some((i: string) => i.toLowerCase().includes(term))
        );
      }

      if (categoryId) {
        results = results.filter(r =>
          r.recipe_categories?.some((rc: any) => rc.category_id === categoryId)
        );
      }

      return results;
    },
  });
};

export const useRecipeDetail = (id: string) => {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          recipe_ingredients(*),
          recipe_categories(categories(*)),
          recipe_nutrition(*),
          reviews(*)
        `)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Fetch author profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.author_id)
        .maybeSingle();

      // Fetch reviewer names
      const reviewerIds = (data.reviews || []).map((r: any) => r.user_id);
      let reviewerMap: Record<string, string> = {};
      if (reviewerIds.length > 0) {
        const { data: reviewerProfiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", reviewerIds);
        (reviewerProfiles || []).forEach((p: any) => {
          reviewerMap[p.user_id] = p.display_name;
        });
      }

      return {
        ...data,
        profiles: profile || { display_name: "AI Chef", avatar_url: null },
        reviews: (data.reviews || []).map((r: any) => ({
          ...r,
          profiles: { display_name: reviewerMap[r.user_id] || "Anonymous" },
        })),
      };
    },
    enabled: !!id,
  });
};

export const useMyRecipes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recipes", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, recipe_categories(categories(name)), reviews(rating)")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        categories: r.recipe_categories?.map((rc: any) => rc.categories?.name).filter(Boolean) || [],
        avg_rating: r.reviews?.length ? r.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0) / r.reviews.length : 0,
      }));
    },
    enabled: !!user,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });
};

export const useFavorites = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          *,
          recipes(*, recipe_categories(categories(name)), reviews(rating))
        `)
        .eq("user_id", user!.id);
      if (error) throw error;

      const authorIds = [...new Set((data || []).map((f: any) => f.recipes?.author_id).filter(Boolean))];
      let profileMap: Record<string, string> = {};
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", authorIds);
        (profiles || []).forEach((p: any) => {
          profileMap[p.user_id] = p.display_name;
        });
      }

      return (data || []).map((f: any) => ({
        ...f,
        recipe: {
          ...f.recipes,
          author_name: profileMap[f.recipes?.author_id] || "AI Chef",
          categories: f.recipes?.recipe_categories?.map((rc: any) => rc.categories?.name).filter(Boolean) || [],
          avg_rating: f.recipes?.reviews?.length ? f.recipes.reviews.reduce((sum: number, rev: any) => sum + rev.rating, 0) / f.recipes.reviews.length : 0,
        },
      }));
    },
    enabled: !!user,
  });
};

export const useToggleFavorite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipeId, isFavorited }: { recipeId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await supabase.from("favorites").delete().eq("user_id", user!.id).eq("recipe_id", recipeId);
      } else {
        await supabase.from("favorites").insert({ user_id: user!.id, recipe_id: recipeId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipeData: {
      title: string;
      description: string;
      instructions: any[];
      prep_time: number;
      cook_time: number;
      servings: number;
      image_url: string;
      author_id: string;
      ingredients: { ingredient_name: string; quantity: number; unit: string }[];
      category_ids: string[];
      nutrition: { calories: number; protein: number; carbs: number; fat: number };
    }) => {
      const { ingredients, category_ids, nutrition, ...recipe } = recipeData;
      const { data: newRecipe, error } = await supabase.from("recipes").insert(recipe).select().single();
      if (error) throw error;

      if (ingredients.length > 0) {
        await supabase.from("recipe_ingredients").insert(
          ingredients.map(i => ({ ...i, recipe_id: newRecipe.id }))
        );
      }
      if (category_ids.length > 0) {
        await supabase.from("recipe_categories").insert(
          category_ids.map(cid => ({ recipe_id: newRecipe.id, category_id: cid }))
        );
      }
      if (nutrition.calories || nutrition.protein || nutrition.carbs || nutrition.fat) {
        await supabase.from("recipe_nutrition").insert({ ...nutrition, recipe_id: newRecipe.id });
      }

      return newRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipe_id, user_id, rating, comment }: { recipe_id: string; user_id: string; rating: number; comment: string }) => {
      const { error } = await supabase.from("reviews").upsert({ recipe_id, user_id, rating, comment }, { onConflict: "user_id,recipe_id" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", vars.recipe_id] });
    },
  });
};
