import { useState } from "react";
import { Sparkles, Camera, Utensils, CalendarCheck, ShoppingBag, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import chefImage from "@/assets/chef-scanning.jpg";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PaywallProps {
  onUnlock: () => void;
}

type Step = "email" | "code";

const Paywall = ({ onUnlock }: PaywallProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "annual">("annual");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const benefits = [
    { icon: Camera, text: "Scanner de Ingredientes Ilimitado" },
    { icon: Utensils, text: "Receitas Personalizadas por IA" },
    { icon: CalendarCheck, text: "Planejamento de Menu Semanal" },
    { icon: ShoppingBag, text: "Lista de Compras Inteligente" },
  ];

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-verification-code", {
        body: { email: email.toLowerCase().trim() },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Código enviado! Verifique seu email.");
      setStep("code");
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Erro ao enviar código. Verifique se seu email está correto.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-code", {
        body: { 
          email: email.toLowerCase().trim(),
          code,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.success && data?.user) {
        localStorage.setItem("chef-ai-email", data.user.email);
        localStorage.setItem("chef-ai-plan", data.user.plan);
        localStorage.setItem("chef-ai-unlocked", "true");
        toast.success(`Bem-vindo! Seu plano ${data.user.plan.toUpperCase()} está ativo.`);
        onUnlock();
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Erro ao verificar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "email") {
        handleSendCode();
      } else {
        handleVerifyCode();
      }
    }
  };

  const handleResendCode = () => {
    setCode("");
    handleSendCode();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="min-h-screen flex flex-col">
        {/* Hero Image Section */}
        <div className="relative h-[40vh] min-h-[280px] overflow-hidden">
          <img
            src={chefImage}
            alt="Chef fotografando ingredientes"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          
          <div className="absolute bottom-8 left-4 right-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-white text-sm leading-relaxed">
                Um chef profissional usando IA para identificar ingredientes e criar receitas personalizadas instantaneamente.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-6 py-6 space-y-5">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Obtenha Acesso Pro</h1>
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
              Pro
            </span>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
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
          <div className="space-y-3 pt-2">
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

          {/* Email Step */}
          {step === "email" && (
            <div className="space-y-4 pt-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Já é assinante? Insira seu email:
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>

              <Button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    ENVIAR CÓDIGO
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Code Step */}
          {step === "code" && (
            <div className="space-y-4 pt-2">
              <div className="text-center space-y-2">
                <Label className="text-foreground font-medium">
                  Digite o código enviado para:
                </Label>
                <p className="text-primary font-semibold">{email}</p>
              </div>

              <div className="flex justify-center py-4">
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                  onKeyDown={handleKeyPress}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    ACESSAR CHEFAI
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setStep("email")}
                  className="text-muted-foreground text-sm hover:underline"
                >
                  Trocar email
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-primary text-sm font-medium hover:underline disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </div>
            </div>
          )}

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
