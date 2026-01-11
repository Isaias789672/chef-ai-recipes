import { useState } from "react";
import { ShoppingCart, Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@/components/ui/RecipeCard";

interface ShoppingListProps {
  recipes: Recipe[];
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: string;
  fromRecipe: string;
}

export function ShoppingList({ recipes }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const allIngredients: ShoppingItem[] = [];
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        allIngredients.push({
          id: crypto.randomUUID(),
          name: ingredient.split('•')[0].trim(),
          quantity: ingredient.split('•')[1]?.trim(),
          checked: false,
          fromRecipe: recipe.name,
        });
      });
    });
    return allIngredients;
  });

  const [newItem, setNewItem] = useState("");

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newItem.trim(),
          checked: false,
          fromRecipe: "Adicionado manualmente",
        },
      ]);
      setNewItem("");
    }
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  return (
    <div className="slide-up space-y-4">
      {/* Header card */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-chef-dark flex items-center justify-center shadow-button">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Lista de Compras</h2>
              <p className="text-sm text-muted-foreground">
                {uncheckedItems.length} itens pendentes
              </p>
            </div>
          </div>
          <div className="bg-muted px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium">{items.length} total</span>
          </div>
        </div>

        {/* Add item input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addItem()}
            placeholder="Adicionar item..."
            className="flex-1 px-4 py-3 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-chef-dark text-sm"
          />
          <button
            onClick={addItem}
            className="px-4 py-3 rounded-xl bg-chef-dark text-white shadow-button hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-1">Sua lista está vazia</p>
          <p className="text-sm text-muted-foreground">
            Adicione receitas ao menu para gerar a lista
          </p>
        </div>
      ) : (
        <>
          {/* Unchecked Items */}
          {uncheckedItems.length > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-card space-y-1">
              {uncheckedItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl group hover:bg-muted transition-colors",
                    index !== uncheckedItems.length - 1 && "border-b border-border"
                  )}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-chef-dark transition-colors flex items-center justify-center flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                    {item.quantity && (
                      <p className="text-xs text-muted-foreground">{item.quantity}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                Comprados ({checkedItems.length})
              </h4>
              <div className="space-y-1">
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl group hover:bg-muted/50 transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-6 h-6 rounded-full bg-chef-dark flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </button>
                    <p className="flex-1 text-sm text-muted-foreground line-through truncate">
                      {item.name}
                    </p>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
