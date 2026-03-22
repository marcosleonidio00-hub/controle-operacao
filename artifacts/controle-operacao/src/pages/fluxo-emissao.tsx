import { useState } from "react";
import Layout from "@/components/layout";
import { useGetPerformance, useListUsers, useCreateGoal } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Trophy, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

export default function FluxoEmissao() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'master';
  const { data: performance, refetch } = useGetPerformance();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Metas e Desempenho</h1>
            <p className="text-muted-foreground">Acompanhamento do fluxo de emissões e atingimento de metas.</p>
          </div>
          {isAdmin && <CreateGoalDialog onSuccess={refetch} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <Trophy className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Meta Total (Período)</p>
            <h3 className="text-4xl font-display font-bold text-white mt-1">
              {performance?.totalTarget || 0}
            </h3>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <Target className="w-8 h-8 text-emerald-500 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Atingido Total</p>
            <h3 className="text-4xl font-display font-bold text-white mt-1">
              {performance?.totalAchieved || 0}
            </h3>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <CalendarDays className="w-8 h-8 text-purple-500 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
            <h3 className="text-4xl font-display font-bold text-white mt-1">
              {performance?.overallPercentage?.toFixed(1) || 0}%
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Gráfico de Performance (Diário)</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performance?.data || []} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="target" name="Meta" fill="hsl(var(--primary)/0.3)" stroke="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="achieved" name="Atingido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="percentage" name="Sucesso (%)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CreateGoalDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: users } = useListUsers();
  const createMutation = useCreateGoal();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        data: {
          userId: Number(formData.get("userId")),
          date: formData.get("date") as string,
          target: Number(formData.get("target")),
        }
      });
      toast({ title: "Meta Definida", description: "A meta foi registrada." });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao definir meta", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          Definir Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Definir Meta Diária</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Operador</label>
            <select required name="userId" className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm text-foreground">
              <option value="">Selecione...</option>
              {users?.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Data</label>
            <Input required type="date" name="date" className="bg-background border-border" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Valor da Meta (Qtd)</label>
            <Input required type="number" name="target" min="1" className="bg-background border-border" />
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
