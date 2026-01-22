import { useState } from "react";
import { Check, X, Plus, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IngredientChecklistProps {
  ingredients: string[];
  onConfirm: (selectedIngredients: string[]) => void;
  onCancel: () => void;
}

export function IngredientChecklist({
  ingredients,
  onConfirm,
  onCancel,
}: IngredientChecklistProps) {
  const [items, setItems] = useState(
    ingredients.map((ing) => ({ name: ing, selected: true }))
  );
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems((prev) => [...prev, { name: newItem.trim(), selected: true }]);
      setNewItem("");
    }
  };

  const updateItem = (index: number, newName: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, name: newName } : item
      )
    );
    setEditingIndex(null);
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="bg-card rounded-3xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="font-bold text-lg text-foreground">
          🔍 Ingredientes Detectados
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Confirme os ingredientes antes de gerar a receita
        </p>
      </div>

      {/* Items */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              item.selected
                ? "bg-primary/10 border border-primary/30"
                : "bg-muted/50 border border-transparent"
            )}
          >
            <button
              onClick={() => toggleItem(index)}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                item.selected
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-muted-foreground/30"
              )}
            >
              {item.selected && <Check className="w-4 h-4" />}
            </button>

            {editingIndex === index ? (
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, e.target.value)}
                onBlur={() => setEditingIndex(null)}
                onKeyPress={(e) => e.key === "Enter" && setEditingIndex(null)}
                className="flex-1 bg-transparent border-b border-primary focus:outline-none text-foreground"
                autoFocus
              />
            ) : (
              <span
                className={cn(
                  "flex-1 font-medium",
                  item.selected ? "text-foreground" : "text-muted-foreground line-through"
                )}
              >
                {item.name}
              </span>
            )}

            <button
              onClick={() => setEditingIndex(index)}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => removeItem(index)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addItem()}
            placeholder="Adicionar ingrediente..."
            className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={addItem}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(items.filter((i) => i.selected).map((i) => i.name))}
          disabled={selectedCount === 0}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gerar Receita ({selectedCount})
        </button>
      </div>
    </div>
  );
}
