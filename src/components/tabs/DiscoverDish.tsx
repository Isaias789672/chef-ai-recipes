import { useState } from "react";
import { ArrowLeft, Hand } from "lucide-react";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { LoadingState } from "@/components/ui/LoadingState";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";
import { HandsFreeMode } from "@/components/ui/HandsFreeMode";
import { ChefModifierButton } from "@/components/ui/ChefModifierButton";
import { ChefModifierModal } from "@/components/ui/ChefModifierModal";
import { analyzeImage } from "@/lib/api/analyzeImage";
import { useToast } from "@/hooks/use-toast";

interface DiscoverDishProps {
  onAddToMenu: (recipe: Recipe) => void;
}

type LoadingStep = { id: string; text: string; status: "pending" | "active" | "completed" };

const LOADING_STEPS: LoadingStep[] = [
  { id: "1", text: "Enviando imagem...", status: "pending" },
  { id: "2", text: "Identificando prato com IA...", status: "pending" },
  { id: "3", text: "Analisando ingredientes...", status: "pending" },
  { id: "4", text: "Gerando receita completa...", status: "pending" },
];

export function DiscoverDish({ onAddToMenu }: DiscoverDishProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [discoveredRecipe, setDiscoveredRecipe] = useState<Recipe | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dishName, setDishName] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState(LOADING_STEPS);
  const [progress, setProgress] = useState(0);
  const [showHandsFree, setShowHandsFree] = useState(false);
  const [showChefModifier, setShowChefModifier] = useState(false);
  const { toast } = useToast();

  const updateStep = (stepIndex: number, status: "active" | "completed") => {
    setLoadingSteps(prev => prev.map((step, idx) => ({
      ...step,
      status: idx < stepIndex ? "completed" : idx === stepIndex ? status : "pending"
    })));
    setProgress(((stepIndex + (status === "completed" ? 1 : 0.5)) / LOADING_STEPS.length) * 100);
  };

  const handleImageSelect = async (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setDiscoveredRecipe(null);
    setDishName(null);
    setLoadingSteps(LOADING_STEPS.map(s => ({ ...s, status: "pending" as const })));
    setProgress(0);

    // Step 1: Uploading
    updateStep(0, "active");
    await new Promise(resolve => setTimeout(resolve, 500));
    updateStep(0, "completed");

    // Step 2: Identifying dish
    updateStep(1, "active");

    const result = await analyzeImage(file, "dish");

    if (result.error) {
      toast({
        title: "Erro na análise",
        description: result.error,
        variant: "destructive",
      });
      setIsAnalyzing(false);
      setUploadedImage(null);
      return;
    }

    updateStep(1, "completed");

    // Step 3: Analyzing
    updateStep(2, "active");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateStep(2, "completed");

    // Step 4: Generating recipe
    updateStep(3, "active");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateStep(3, "completed");

    if (result.recipe) {
      setDiscoveredRecipe(result.recipe);
      setDishName(result.dishName || result.recipe.name);
    }

    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setDiscoveredRecipe(null);
    setUploadedImage(null);
    setDishName(null);
    setLoadingSteps(LOADING_STEPS.map(s => ({ ...s, status: "pending" as const })));
    setProgress(0);
  };

  const handleModifyRecipe = (recipe: Recipe) => {
    setShowChefModifier(true);
  };

  const handleRecipeModified = (newRecipe: Recipe) => {
    setDiscoveredRecipe(newRecipe);
    setDishName(newRecipe.name);
  };

  return (
    <div className="page-enter">
      {/* Chef Modifier Modal */}
      {showChefModifier && discoveredRecipe && (
        <ChefModifierModal
          recipe={discoveredRecipe}
          onClose={() => setShowChefModifier(false)}
          onRecipeModified={handleRecipeModified}
        />
      )}

      {/* Hands-Free Mode */}
      {showHandsFree && discoveredRecipe && (
        <HandsFreeMode
          recipe={discoveredRecipe}
          onClose={() => setShowHandsFree(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Descobrir Prato</h1>
        <p className="text-muted-foreground mt-1">
          Fotografe um prato e descubra como prepará-lo
        </p>
      </div>

      {!discoveredRecipe && !isAnalyzing && (
        <ImageDropzone 
          onImageSelect={handleImageSelect}
          title="Fotografe um prato"
          subtitle="A IA vai identificar e criar a receita"
        />
      )}

      {isAnalyzing && (
        <div className="space-y-6 fade-in">
          {uploadedImage && (
            <div className="relative rounded-3xl overflow-hidden aspect-video">
              <img 
                src={uploadedImage} 
                alt="Prato" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-foreground">
                  🔍 Identificando prato...
                </span>
              </div>
            </div>
          )}
          <LoadingState steps={loadingSteps} progress={progress} />
        </div>
      )}

      {discoveredRecipe && !isAnalyzing && (
        <div className="space-y-6 fade-in">
          {/* Back Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Descobrir outro</span>
          </button>

          {/* Uploaded Image with dish name */}
          {uploadedImage && (
            <div className="rounded-3xl overflow-hidden aspect-video relative">
              <img 
                src={uploadedImage} 
                alt="Prato identificado" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white/80 text-xs mb-1">Prato identificado:</p>
                <p className="text-white text-xl font-bold">{dishName}</p>
              </div>
            </div>
          )}

          {/* Recipe Card */}
          <RecipeCard 
            recipe={discoveredRecipe}
            onAddToMenu={() => onAddToMenu(discoveredRecipe)}
          />

          {/* Hands-Free Button */}
          <button
            onClick={() => setShowHandsFree(true)}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Hand className="w-5 h-5" />
            Iniciar Cozinha (Mãos Livres)
          </button>

          {/* Chef Modifier Button */}
          <ChefModifierButton
            recipe={discoveredRecipe}
            onModify={handleModifyRecipe}
          />
        </div>
      )}
    </div>
  );
}
