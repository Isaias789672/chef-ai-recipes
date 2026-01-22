import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Recipe } from "@/components/ui/RecipeCard";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recipe?: Recipe;
}

interface ChatAIProps {
  onAddToMenu: (recipe: Recipe) => void;
}

export function ChatAI({ onAddToMenu }: ChatAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou o Chef AI, seu assistente culinário pessoal. Me peça qualquer receita e vou criar algo especial para você! Por exemplo:\n\n• \"Quero uma receita de bolo de chocolate fit\"\n• \"Preciso de um jantar rápido para 4 pessoas\"\n• \"Algo vegano e proteico para o almoço\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-recipe", {
        body: { message: userMessage.content },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "Aqui está sua receita!",
        recipe: data.recipe,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a receita. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chat Chef AI</h1>
            <p className="text-muted-foreground text-sm">
              Peça qualquer receita!
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[85%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                  : "space-y-4"
              }`}
            >
              {message.role === "assistant" ? (
                <>
                  <div className="bg-card rounded-2xl rounded-tl-md px-4 py-3 shadow-card">
                    <p className="text-foreground whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.recipe && (
                    <RecipeCard
                      recipe={message.recipe}
                      onAddToMenu={() => onAddToMenu(message.recipe!)}
                    />
                  )}
                </>
              ) : (
                <p>{message.content}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card rounded-2xl rounded-tl-md px-4 py-3 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando sua receita...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Peça uma receita..."
          className="flex-1 px-5 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
