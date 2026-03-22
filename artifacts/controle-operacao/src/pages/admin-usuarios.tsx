import { useState } from "react";
import Layout from "@/components/layout";
import { useListUsers, useCreateUser, useUpdateUserPermissions, User } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Shield, UserCog, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function AdminUsuarios() {
  const { data: users, refetch, isLoading } = useListUsers();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Gestão de Usuários</h1>
            <p className="text-muted-foreground">Adicione operadores e gerencie suas permissões.</p>
          </div>
          <CreateUserDialog onSuccess={refetch} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
            ))
          ) : (
            users?.map((u) => (
              <div key={u.id} className="p-6 rounded-2xl border border-border bg-card shadow-lg flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center">
                        <UserCog className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white truncate">{u.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      u.role === 'master' ? 'bg-purple-500/10 text-purple-400' :
                      u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground border border-border'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Acessos</p>
                    <PermRow label="Fluxo de Dados" active={u.permissions?.fluxoDados} />
                    <PermRow label="Cancelamento" active={u.permissions?.fluxoCancelamento} />
                    <PermRow label="Emissão / Metas" active={u.permissions?.fluxoEmissao} />
                  </div>
                </div>
                
                {u.role !== 'master' && (
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <PermissionsDialog user={u} onSuccess={refetch} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

function PermRow({ label, active }: { label: string, active?: boolean }) {
  return (
    <div className="flex items-center text-sm">
      {active ? <Check className="w-4 h-4 text-emerald-500 mr-2" /> : <X className="w-4 h-4 text-red-500/50 mr-2" />}
      <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateUser();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        data: {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          username: formData.get("username") as string,
          password: formData.get("password") as string,
          role: formData.get("role") as 'admin' | 'user',
          permissions: {
            fluxoDados: formData.get("fluxoDados") === 'on',
            fluxoCancelamento: formData.get("fluxoCancelamento") === 'on',
            fluxoEmissao: formData.get("fluxoEmissao") === 'on',
          }
        }
      });
      toast({ title: "Sucesso", description: "Usuário criado." });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar usuário", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Operador/Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nome Completo *</label>
            <Input required name="name" className="bg-background border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Username *</label>
              <Input required name="username" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <Input required type="email" name="email" className="bg-background border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Senha *</label>
              <Input required type="password" name="password" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nível de Acesso *</label>
              <select required name="role" className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm text-foreground">
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm font-medium text-foreground mb-3">Permissões de Módulo</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="fluxoDados" defaultChecked className="rounded bg-background border-border text-primary focus:ring-primary" />
                <span className="text-sm text-muted-foreground">Fluxo de Dados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="fluxoCancelamento" defaultChecked className="rounded bg-background border-border text-primary focus:ring-primary" />
                <span className="text-sm text-muted-foreground">Fluxo de Cancelamento</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="fluxoEmissao" defaultChecked className="rounded bg-background border-border text-primary focus:ring-primary" />
                <span className="text-sm text-muted-foreground">Fluxo de Emissão / Metas</span>
              </label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              Criar Usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsDialog({ user, onSuccess }: { user: User, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateMutation = useUpdateUserPermissions();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          fluxoDados: formData.get("fluxoDados") === 'on',
          fluxoCancelamento: formData.get("fluxoCancelamento") === 'on',
          fluxoEmissao: formData.get("fluxoEmissao") === 'on',
        }
      });
      toast({ title: "Sucesso", description: "Permissões atualizadas." });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-8 text-xs bg-transparent border-border hover:bg-white/5 hover:text-white">
          <Shield className="w-3 h-3 mr-2" /> Editar Permissões
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Permissões: {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border/50 hover:bg-white/5">
              <input type="checkbox" name="fluxoDados" defaultChecked={user.permissions?.fluxoDados} className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Fluxo de Dados</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border/50 hover:bg-white/5">
              <input type="checkbox" name="fluxoCancelamento" defaultChecked={user.permissions?.fluxoCancelamento} className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Fluxo de Cancelamento</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border/50 hover:bg-white/5">
              <input type="checkbox" name="fluxoEmissao" defaultChecked={user.permissions?.fluxoEmissao} className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Fluxo de Emissão / Metas</span>
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending} className="w-full">Atualizar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
