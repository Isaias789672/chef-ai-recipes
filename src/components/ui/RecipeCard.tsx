import { Clock, ChefHat, Users, Trash2, Plus, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  time: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  servings: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  ingredients: string[];
  steps: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  onDelete?: () => void;
  onAddToMenu?: () => void;
  compact?: boolean;
  className?: string;
}

export function RecipeCard({ 
  recipe, 
  onClick, 
  onDelete, 
  onAddToMenu,
  compact = false,
  className 
}: RecipeCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-elevated",
        compact ? "flex items-center gap-3 p-3" : "",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      {compact ? (
        <>
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent">
                <ChefHat className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate text-sm">{recipe.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              {recipe.calories && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3 h-3" />
                  {recipe.calories} cal
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {recipe.time}
              </span>
            </div>
            {/* Nutrition micro stats */}
            {recipe.protein && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-nutrition-protein">🥩 {recipe.protein}g</span>
                <span className="text-[10px] text-nutrition-carbs">🌾 {recipe.carbs}g</span>
                <span className="text-[10px] text-nutrition-fats">💧 {recipe.fats}g</span>
              </div>
            )}
          </div>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="aspect-[4/3] overflow-hidden bg-muted relative">
            {recipe.image ? (
              <img 
                src={recipe.image} 
                alt={recipe.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent">
                <ChefHat className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2 mb-2">
              {recipe.name}
            </h3>

            {/* Calories card */}
            {recipe.calories && (
              <div className="bg-muted rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-sm">
                    <Flame className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Calorias</p>
                    <p className="text-xl font-bold text-foreground">{recipe.calories}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition stats */}
            {recipe.protein && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-nutrition-protein/10">
                  <p className="text-[10px] text-nutrition-protein flex items-center justify-center gap-1">
                    🥩 Proteína
                  </p>
                  <p className="font-semibold text-sm">{recipe.protein}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-nutrition-carbs/10">
                  <p className="text-[10px] text-nutrition-carbs flex items-center justify-center gap-1">
                    🌾 Carbos
                  </p>
                  <p className="font-semibold text-sm">{recipe.carbs}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-nutrition-fats/10">
                  <p className="text-[10px] text-nutrition-fats flex items-center justify-center gap-1">
                    💧 Gorduras
                  </p>
                  <p className="font-semibold text-sm">{recipe.fats}g</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {recipe.time}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {recipe.servings} porções
              </span>
            </div>

            {onAddToMenu && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
                >
                  + Corrigir
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToMenu(); }}
                  className="flex-1 py-2.5 rounded-xl bg-chef-dark text-white font-medium text-sm shadow-button hover:opacity-90 transition-opacity"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
