import { useState } from "react";
import { ArrowLeft, Hand, Sparkles } from "lucide-react";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { LoadingState } from "@/components/ui/LoadingState";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";
import { IngredientChecklist } from "@/components/ui/IngredientChecklist";
import { PremiumFilters, PremiumFiltersState } from "@/components/ui/PremiumFilters";
import { HandsFreeMode } from "@/components/ui/HandsFreeMode";
import { ChefModifierButton } from "@/components/ui/ChefModifierButton";
import { ChefModifierModal } from "@/components/ui/ChefModifierModal";
import { analyzeImage } from "@/lib/api/analyzeImage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FridgeScannerProps {
  onAddToMenu: (recipe: Recipe) => void;
}

type ScannerStep = "upload" | "checklist" | "loading" | "result";
type LoadingStep = { id: string; text: string; status: "pending" | "active" | "completed" };

const LOADING_STEPS: LoadingStep[] = [
  { id: "1", text: "Enviando imagem para análise...", status: "pending" },
  { id: "2", text: "Identificando ingredientes com IA...", status: "pending" },
  { id: "3", text: "Buscando combinações ideais...", status: "pending" },
  { id: "4", text: "Gerando receita personalizada...", status: "pending" },
];

export function FridgeScanner({ onAddToMenu }: FridgeScannerProps) {
  const [step, setStep] = useState<ScannerStep>("upload");
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(LOADING_STEPS);
  const [progress, setProgress] = useState(0);
  const [showHandsFree, setShowHandsFree] = useState(false);
  const [showChefModifier, setShowChefModifier] = useState(false);
  const [filters, setFilters] = useState<PremiumFiltersState>({
    diet: null,
    time: null,
    goal: null,
  });
  const { toast } = useToast();

  const updateStep = (stepIndex: number, status: "active" | "completed") => {
    setLoadingSteps(prev => prev.map((s, idx) => ({
      ...s,
      status: idx < stepIndex ? "completed" : idx === stepIndex ? status : "pending"
    })));
    setProgress(((stepIndex + (status === "completed" ? 1 : 0.5)) / LOADING_STEPS.length) * 100);
  };

  const handleImageSelect = async (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
    setLoadingSteps(LOADING_STEPS.map(s => ({ ...s, status: "pending" as const })));
    setProgress(0);
    setStep("loading");
    
    // Step 1: Uploading
    updateStep(0, "active");
    await new Promise(resolve => setTimeout(resolve, 500));
    updateStep(0, "completed");
    
    // Step 2: Identifying
    updateStep(1, "active");
    
    // Call AI API for ingredient detection
    const result = await analyzeImage(file, "fridge");
    
    if (result.error) {
      toast({
        title: "Erro na análise",
        description: result.error,
        variant: "destructive",
      });
      setStep("upload");
      setUploadedImage(null);
      return;
    }
    
    updateStep(1, "completed");
    
    // Show checklist for ingredient confirmation
    if (result.ingredients && result.ingredients.length > 0) {
      setDetectedIngredients(result.ingredients);
      setStep("checklist");
    } else if (result.recipe) {
      // Fallback: no ingredients detected but recipe generated
      setGeneratedRecipe(result.recipe);
      setDetectedIngredients(result.recipe.ingredients);
      updateStep(2, "completed");
      updateStep(3, "completed");
      setStep("result");
    }
  };

  const handleConfirmIngredients = async (selectedIngredients: string[]) => {
    setDetectedIngredients(selectedIngredients);
    setStep("loading");
    
    updateStep(2, "active");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateStep(2, "completed");
    
    updateStep(3, "active");
    
    // Generate recipe with filters
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: {
          ingredients: selectedIngredients,
          filters,
        },
      });

      if (error) throw error;

      if (data?.recipe) {
        setGeneratedRecipe(data.recipe);
      }
    } catch (err) {
      console.error("Recipe generation error:", err);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a receita",
        variant: "destructive",
      });
    }
    
    updateStep(3, "completed");
    setStep("result");
  };

  const handleReset = () => {
    setStep("upload");
    setGeneratedRecipe(null);
    setUploadedImage(null);
    setDetectedIngredients([]);
    setLoadingSteps(LOADING_STEPS.map(s => ({ ...s, status: "pending" as const })));
    setProgress(0);
  };

  const handleModifyRecipe = (recipe: Recipe) => {
    setShowChefModifier(true);
  };

  const handleRecipeModified = (newRecipe: Recipe) => {
    setGeneratedRecipe(newRecipe);
  };

  return (
    <div className="page-enter">
      {/* Chef Modifier Modal */}
      {showChefModifier && generatedRecipe && (
        <ChefModifierModal
          recipe={generatedRecipe}
          onClose={() => setShowChefModifier(false)}
          onRecipeModified={handleRecipeModified}
        />
      )}

      {/* Hands-Free Mode */}
      {showHandsFree && generatedRecipe && (
        <HandsFreeMode
          recipe={generatedRecipe}
          onClose={() => setShowHandsFree(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Scanner de Geladeira</h1>
          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold">
            Premium
          </span>
        </div>
        <p className="text-muted-foreground">
          Fotografe seus ingredientes e a IA criará uma receita personalizada
        </p>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="space-y-4">
          <PremiumFilters filters={filters} onChange={setFilters} />
          <ImageDropzone 
            onImageSelect={handleImageSelect}
            title="Fotografe seus ingredientes"
            subtitle="A IA vai analisar e criar uma receita"
          />
        </div>
      )}

      {/* Loading Step */}
      {step === "loading" && (
        <div className="space-y-6 fade-in">
          {uploadedImage && (
            <div className="relative rounded-3xl overflow-hidden aspect-video">
              <img 
                src={uploadedImage} 
                alt="Ingredientes" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-foreground">
                  🤖 Analisando com IA...
                </span>
              </div>
            </div>
          )}
          <LoadingState steps={loadingSteps} progress={progress} />
        </div>
      )}

      {/* Checklist Step */}
      {step === "checklist" && (
        <div className="space-y-4 fade-in">
          {uploadedImage && (
            <div className="relative rounded-3xl overflow-hidden aspect-video">
              <img 
                src={uploadedImage} 
                alt="Ingredientes" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <PremiumFilters filters={filters} onChange={setFilters} />
          <IngredientChecklist
            ingredients={detectedIngredients}
            onConfirm={handleConfirmIngredients}
            onCancel={handleReset}
          />
        </div>
      )}

      {/* Result Step */}
      {step === "result" && generatedRecipe && (
        <div className="space-y-6 fade-in">
          {/* Back Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Nova análise</span>
          </button>

          {/* Uploaded Image */}
          {uploadedImage && (
            <div className="rounded-3xl overflow-hidden aspect-video relative">
              <img 
                src={uploadedImage} 
                alt="Ingredientes" 
                className="w-full h-full object-cover"
              />
              {detectedIngredients.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white/80 text-xs mb-2">Ingredientes utilizados:</p>
                  <div className="flex flex-wrap gap-2">
                    {detectedIngredients.slice(0, 6).map((ing, i) => (
                      <span key={i} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                        {ing}
                      </span>
                    ))}
                    {detectedIngredients.length > 6 && (
                      <span className="px-2 py-1 bg-primary/80 rounded-full text-white text-xs">
                        +{detectedIngredients.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recipe Card */}
          <RecipeCard 
            recipe={generatedRecipe}
            onAddToMenu={() => onAddToMenu(generatedRecipe)}
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
            recipe={generatedRecipe}
            onModify={handleModifyRecipe}
          />
        </div>
      )}
    </div>
  );
}
