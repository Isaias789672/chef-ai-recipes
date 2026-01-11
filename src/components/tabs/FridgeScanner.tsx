import { useState } from "react";
import { Refrigerator } from "lucide-react";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { LoadingState } from "@/components/ui/LoadingState";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";

interface FridgeScannerProps {
  onAddToMenu: (recipe: Recipe) => void;
}

interface DetectedIngredient {
  name: string;
  position: { top: string; left: string };
}

export function FridgeScanner({ onAddToMenu }: FridgeScannerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setGeneratedRecipe(null);
    
    // Simulating AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockIngredients: DetectedIngredient[] = [
      { name: "Alface", position: { top: "25%", left: "15%" } },
      { name: "Parmesão", position: { top: "35%", left: "75%" } },
      { name: "Tomate Cereja", position: { top: "65%", left: "20%" } },
      { name: "Croutons", position: { top: "60%", left: "70%" } },
    ];
    setDetectedIngredients(mockIngredients);
    
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
      ingredients: ["Alface", "Parmesão", "Tomate Cereja", "Croutons", "Molho Caesar"],
      steps: [
        "Lave e seque bem a alface, rasgando em pedaços.",
        "Corte os tomates cereja ao meio.",
        "Monte a salada com alface, tomates e croutons.",
        "Regue com molho Caesar e finalize com parmesão ralado."
      ]
    };
    
    setGeneratedRecipe(mockRecipe);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setGeneratedRecipe(null);
    setDetectedIngredients([]);
    setUploadedImage(null);
  };

  return (
    <div className="slide-up">
      {!generatedRecipe && !isAnalyzing && (
        <ImageDropzone onImageSelect={handleImageSelect} />
      )}

      {isAnalyzing && (
        <LoadingState 
          message="Identificando ingredientes..."
          submessage="Analisando sua foto com IA"
        />
      )}

      {generatedRecipe && !isAnalyzing && (
        <div className="space-y-4 fade-in">
          {/* Detected image with floating labels */}
          {uploadedImage && (
            <div className="relative rounded-[2rem] overflow-hidden bg-chef-dark">
              <img 
                src={uploadedImage} 
                alt="Ingredientes" 
                className="w-full aspect-[3/4] object-cover"
              />
              
              {/* Header overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white"
                >
                  ×
                </button>
                <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-2">
                  <span className="text-sm">🍳</span>
                  <span className="font-semibold text-chef-dark text-sm">Chef AI</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white">
                  ?
                </button>
              </div>

              {/* Floating ingredient labels */}
              {detectedIngredients.map((ingredient, i) => (
                <div
                  key={i}
                  className="floating-label"
                  style={{ 
                    top: ingredient.position.top, 
                    left: ingredient.position.left,
                    animationDelay: `${i * 0.15}s`
                  }}
                >
                  {ingredient.name}
                </div>
              ))}
            </div>
          )}

          {/* Recipe result */}
          <RecipeCard 
            recipe={generatedRecipe}
            onAddToMenu={() => onAddToMenu(generatedRecipe)}
          />

          {/* Steps */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h4 className="font-semibold text-foreground mb-4">Ingredientes</h4>
            <div className="space-y-2 mb-6">
              {generatedRecipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{ing}</span>
                  <span className="text-xs text-muted-foreground">+ Adicionar</span>
                </div>
              ))}
            </div>

            <h4 className="font-semibold text-foreground mb-4">Modo de Preparo</h4>
            <ol className="space-y-3">
              {generatedRecipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-chef-dark text-white text-sm font-medium flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Escanear novamente
          </button>
        </div>
      )}
    </div>
  );
}
