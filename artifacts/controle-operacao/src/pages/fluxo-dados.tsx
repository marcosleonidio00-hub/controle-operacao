import { useState } from "react";
import Layout from "@/components/layout";
import { useListOrders, useCreateOrder, useUpdateOrder, useImportOrdersCsv, Order } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, MoreVertical, Edit, FileDown, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function FluxoDados() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, refetch, isLoading } = useListOrders({ search, page, pageSize: 10 });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Fluxo de Dados</h1>
            <p className="text-muted-foreground">Gestão e registro de pedidos e entregas.</p>
          </div>
          <div className="flex items-center gap-3">
            <ImportCsvDialog onSuccess={refetch} />
            <CreateOrderDialog onSuccess={refetch} />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex mb-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar pedido, fornecedor..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-background border-border rounded-xl"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border">
                <tr>
                  <th className="px-4 py-4 font-semibold">Nº Pedido</th>
                  <th className="px-4 py-4 font-semibold">Fornecedor / Produto</th>
                  <th className="px-4 py-4 font-semibold">Booking</th>
                  <th className="px-4 py-4 font-semibold">PAX / Agência</th>
                  <th className="px-4 py-4 font-semibold">Custo Emissão</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-10">Carregando...</td></tr>
                ) : data?.data.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum pedido encontrado.</td></tr>
                ) : (
                  data?.data.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-4 font-medium text-white">{order.orderNumber}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{order.supplier}</div>
                        <div className="text-xs text-muted-foreground">{order.product}</div>
                      </td>
                      <td className="px-4 py-4">{order.booking || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="text-white">{order.paxTotal} PAX</div>
                        <div className="text-xs text-muted-foreground">{order.agency}</div>
                      </td>
                      <td className="px-4 py-4 font-medium text-emerald-400">
                        {order.emissionCost ? formatCurrency(order.emissionCost) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          order.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          order.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <EditOrderDialog order={order} onSuccess={refetch} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Mostrando página {page} (Total: {data?.total || 0})</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!data || data.data.length < 10}>Próxima</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CreateOrderDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateOrder();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        data: {
          orderNumber: formData.get("orderNumber") as string,
          supplier: formData.get("supplier") as string,
          product: formData.get("product") as string,
          booking: formData.get("booking") as string,
          agency: formData.get("agency") as string,
          emissionCost: Number(formData.get("emissionCost")) || undefined,
          paxTotal: Number(formData.get("paxTotal")) || undefined,
        }
      });
      toast({ title: "Sucesso", description: "Pedido criado com sucesso." });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar pedido", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" /> Novo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nº Pedido *</label>
              <Input required name="orderNumber" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Booking</label>
              <Input name="booking" className="bg-background border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Fornecedor *</label>
              <Input required name="supplier" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Produto *</label>
              <Input required name="product" className="bg-background border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Custo Emissão</label>
              <Input type="number" step="0.01" name="emissionCost" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">PAX Total</label>
              <Input type="number" name="paxTotal" className="bg-background border-border" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Agência</label>
            <Input name="agency" className="bg-background border-border" />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              Salvar Pedido
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditOrderDialog({ order, onSuccess }: { order: Order, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateMutation = useUpdateOrder();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updateMutation.mutateAsync({
        id: order.id,
        data: {
          status: formData.get("status") as string,
          deliveryStatus: formData.get("deliveryStatus") as string,
          notes: formData.get("notes") as string,
        }
      });
      toast({ title: "Sucesso", description: "Pedido atualizado com sucesso." });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Pedido {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Status do Pedido</label>
            <select name="status" defaultValue={order.status} className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm">
              <option value="Pendente">Pendente</option>
              <option value="Em Processamento">Em Processamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Status de Entrega</label>
            <Input name="deliveryStatus" defaultValue={order.deliveryStatus} className="bg-background border-border" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Observações</label>
            <Input name="notes" defaultValue={order.notes} className="bg-background border-border" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending} className="w-full">Atualizar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImportCsvDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const importMutation = useImportOrdersCsv();

  const handleImport = async () => {
    if (!content) return;
    try {
      const res = await importMutation.mutateAsync({ data: { csvContent: content, separator: ";" } });
      toast({ 
        title: "Importação Concluída", 
        description: `${res.imported} pedidos importados. ${res.skipped} ignorados.`,
      });
      setOpen(false);
      setContent("");
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: "Falha na importação CSV", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-border bg-card hover:bg-background shadow-sm">
          <Upload className="w-4 h-4 mr-2" /> Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Dados CSV</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">Cole o conteúdo do seu CSV exportado abaixo. O separador padrão é ponto-e-vírgula (;).</p>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 bg-background border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="numero_do_pedido;fornecedor;produto;data_inicio;loc_booking;custo_emissao;pax_total;agencia;emitido_por..."
          />
          <Button onClick={handleImport} disabled={importMutation.isPending || !content} className="w-full">
            {importMutation.isPending ? "Processando..." : "Iniciar Importação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
