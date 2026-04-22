import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import AddRecipe from "./pages/AddRecipe";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import AIRecipeGenerator from "./pages/AIRecipeGenerator";
import AICookingAssistant from "./pages/AICookingAssistant";
import AIMealPlanner from "./pages/AIMealPlanner";
import AINutritionAnalyzer from "./pages/AINutritionAnalyzer";
import AISubstitutions from "./pages/AISubstitutions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes */}
                <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
                <Route path="/recipes/new" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />
                <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/ai/generate" element={<ProtectedRoute><AIRecipeGenerator /></ProtectedRoute>} />
                <Route path="/ai/assistant" element={<ProtectedRoute><AICookingAssistant /></ProtectedRoute>} />
                <Route path="/ai/meal-plan" element={<ProtectedRoute><AIMealPlanner /></ProtectedRoute>} />
                <Route path="/ai/nutrition" element={<ProtectedRoute><AINutritionAnalyzer /></ProtectedRoute>} />
                <Route path="/ai/substitutions" element={<ProtectedRoute><AISubstitutions /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
