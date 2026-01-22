import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Recipe } from "@/components/ui/RecipeCard";
import { cn } from "@/lib/utils";

interface HandsFreeModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export function HandsFreeMode({ recipe, onClose }: HandsFreeModeProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = ingredients
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const totalSteps = recipe.steps.length;

  const speak = (text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (isPlaying && currentStep < totalSteps - 1) {
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 1500);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      if (currentStep === -1) {
        const ingredientsText = `Ingredientes: ${recipe.ingredients.join(", ")}`;
        speak(ingredientsText);
      } else if (currentStep >= 0 && currentStep < totalSteps) {
        speak(`Passo ${currentStep + 1}: ${recipe.steps[currentStep]}`);
      }
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentStep, isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(-1, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  const getCurrentContent = () => {
    if (currentStep === -1) {
      return {
        title: "Ingredientes",
        content: recipe.ingredients,
        isIngredients: true,
      };
    }
    return {
      title: `Passo ${currentStep + 1} de ${totalSteps}`,
      content: recipe.steps[currentStep],
      isIngredients: false,
    };
  };

  const { title, content, isIngredients } = getCurrentContent();

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-white/60 text-sm font-medium">Modo Mãos Livres</h1>
          <h2 className="text-white text-xl font-bold">{recipe.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-6">
        <div className="flex gap-1">
          <div
            className={cn(
              "h-1 rounded-full flex-1 transition-all",
              currentStep === -1 ? "bg-white" : "bg-white/30"
            )}
          />
          {recipe.steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 rounded-full flex-1 transition-all",
                currentStep === index
                  ? "bg-white"
                  : currentStep > index
                    ? "bg-white/60"
                    : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <span className="text-white/60 text-lg mb-4">{title}</span>

        {isIngredients ? (
          <ul className="space-y-4 max-w-md">
            {(content as string[]).map((ingredient, i) => (
              <li
                key={i}
                className="text-white text-2xl font-medium leading-relaxed"
              >
                • {ingredient}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white text-3xl lg:text-4xl font-bold leading-relaxed max-w-2xl">
            {content as string}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="p-8">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={handlePrevious}
            disabled={currentStep === -1}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-purple-900" />
            ) : (
              <Play className="w-8 h-8 text-purple-900 ml-1" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-6 h-6 text-white" />
          </button>

          <div className="w-14" /> {/* Spacer for alignment */}
        </div>

        <p className="text-white/60 text-center mt-6 text-sm">
          {isPlaying ? "🔊 Reproduzindo..." : "Toque para iniciar a narração"}
        </p>
      </div>
    </div>
  );
}
