import { useState } from "react";
import { 
  Refrigerator, 
  UtensilsCrossed, 
  CalendarDays, 
  ShoppingCart,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FridgeScanner } from "@/components/tabs/FridgeScanner";
import { DiscoverDish } from "@/components/tabs/DiscoverDish";
import { WeeklyMenu } from "@/components/tabs/WeeklyMenu";
import { ShoppingList } from "@/components/tabs/ShoppingList";
import { Recipe } from "@/components/ui/RecipeCard";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "scanner", label: "Scanner", icon: Refrigerator },
  { id: "discover", label: "Descobrir", icon: UtensilsCrossed },
  { id: "shopping", label: "Compras", icon: ShoppingCart },
] as const;

type TabId = typeof tabs[number]["id"];

// Sample recipes for demo
const sampleRecipes: Recipe[] = [
  {
    id: "1",
    name: "Salmão Grelhado",
    time: "30 min",
    difficulty: "Médio",
    servings: 2,
    calories: 550,
    protein: 35,
    carbs: 40,
    fats: 28,
    ingredients: ["Salmão", "Limão", "Ervas", "Azeite", "Sal"],
    steps: ["Tempere o salmão", "Grelhe por 8 min cada lado", "Sirva com limão"]
  },
  {
    id: "2",
    name: "Panquecas com Frutas",
    time: "25 min",
    difficulty: "Fácil",
    servings: 4,
    calories: 420,
    protein: 12,
    carbs: 65,
    fats: 14,
    ingredients: ["Farinha", "Ovos", "Leite", "Frutas", "Mel"],
    steps: ["Prepare a massa", "Cozinhe as panquecas", "Decore com frutas"]
  },
  {
    id: "3",
    name: "Bowl de Açaí",
    time: "10 min",
    difficulty: "Fácil",
    servings: 1,
    calories: 380,
    protein: 6,
    carbs: 55,
    fats: 12,
    ingredients: ["Açaí", "Banana", "Granola", "Mel", "Frutas"],
    steps: ["Bata o açaí", "Decore com toppings", "Sirva gelado"]
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(sampleRecipes);

  const handleAddToMenu = (recipe: Recipe) => {
    if (!savedRecipes.find(r => r.id === recipe.id)) {
      setSavedRecipes(prev => [...prev, recipe]);
    }
  };

  const handleRemoveRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <WeeklyMenu recipes={savedRecipes} onRemoveRecipe={handleRemoveRecipe} />;
      case "scanner":
        return <FridgeScanner onAddToMenu={handleAddToMenu} />;
      case "discover":
        return <DiscoverDish onAddToMenu={handleAddToMenu} />;
      case "shopping":
        return <ShoppingList recipes={savedRecipes} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-4 py-2 pb-safe">
        <div className="max-w-lg mx-auto flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "text-chef-dark")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
