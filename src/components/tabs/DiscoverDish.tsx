import { useState } from "react";
import { UtensilsCrossed, Bookmark, Flame } from "lucide-react";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { LoadingState } from "@/components/ui/LoadingState";
import { Recipe } from "@/components/ui/RecipeCard";

interface DiscoverDishProps {
  onAddToMenu: (recipe: Recipe) => void;
}

export function DiscoverDish({ onAddToMenu }: DiscoverDishProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [discoveredRecipe, setDiscoveredRecipe] = useState<Recipe | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [servings, setServings] = useState(1);

  const handleImageSelect = async (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setDiscoveredRecipe(null);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockRecipe: Recipe = {
      id: crypto.randomUUID(),
      name: "Salada Caesar com Tomate Cereja",
      time: "25 min",
      difficulty: "Fácil",
      servings: 2,
      calories: 330,
      protein: 8,
      carbs: 20,
      fats: 18,
      ingredients: [
        "Alface romana • 20 cal",
        "Parmesão ralado • 110 cal",
        "Tomate cereja • 18 cal",
        "Croutons • 122 cal",
        "Molho Caesar • 60 cal"
      ],
      steps: [
        "Lave e seque bem a alface, rasgando em pedaços.",
        "Corte os tomates cereja ao meio.",
        "Prepare os croutons tostando pão com azeite.",
        "Monte a salada e regue com molho Caesar.",
        "Finalize com parmesão ralado generosamente."
      ]
    };
    
    setDiscoveredRecipe(mockRecipe);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setDiscoveredRecipe(null);
    setUploadedImage(null);
    setServings(1);
  };

  return (
    <div className="slide-up">
      {!discoveredRecipe && !isAnalyzing && (
        <ImageDropzone onImageSelect={handleImageSelect} />
      )}

      {isAnalyzing && (
        <LoadingState 
          message="Identificando o prato..."
          submessage="Analisando ingredientes e calorias"
        />
      )}

      {discoveredRecipe && !isAnalyzing && (
        <div className="space-y-4 fade-in">
          {/* Phone mockup with image */}
          {uploadedImage && (
            <div className="relative rounded-[2rem] overflow-hidden bg-chef-dark">
              <img 
                src={uploadedImage} 
                alt="Prato" 
                className="w-full aspect-[4/3] object-cover"
              />
              
              {/* Header */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white"
                >
                  ←
                </button>
                <span className="text-white font-medium">Nutrição</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white">
                    ↗
                  </button>
                  <button className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white">
                    •••
                  </button>
                </div>
              </div>

              {/* Bottom card overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <Bookmark className="w-4 h-4" />
                  <span>18:30</span>
                </div>
              </div>
            </div>
          )}

          {/* Recipe info card */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            {/* Title and servings */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground pr-4">
                {discoveredRecipe.name}
              </h3>
              <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                <button 
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-card transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium text-sm">{servings}</span>
                <button 
                  onClick={() => setServings(servings + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-card transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Calories card */}
            <div className="bg-muted rounded-xl p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm">
                  <Flame className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Calorias</p>
                  <p className="text-3xl font-bold text-foreground">{discoveredRecipe.calories! * servings}</p>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl border border-nutrition-protein/20 bg-nutrition-protein/5">
                <p className="text-xs text-nutrition-protein mb-1">🥩 Proteína</p>
                <p className="font-bold text-foreground">{discoveredRecipe.protein! * servings}g</p>
              </div>
              <div className="text-center p-3 rounded-xl border border-nutrition-carbs/20 bg-nutrition-carbs/5">
                <p className="text-xs text-nutrition-carbs mb-1">🌾 Carbos</p>
                <p className="font-bold text-foreground">{discoveredRecipe.carbs! * servings}g</p>
              </div>
              <div className="text-center p-3 rounded-xl border border-nutrition-fats/20 bg-nutrition-fats/5">
                <p className="text-xs text-nutrition-fats mb-1">💧 Gorduras</p>
                <p className="font-bold text-foreground">{discoveredRecipe.fats! * servings}g</p>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-chef-dark" />
              <div className="w-2 h-2 rounded-full bg-muted" />
            </div>

            {/* Ingredients */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">Ingredientes</h4>
              <button className="text-sm text-chef-accent font-medium">+ Adicionar</button>
            </div>
            
            <div className="space-y-2 mb-6">
              {discoveredRecipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-muted rounded-xl">
                  <span className="text-sm text-foreground">{ing.split('•')[0]}</span>
                  <span className="text-xs text-muted-foreground">{ing.split('•')[1] || ''}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
                + Corrigir Resultados
              </button>
              <button 
                onClick={() => onAddToMenu(discoveredRecipe)}
                className="flex-1 py-3 rounded-xl bg-chef-dark text-white font-medium text-sm shadow-button hover:opacity-90 transition-opacity"
              >
                Salvar
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Descobrir outro prato
          </button>
        </div>
      )}
    </div>
  );
}
