import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy, Send, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WebhookLog {
  id: string;
  email: string;
  evento: string;
  produto: string | null;
  plano_aplicado: string | null;
  created_at: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [evento, setEvento] = useState("");
  const [produto, setProduto] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const webhookUrl = `https://zujoihliuwbjcfszbcbd.supabase.co/functions/v1/kiwify-webhook`;

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSimulateWebhook = async () => {
    if (!email || !evento) {
      toast.error("Preencha o email e selecione um evento");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          evento,
          produto,
          token: "hicptshjzqo",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Webhook simulado com sucesso! Plano aplicado: ${result.data?.plano_aplicado}`);
        fetchLogs();
        setEmail("");
        setEvento("");
        setProduto("");
      } else {
        toast.error(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Error simulating webhook:", error);
      toast.error("Erro ao simular webhook");
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copiada para a área de transferência!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">Gerenciamento de Webhooks Kiwify</p>
          </div>
        </div>

        {/* Webhook URL Card */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">URL do Webhook</CardTitle>
            <CardDescription>
              Copie esta URL e cadastre na Kiwify para receber eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm bg-white"
              />
              <Button
                onClick={copyWebhookUrl}
                variant="outline"
                className="shrink-0 border-green-300 hover:bg-green-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Token de segurança:</span>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-green-700">hicptshjzqo</code>
            </div>
          </CardContent>
        </Card>

        {/* Simulator Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Simulador de Webhooks
            </CardTitle>
            <CardDescription>
              Teste a integração simulando eventos da Kiwify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Cliente</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Evento</Label>
                <Select value={evento} onValueChange={setEvento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assinatura aprovada">
                      Compra Aprovada
                    </SelectItem>
                    <SelectItem value="assinatura renovada">
                      Assinatura Renovada
                    </SelectItem>
                    <SelectItem value="assinatura cancelada">
                      Assinatura Cancelada
                    </SelectItem>
                    <SelectItem value="assinatura atrasada">
                      Assinatura Atrasada
                    </SelectItem>
                    <SelectItem value="pix gerado">
                      Pix Gerado
                    </SelectItem>
                    <SelectItem value="reembolso">
                      Reembolso
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={produto} onValueChange={setProduto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plano Normal">Plano Normal</SelectItem>
                    <SelectItem value="Plano Master">Plano Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleSimulateWebhook}
              disabled={loading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Simular Webhook
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Logs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimos Eventos Processados</CardTitle>
              <CardDescription>
                Histórico dos 10 últimos webhooks recebidos
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loadingLogs}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loadingLogs ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Plano Aplicado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLogs ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum evento registrado ainda
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>{log.email}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.evento.toLowerCase().includes("aprovada") ||
                              log.evento.toLowerCase().includes("renovada")
                                ? "bg-green-100 text-green-800"
                                : log.evento.toLowerCase().includes("cancelada")
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {log.evento}
                          </span>
                        </TableCell>
                        <TableCell>{log.plano_aplicado || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
