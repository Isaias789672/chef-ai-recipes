import { useState } from "react";
import { CalendarDays, Plus, Flame } from "lucide-react";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";
import { CircularProgress } from "@/components/ui/CircularProgress";

interface WeeklyMenuProps {
  recipes: Recipe[];
  onRemoveRecipe: (id: string) => void;
}

const DAYS = [
  { short: "Dom", num: 10 },
  { short: "Seg", num: 11 },
  { short: "Ter", num: 12 },
  { short: "Qua", num: 13 },
  { short: "Qui", num: 14 },
  { short: "Sex", num: 15 },
  { short: "Sáb", num: 16 },
];

export function WeeklyMenu({ recipes, onRemoveRecipe }: WeeklyMenuProps) {
  const [selectedDay, setSelectedDay] = useState(3); // Wednesday

  // Mock data for demonstration
  const menuByDay: { [key: number]: Recipe[] } = {
    0: recipes.slice(0, 1),
    1: recipes.slice(0, 2),
    2: recipes.slice(1, 2),
    3: recipes.slice(0, 3),
    4: [],
    5: recipes.slice(0, 1),
    6: recipes.slice(1, 3),
  };

  const dayRecipes = menuByDay[selectedDay] || [];
  
  // Calculate daily totals
  const dailyCalories = dayRecipes.reduce((sum, r) => sum + (r.calories || 0), 0);
  const dailyProtein = dayRecipes.reduce((sum, r) => sum + (r.protein || 0), 0);
  const dailyCarbs = dayRecipes.reduce((sum, r) => sum + (r.carbs || 0), 0);
  const dailyFats = dayRecipes.reduce((sum, r) => sum + (r.fats || 0), 0);

  const calorieGoal = 2500;
  const proteinGoal = 150;
  const carbsGoal = 275;
  const fatsGoal = 70;

  return (
    <div className="slide-up space-y-4">
      {/* Header card */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        {/* Logo and streak */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="font-bold text-foreground">Chef AI</span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-medium">15</span>
          </div>
        </div>

        {/* Day selector */}
        <div className="flex justify-between mb-6">
          {DAYS.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className="flex flex-col items-center gap-1"
            >
              <span className={`text-xs ${selectedDay === i ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {day.short}
              </span>
              <div className={`day-circle ${
                selectedDay === i 
                  ? 'day-circle-active' 
                  : i < selectedDay 
                    ? 'border-2 border-success text-success' 
                    : 'day-circle-inactive border-2 border-muted'
              }`}>
                {day.num}
              </div>
            </button>
          ))}
        </div>

        {/* Calories progress */}
        <div className="bg-muted rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-foreground">
              {dailyCalories}<span className="text-lg text-muted-foreground font-normal">/{calorieGoal}</span>
            </p>
            <p className="text-sm text-muted-foreground">Calorias consumidas</p>
          </div>
          <CircularProgress 
            value={dailyCalories} 
            max={calorieGoal} 
            size={72} 
            strokeWidth={6}
          >
            <Flame className="w-5 h-5 text-foreground" />
          </CircularProgress>
        </div>

        {/* Macro progress */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {dailyProtein}<span className="text-xs text-muted-foreground font-normal">/{proteinGoal}g</span>
            </p>
            <p className="text-xs text-muted-foreground mb-2">Proteína</p>
            <CircularProgress 
              value={dailyProtein} 
              max={proteinGoal} 
              size={48} 
              strokeWidth={4}
              color="hsl(var(--protein))"
            >
              <span className="text-xs">🥩</span>
            </CircularProgress>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {dailyCarbs}<span className="text-xs text-muted-foreground font-normal">/{carbsGoal}g</span>
            </p>
            <p className="text-xs text-muted-foreground mb-2">Carbos</p>
            <CircularProgress 
              value={dailyCarbs} 
              max={carbsGoal} 
              size={48} 
              strokeWidth={4}
              color="hsl(var(--carbs))"
            >
              <span className="text-xs">🌾</span>
            </CircularProgress>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {dailyFats}<span className="text-xs text-muted-foreground font-normal">/{fatsGoal}g</span>
            </p>
            <p className="text-xs text-muted-foreground mb-2">Gorduras</p>
            <CircularProgress 
              value={dailyFats} 
              max={fatsGoal} 
              size={48} 
              strokeWidth={4}
              color="hsl(var(--fats))"
            >
              <span className="text-xs">💧</span>
            </CircularProgress>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          <div className="w-2 h-2 rounded-full bg-chef-dark" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>
      </div>

      {/* Recently uploaded / Day recipes */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Refeições do dia</h3>
        
        {dayRecipes.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Nenhuma refeição planejada</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-chef-dark text-white text-sm font-medium shadow-button">
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                compact
                onDelete={() => onRemoveRecipe(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-chef-dark text-white shadow-button flex items-center justify-center hover:scale-105 transition-transform">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
