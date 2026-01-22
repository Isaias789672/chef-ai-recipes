import { useState } from "react";
import { Salad, Clock, Target, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PremiumFiltersState {
  diet: string | null;
  time: string | null;
  goal: string | null;
}

interface PremiumFiltersProps {
  filters: PremiumFiltersState;
  onChange: (filters: PremiumFiltersState) => void;
}

const dietOptions = [
  { id: "normal", label: "Normal", icon: "🍽️" },
  { id: "keto", label: "Keto", icon: "🥑" },
  { id: "vegano", label: "Vegano", icon: "🥬" },
  { id: "vegetariano", label: "Vegetariano", icon: "🥕" },
  { id: "lowcarb", label: "Low Carb", icon: "🥩" },
];

const timeOptions = [
  { id: "15", label: "Até 15 min", icon: "⚡" },
  { id: "30", label: "Até 30 min", icon: "🕐" },
  { id: "60", label: "Até 1 hora", icon: "⏱️" },
  { id: "any", label: "Qualquer", icon: "♾️" },
];

const goalOptions = [
  { id: "massa", label: "Ganho de Massa", icon: "💪" },
  { id: "perda", label: "Perda de Peso", icon: "🔥" },
  { id: "equilibrio", label: "Equilíbrio", icon: "⚖️" },
  { id: "energia", label: "Mais Energia", icon: "⚡" },
];

export function PremiumFilters({ filters, onChange }: PremiumFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (
    type: "diet" | "time" | "goal",
    value: string
  ) => {
    onChange({
      ...filters,
      [type]: filters[type] === value ? null : value,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl border-2 border-purple-500/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Filtros Premium
              <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                PRO
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} ativo${activeFiltersCount > 1 ? "s" : ""}`
                : "Personalize sua receita"}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 fade-in">
          {/* Diet */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Salad className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Dieta</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dietOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange("diet", option.id)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    filters.diet === option.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-card border border-border text-foreground hover:border-purple-500/50"
                  )}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Tempo</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange("time", option.id)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    filters.time === option.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-card border border-border text-foreground hover:border-purple-500/50"
                  )}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Objetivo</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange("goal", option.id)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    filters.goal === option.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-card border border-border text-foreground hover:border-purple-500/50"
                  )}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
