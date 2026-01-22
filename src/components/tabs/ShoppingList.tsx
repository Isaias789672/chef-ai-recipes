import { useState, useEffect } from "react";
import { ShoppingCart, Check, Plus, Trash2, Package, Camera, Loader2, Apple, Beef, Milk, Cookie, Package2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@/components/ui/RecipeCard";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListProps {
  recipes: Recipe[];
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

const CATEGORIES = [
  { id: "hortifruti", name: "Hortifrúti", icon: Apple, color: "text-green-500", keywords: ["tomate", "cebola", "alho", "batata", "cenoura", "limão", "laranja", "banana", "maçã", "alface", "brócolis", "pepino", "pimentão", "abóbora", "berinjela", "couve", "espinafre", "rúcula", "morango", "melancia", "uva", "manga", "abacaxi", "kiwi", "melão", "mamão", "maracujá"] },
  { id: "carnes", name: "Carnes", icon: Beef, color: "text-red-500", keywords: ["carne", "frango", "peixe", "salmão", "camarão", "bacon", "linguiça", "peito", "coxa", "sobrecoxa", "filé", "costela", "hambúrguer", "atum", "sardinha", "tilápia"] },
  { id: "laticinios", name: "Laticínios", icon: Milk, color: "text-blue-400", keywords: ["leite", "queijo", "manteiga", "iogurte", "creme", "requeijão", "nata", "coalhada", "ricota", "mussarela", "parmesão"] },
  { id: "mercearia", name: "Mercearia", icon: Cookie, color: "text-amber-600", keywords: ["arroz", "feijão", "macarrão", "farinha", "açúcar", "sal", "óleo", "azeite", "vinagre", "molho", "massa", "aveia", "granola", "mel", "café", "chá", "biscoito", "pão", "trigo", "milho", "ervilha", "lentilha", "grão"] },
  { id: "outros", name: "Outros", icon: Package2, color: "text-gray-500", keywords: [] },
];

function categorizeItem(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  for (const category of CATEGORIES) {
    if (category.keywords.some(keyword => lowerName.includes(keyword))) {
      return category.id;
    }
  }
  return "outros";
}

export function ShoppingList({ recipes }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const allIngredients: ShoppingItem[] = [];
    const seen = new Set<string>();
    
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const name = ingredient.split('•')[0].trim();
        if (!seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          allIngredients.push({
            id: crypto.randomUUID(),
            name,
            checked: false,
            category: categorizeItem(name),
          });
        }
      });
    });
    return allIngredients;
  });

  const [newItem, setNewItem] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  // Update items when recipes change
  useEffect(() => {
    const existingNames = new Set(items.map(i => i.name.toLowerCase()));
    const newIngredients: ShoppingItem[] = [];
    
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const name = ingredient.split('•')[0].trim();
        if (!existingNames.has(name.toLowerCase())) {
          existingNames.add(name.toLowerCase());
          newIngredients.push({
            id: crypto.randomUUID(),
            name,
            checked: false,
            category: categorizeItem(name),
          });
        }
      });
    });

    if (newIngredients.length > 0) {
      setItems(prev => [...prev, ...newIngredients]);
    }
  }, [recipes]);

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
        {
          id: crypto.randomUUID(),
          name: newItem.trim(),
          checked: false,
          category: categorizeItem(newItem.trim()),
        },
        ...prev,
      ]);
      setNewItem("");
    }
  };

  const handleCompleteRecipe = async (file: File) => {
    setIsScanning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-missing-ingredients", {
        body: {
          image: await fileToBase64(file),
          currentItems: items.filter(i => !i.checked).map(i => i.name),
        },
      });

      if (error) throw error;

      if (data?.missingItems && data.missingItems.length > 0) {
        const newItems: ShoppingItem[] = data.missingItems.map((name: string) => ({
          id: crypto.randomUUID(),
          name,
          checked: false,
          category: categorizeItem(name),
        }));
        setItems(prev => [...newItems, ...prev]);
        toast({
          title: "Itens adicionados!",
          description: `${data.missingItems.length} item(s) faltando foram adicionados à lista`,
        });
      } else {
        toast({
          title: "Tudo certo!",
          description: "Você já tem todos os ingredientes necessários",
        });
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast({
        title: "Erro",
        description: "Não foi possível analisar a imagem",
        variant: "destructive",
      });
    }

    setIsScanning(false);
    setShowScanner(false);
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  // Group items by category
  const groupedItems = CATEGORIES.map(cat => ({
    ...cat,
    items: uncheckedItems.filter(item => item.category === cat.id),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">Lista de Compras</h1>
          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold">
            Inteligente
          </span>
        </div>
        <p className="text-muted-foreground">
          Ingredientes organizados por categoria
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-card rounded-3xl p-5 shadow-card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{uncheckedItems.length}</p>
            <p className="text-sm text-muted-foreground">itens pendentes</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-success">{checkedItems.length}</p>
            <p className="text-sm text-muted-foreground">comprados</p>
          </div>
        </div>
      </div>

      {/* Complete Recipe Button */}
      {!showScanner && (
        <button
          onClick={() => setShowScanner(true)}
          className="w-full mb-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Camera className="w-5 h-5" />
          Completar Receita (Escanear faltantes)
        </button>
      )}

      {/* Scanner */}
      {showScanner && (
        <div className="mb-6">
          {isScanning ? (
            <div className="bg-card rounded-3xl p-8 shadow-card text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-foreground font-medium">Analisando sua geladeira...</p>
              <p className="text-sm text-muted-foreground">Identificando itens faltantes</p>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageDropzone
                onImageSelect={handleCompleteRecipe}
                title="Fotografe sua geladeira"
                subtitle="Vamos identificar o que falta"
              />
              <button
                onClick={() => setShowScanner(false)}
                className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Item Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          placeholder="Adicionar item..."
          className="flex-1 px-5 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <button
          onClick={addItem}
          className="px-5 py-4 rounded-2xl bg-primary text-primary-foreground shadow-button hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-card rounded-3xl p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Lista vazia</h3>
          <p className="text-sm text-muted-foreground">
            Adicione receitas ao menu para gerar sua lista
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Grouped Items by Category */}
          {groupedItems.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="bg-card rounded-3xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <CategoryIcon className={cn("w-5 h-5", category.color)} />
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {category.items.length}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 group hover:bg-accent/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors flex items-center justify-center flex-shrink-0"
                      />
                      <span className="flex-1 font-medium text-foreground">{item.name}</span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <div className="bg-card rounded-3xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-muted-foreground">
                  Comprados ({checkedItems.length})
                </h3>
              </div>
              <div className="divide-y divide-border">
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 group hover:bg-accent/50 transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-success-foreground" />
                    </button>
                    <span className="flex-1 text-muted-foreground line-through">
                      {item.name}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
