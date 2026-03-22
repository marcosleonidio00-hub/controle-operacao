import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ data: formData });
    } catch (err) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20 mb-6">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground text-lg">
              Acesse o sistema Controle da Operação.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">E-mail ou Usuário</label>
              <Input 
                required
                type="text"
                placeholder="ex: marcosleonidio00@gmail.com"
                value={formData.login}
                onChange={e => setFormData({ ...formData, login: e.target.value })}
                className="h-14 bg-card/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl px-4 text-base transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-foreground">Senha</label>
              </div>
              <Input 
                required
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="h-14 bg-card/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl px-4 text-base transition-all"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Entrar no sistema
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Image Section */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-card">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`}
          alt="Controle da Operação Background" 
          className="object-cover w-full h-full transform scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="p-12 backdrop-blur-md bg-background/20 border border-white/10 rounded-3xl max-w-lg text-center shadow-2xl">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Eficiência Máxima</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Unificando projetos e fluxos em uma única plataforma poderosa. Controle suas emissões, dados e metas com precisão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
