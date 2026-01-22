import { Wand2, Sparkles } from "lucide-react";
import { Recipe } from "@/components/ui/RecipeCard";

interface ChefModifierButtonProps {
  recipe: Recipe;
  onModify: (recipe: Recipe) => void;
}

export function ChefModifierButton({ recipe, onModify }: ChefModifierButtonProps) {
  return (
    <button
      onClick={() => onModify(recipe)}
      className="w-full mt-4 relative overflow-hidden group"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl animate-gradient-x" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative flex items-center justify-between px-5 py-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Chef Modificador</span>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-semibold">Premium</span>
        </div>
      </div>
    </button>
  );
}

// Add this to your global CSS or index.css
// @keyframes gradient-x {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
// .animate-gradient-x { 
//   animation: gradient-x 3s ease infinite;
//   background-size: 200% 200%;
// }
