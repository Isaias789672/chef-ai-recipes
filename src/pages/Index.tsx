import { useState } from "react";
import { 
  Refrigerator, 
  ChefHat, 
  Calendar, 
  ShoppingCart,
  Leaf,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FridgeScanner } from "@/components/tabs/FridgeScanner";
import { DiscoverDish } from "@/components/tabs/DiscoverDish";
import { WeeklyMenu } from "@/components/tabs/WeeklyMenu";
import { ShoppingList } from "@/components/tabs/ShoppingList";
import { ChatAI } from "@/components/tabs/ChatAI";
import { Recipe } from "@/components/ui/RecipeCard";

const tabs = [
  { id: "scanner", label: "Scanner", icon: Refrigerator },
  { id: "discover", label: "Descobrir", icon: ChefHat },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "menu", label: "Menu", icon: Calendar },
  { id: "shopping", label: "Compras", icon: ShoppingCart },
] as const;

type TabId = typeof tabs[number]["id"];

// Sample recipes for demo
const sampleRecipes: Recipe[] = [
  {
    id: "1",
    name: "Salmão Grelhado com Legumes",
    time: "30 min",
    difficulty: "Médio",
    servings: 2,
    calories: 550,
    ingredients: ["Salmão fresco", "Limão siciliano", "Ervas finas", "Azeite extra virgem", "Sal marinho"],
    steps: ["Tempere o salmão com sal, ervas e limão", "Grelhe por 8 minutos de cada lado", "Sirva com legumes salteados"]
  },
  {
    id: "2",
    name: "Panquecas Integrais",
    time: "25 min",
    difficulty: "Fácil",
    servings: 4,
    calories: 420,
    ingredients: ["Farinha integral", "Ovos caipiras", "Leite", "Frutas vermelhas", "Mel orgânico"],
    steps: ["Misture os ingredientes secos", "Adicione ovos e leite", "Cozinhe em frigideira antiaderente", "Sirva com frutas e mel"]
  },
  {
    id: "3",
    name: "Bowl de Açaí Premium",
    time: "10 min",
    difficulty: "Fácil",
    servings: 1,
    calories: 380,
    ingredients: ["Polpa de açaí", "Banana congelada", "Granola artesanal", "Mel", "Mix de frutas"],
    steps: ["Bata o açaí com banana", "Decore com granola e frutas", "Finalize com mel"]
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("scanner");
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
      case "scanner":
        return <FridgeScanner onAddToMenu={handleAddToMenu} />;
      case "discover":
        return <DiscoverDish onAddToMenu={handleAddToMenu} />;
      case "chat":
        return <ChatAI onAddToMenu={handleAddToMenu} />;
      case "menu":
        return <WeeklyMenu recipes={savedRecipes} onRemoveRecipe={handleRemoveRecipe} />;
      case "shopping":
        return <ShoppingList recipes={savedRecipes} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-button">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Chef AI</h1>
              <p className="text-xs text-muted-foreground">Receitas inteligentes</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isChat = tab.id === "chat";
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                      isActive 
                        ? isChat 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                          : "bg-primary text-primary-foreground shadow-button" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {isChat && !isActive && (
                      <span className="ml-auto px-2 py-0.5 text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold">
                        AI
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Chef AI
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        <div className="px-4 py-6 pb-28 lg:pb-8 max-w-2xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-2 py-2 pb-safe">
        <div className="max-w-md mx-auto flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isChat = tab.id === "chat";
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-200",
                  isActive 
                    ? isChat 
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                      : "bg-primary/10" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6 transition-colors",
                  isActive 
                    ? isChat 
                      ? "text-purple-500" 
                      : "text-primary" 
                    : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[10px] font-semibold transition-colors",
                  isActive 
                    ? isChat 
                      ? "text-purple-500" 
                      : "text-primary" 
                    : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
