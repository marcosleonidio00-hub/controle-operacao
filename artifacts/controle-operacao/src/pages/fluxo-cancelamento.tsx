import { useState } from "react";
import Layout from "@/components/layout";
import { useListCancellations, useSendCancellationEmail } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  XCircle, 
  Search, 
  Mail, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Undo2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const BASE = import.meta.env.BASE_URL;

type CancellationItem = {
  id: number;
  orderNumber: string;
  supplier?: string | null;
  product?: string | null;
  passenger?: string | null;
  reason: string;
  status: string;
  createdBy: string;
  sendDate?: string | null;
  solutionDate?: string | null;
  daysPending?: number | null;
  emailSent: boolean;
  notes?: string | null;
  createdAt: string;
};

function useUpdateStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`${BASE}api/cancellations/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      return res.json();
    },
  });
}

function statusBadge(status: string) {
  if (status === "RESOLVIDO")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle className="w-3 h-3" /> Resolvido
      </span>
    );
  if (status === "EM ANDAMENTO")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Loader2 className="w-3 h-3 animate-spin" /> Em Andamento
      </span>
    );
  if (status === "DESCONSIDERADO")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <Undo2 className="w-3 h-3" /> Desconsiderado
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Clock className="w-3 h-3" /> Pendente
    </span>
  );
}

export default function FluxoCancelamento() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, refetch, isLoading } = useListCancellations({ search, page, pageSize: 20 });
  const { toast } = useToast();
  const updateStatus = useUpdateStatus();
  const emailMutation = useSendCancellationEmail();

  const handleStatus = async (id: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: "Status atualizado", description: `Cancelamento marcado como ${status}.` });
      refetch();
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
    }
  };

  const handleSendEmail = async (id: number) => {
    try {
      await emailMutation.mutateAsync({ id });
      toast({ title: "E-mail enviado", description: "Notificação enviada com sucesso." });
      refetch();
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar e-mail.", variant: "destructive" });
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este registro? Isso limpará a duplicidade.")) return;
    try {
      const res = await fetch(`${BASE}api/cancellations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast({ title: "Excluído", description: "Registro removido com sucesso." });
      refetch();
    } catch {
      toast({ title: "Erro", description: "Falha ao excluir registro.", variant: "destructive" });
    }
  };

  const handleDesconsiderar = async (id: number) => {
    if (!confirm("Marcar este cancelamento como DESCONSIDERADO?")) return;
    try {
      await updateStatus.mutateAsync({ id, status: "DESCONSIDERADO" });
      toast({ title: "Atualizado", description: "Status alterado para Desconsiderado." });
      refetch();
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar.", variant: "destructive" });
    }
  };

  const stats = (data as any)?.stats;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Fluxo de Cancelamento</h1>
            <p className="text-muted-foreground">Gerencie e acompanhe as solicitações de cancelamento.</p>
          </div>
          <CreateCancellationDialog onSuccess={refetch} />
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total" value={stats.total} color="text-white" icon={<AlertCircle className="w-5 h-5" />} />
            <StatBox label="Pendentes" value={stats.pending} color="text-amber-400" icon={<Clock className="w-5 h-5 text-amber-400" />} />
            <StatBox label="Em Andamento" value={stats.inProgress} color="text-blue-400" icon={<Loader2 className="w-5 h-5 text-blue-400" />} />
            <StatBox label="Resolvidos" value={stats.resolved} color="text-emerald-400" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} />
          </div>
        )}

        <div className="p-6 rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex mb-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por pedido, fornecedor, passageiro..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-12 bg-background border-border rounded-xl"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border">
                <tr>
                  <th className="px-4 py-4 font-semibold">Pedido</th>
                  <th className="px-4 py-4 font-semibold">Fornecedor / Produto</th>
                  <th className="px-4 py-4 font-semibold">Passageiro</th>
                  <th className="px-4 py-4 font-semibold">Motivo</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Data</th>
                  <th className="px-4 py-4 font-semibold text-center">E-mail</th>
                  <th className="px-4 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Carregando...
                    </td>
                  </tr>
                ) : !data?.data.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      <XCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                ) : (
                  (data?.data as CancellationItem[]).map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-bold text-white">{item.orderNumber}</span>
                        {item.daysPending != null && item.status !== "RESOLVIDO" && (
                          <div className={`text-xs mt-0.5 font-medium ${item.daysPending > 5 ? "text-red-400" : "text-amber-400"}`}>
                            {item.daysPending}d pendente
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white text-sm">{item.supplier || <span className="text-muted-foreground italic">—</span>}</div>
                        <div className="text-xs text-muted-foreground">{item.product || ""}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white">
                        {item.passenger || <span className="text-muted-foreground italic">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-white">{item.reason}</span>
                      </td>
                      <td className="px-4 py-4">{statusBadge(item.status)}</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {item.sendDate ? formatDate(item.sendDate) : "—"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.emailSent ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Enviado
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(item.id)}
                            disabled={emailMutation.isPending}
                            className="h-7 text-xs bg-transparent border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Enviar
                          </Button>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          {/* Botão Desconsiderar */}
                          {item.status !== "RESOLVIDO" && item.status !== "DESCONSIDERADO" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDesconsiderar(item.id)}
                              className="h-8 w-8 text-orange-400 hover:text-orange-500 hover:bg-orange-500/10"
                              title="Desconsiderar"
                            >
                              <Undo2 className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Botões de Fluxo */}
                          <div className="flex gap-1.5">
                            {item.status === "PENDENTE" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatus(item.id, "EM ANDAMENTO")}
                                disabled={updateStatus.isPending}
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Andamento
                              </Button>
                            )}
                            {item.status !== "RESOLVIDO" && item.status !== "DESCONSIDERADO" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatus(item.id, "RESOLVIDO")}
                                disabled={updateStatus.isPending}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Resolver
                              </Button>
                            )}
                          </div>

                          {/* Botão Excluir */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExcluir(item.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.total > 20 && (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <span>Total: {data.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3">
                  Anterior
                </Button>
                <span className="px-2 py-1">Página {page}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total} className="h-8 px-3">
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card flex flex-col items-center justify-center gap-1">
      {icon}
      <span className={`text-2xl font-display font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold text-center">{label}</span>
    </div>
  );
}

const MOTIVOS = [
  "Suspeita de fraude",
  "Agência não aceitou o Fun/Volcano",
  "Agência não aceitou o Promo",
  "Atração cancelada",
  "Cancelado pelo cliente",
  "Cancelamento Fun",
  "Chargeback",
  "Duplicidade / Comercial",
  "Duplicidade / Fornecedor",
  "Duplicidade / Tecnologia",
  "Duplicidade / Emissão",
  "Duplicidade / Oparks",
  "Duplicidade / Pos",
  "Duplicidade / Wl",
  "Erro Cliente",
  "Erro Comercial",
  "Erro da Agência",
  "Erro na V2",
  "Erro Na Wl",
  "Erro de emissão",
  "Erro de integração",
  "Erro de produtos",
  "Erro do Cliente",
  "Erro do Comercial",
  "Erro do Fornecedor",
  "Erro do Pós",
  "Erro na Conferência",
  "Erro na Fatura do Fornecedor",
  "Erro no Backoffice",
  "Erro Operacional",
  "Erro Wl",
  "Ganho na Tarifa",
  "Inconsistência do Line",
  "Prevenção de Prejuízo",
  "Redução de Prejuizo",
  "Troca de Fornecedor",
  "Troca para o Fun",
  "Upgrade",
  "Erro de precificação",
  "Outro",
];

const ASSINATURAS = [
  { label: "Marcos Leonidio — Supervisor de Emissão", nome: "Marcos Leonidio", cargo: "Supervisor de Emissão" },
  { label: "Marielly Behrmann — Dados/Qualidade", nome: "Marielly Behrmann", cargo: "Dados/Qualidade" },
  { label: "Naiara Vitório — Coordenadora de Emissão", nome: "Naiara Vitório", cargo: "Coordenadora de Emissão" },
];

function CreateCancellationDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const orderNumber = formData.get("orderNumber") as string;
    const passenger = formData.get("passenger") as string;
    const reason = formData.get("reason") as string;
    const assinaturaVal = formData.get("assinatura") as string;
    const [assinaturaNome, assinaturaCargo] = assinaturaVal ? assinaturaVal.split("|") : ["Marcos Leonidio", "Supervisor de Emissão"];

    try {
      const result = await fetch(`${BASE}api/cancellations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, passenger, reason, assinaturaNome, assinaturaCargo }),
      });

      if (!result.ok) {
        const err = await result.json();
        throw new Error(err.error || "Erro ao registrar");
      }

      const data = await result.json();

      toast({
        title: "Cancelamento registrado!",
        description: data.orderFound
          ? "Dados do pedido preenchidos. E-mail enviado via planilha."
          : "Pedido não encontrado na base — verifique o número e tente novamente.",
      });

      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Falha ao registrar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" /> Solicitar Cancelamento
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nova Solicitação de Cancelamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Número do Pedido *</label>
            <Input
              required
              name="orderNumber"
              placeholder="Ex: 123456"
              className="bg-background border-border h-11"
            />
            <p className="text-xs text-muted-foreground">Fornecedor, atração, booking e valor serão preenchidos automaticamente.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Nome do Passageiro (PAX) *</label>
            <Input
              required
              name="passenger"
              placeholder="Digite o nome completo do passageiro"
              className="bg-background border-border h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Motivo do Cancelamento *</label>
            <select
              required
              name="reason"
              className="w-full h-11 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione o motivo...</option>
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Enviar e-mail assinado por *</label>
            <select
              required
              name="assinatura"
              className="w-full h-11 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione a assinatura...</option>
              {ASSINATURAS.map((a) => (
                <option key={a.nome} value={`${a.nome}|${a.cargo}`}>{a.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Define quem assina o e-mail enviado ao fornecedor.</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400">
            O e-mail será disparado automaticamente para o fornecedor via planilha Google ao confirmar.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : "Solicitar Cancelamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}