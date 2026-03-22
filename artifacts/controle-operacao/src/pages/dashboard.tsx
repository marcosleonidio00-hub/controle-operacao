import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useListOrders, useListCancellations, useGetGoalsSummary } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: orders } = useListOrders({ page: 1, pageSize: 5 });
  const { data: cancellations } = useListCancellations({ page: 1, pageSize: 5 });
  const { data: goalsSummary } = useGetGoalsSummary();

  const statCards = [
    {
      title: "Total de Pedidos",
      value: orders?.total || 0,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Cancelamentos Pendentes",
      value: cancellations?.stats?.pending || 0,
      icon: AlertCircle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Meta Diária (Hoje)",
      value: goalsSummary?.todayTarget || 0,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Atingido (Hoje)",
      value: goalsSummary?.todayAchieved || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo, {user?.name}. Aqui está o resumo da operação.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-2xl border ${stat.border} bg-card shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:bg-primary/20 transition-colors`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-display font-bold text-white">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6">Top Performers (Mês)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsSummary?.topPerformers || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="userName" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="achieved" name="Atingido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Pedidos Recentes</h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {orders?.data?.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      order.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>{order.product}</span>
                    <span>{order.emissionCost ? formatCurrency(order.emissionCost) : '-'}</span>
                  </div>
                </div>
              ))}
              {!orders?.data?.length && (
                <div className="text-center py-10 text-muted-foreground">Nenhum pedido encontrado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
