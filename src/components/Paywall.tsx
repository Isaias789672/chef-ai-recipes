import { useState } from "react";
import { Sparkles, Camera, Utensils, CalendarCheck, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import chefImage from "@/assets/chef-scanning.jpg";

interface PaywallProps {
  onUnlock: () => void;
}

const Paywall = ({ onUnlock }: PaywallProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "annual">("annual");

  const benefits = [
    { icon: Camera, text: "Scanner de Ingredientes Ilimitado" },
    { icon: Utensils, text: "Receitas Personalizadas por IA" },
    { icon: CalendarCheck, text: "Planejamento de Menu Semanal" },
    { icon: ShoppingBag, text: "Lista de Compras Inteligente" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="min-h-screen flex flex-col">
        {/* Hero Image Section */}
        <div className="relative h-[45vh] min-h-[300px] overflow-hidden">
          <img
            src={chefImage}
            alt="Chef fotografando ingredientes"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          
          {/* Floating card on image */}
          <div className="absolute bottom-8 left-4 right-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-white text-sm leading-relaxed">
                Um chef profissional usando IA para identificar ingredientes e criar receitas personalizadas instantaneamente.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-6 py-8 space-y-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Obtenha Acesso Pro</h1>
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
              Pro
            </span>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Pricing Plans */}
          <div className="space-y-3 pt-4">
            {/* Weekly Plan */}
            <button
              onClick={() => setSelectedPlan("weekly")}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedPlan === "weekly"
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Plano Semanal</span>
                <span className="font-bold text-foreground">R$ 26,00/semana</span>
              </div>
            </button>

            {/* Annual Plan */}
            <button
              onClick={() => setSelectedPlan("annual")}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left relative ${
                selectedPlan === "annual"
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted/50"
              }`}
            >
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                  Melhor Valor
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Plano Anual</span>
                <span className="font-bold text-foreground">R$ 3,73/semana</span>
              </div>
            </button>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onUnlock}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-button"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            CONTINUAR
          </Button>

          {/* Disclaimer */}
          <p className="text-center text-sm text-muted-foreground">
            Renovável automaticamente, cancele a qualquer momento.
          </p>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-8 pt-2 pb-4">
            <a href="#" className="text-primary text-sm font-medium hover:underline">
              Política de Privacidade
            </a>
            <a href="#" className="text-primary text-sm font-medium hover:underline">
              Termos de Utilização
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
