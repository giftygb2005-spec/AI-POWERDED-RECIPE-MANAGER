import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChefHat, Heart, LogOut, Plus, Shield, User, Menu, X, Sparkles, Bot, Calendar, Apple, Repeat } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <ChefHat className="h-8 w-8 text-primary" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-serif tracking-tight leading-tight">AI Powered</span>
            <span className="text-[10px] text-muted-foreground leading-tight -mt-0.5">Recipe Manager</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5">
          <Link to="/recipes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Tools
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/ai/generate")}>
                <Sparkles className="mr-2 h-4 w-4" /> Recipe Generator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/ai/assistant")}>
                <Bot className="mr-2 h-4 w-4" /> Cooking Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/ai/meal-plan")}>
                <Calendar className="mr-2 h-4 w-4" /> Meal Planner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/ai/nutrition")}>
                <Apple className="mr-2 h-4 w-4" /> Nutrition Analyzer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/ai/substitutions")}>
                <Repeat className="mr-2 h-4 w-4" /> Ingredient Substitutions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <>
              <Link to="/recipes/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Add Recipe</Link>
              <Link to="/favorites" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Favorites</Link>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <ChefHat className="mr-2 h-4 w-4" /> My Recipes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" /> Favorites
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
              <Button onClick={() => navigate("/auth?tab=signup")}>Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background p-4 space-y-3">
          <Link to="/recipes" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Browse Recipes</Link>
          <p className="text-xs font-semibold text-muted-foreground pt-2">AI Tools</p>
          <Link to="/ai/generate" className="block py-1.5 text-sm font-medium pl-2" onClick={() => setMobileOpen(false)}>🤖 Recipe Generator</Link>
          <Link to="/ai/assistant" className="block py-1.5 text-sm font-medium pl-2" onClick={() => setMobileOpen(false)}>💬 Cooking Assistant</Link>
          <Link to="/ai/meal-plan" className="block py-1.5 text-sm font-medium pl-2" onClick={() => setMobileOpen(false)}>📅 Meal Planner</Link>
          <Link to="/ai/nutrition" className="block py-1.5 text-sm font-medium pl-2" onClick={() => setMobileOpen(false)}>🍎 Nutrition Analyzer</Link>
          <Link to="/ai/substitutions" className="block py-1.5 text-sm font-medium pl-2" onClick={() => setMobileOpen(false)}>🔄 Substitutions</Link>
          {user && (
            <>
              <Link to="/recipes/new" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Add Recipe</Link>
              <Link to="/favorites" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Favorites</Link>
              <Link to="/dashboard" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>My Recipes</Link>
              {isAdmin && <Link to="/admin" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Sign In</Button>
              <Button className="flex-1" onClick={() => { navigate("/auth?tab=signup"); setMobileOpen(false); }}>Get Started</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
