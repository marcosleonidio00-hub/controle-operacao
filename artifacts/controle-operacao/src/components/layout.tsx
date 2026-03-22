import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Database, 
  XCircle, 
  Target, 
  Users, 
  LogOut,
  Menu,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "Fluxo de Dados", path: "/fluxo-dados", icon: Database, show: hasPermission("fluxoDados") },
    { name: "Cancelamentos", path: "/fluxo-cancelamento", icon: XCircle, show: hasPermission("fluxoCancelamento") },
    { name: "Metas e Emissão", path: "/fluxo-emissao", icon: Target, show: hasPermission("fluxoEmissao") },
    { name: "Usuários", path: "/admin/usuarios", icon: Users, show: user.role === "master" || user.role === "admin" },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border/50 flex-shrink-0 hidden md:flex flex-col relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display font-bold text-lg text-white tracking-wide">
            Controle<span className="text-primary font-light">Op</span>
          </h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.show).map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 mr-3 relative z-10 transition-transform duration-200", isActive ? "scale-110 text-primary" : "group-hover:scale-110")} />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="bg-background/50 rounded-xl p-4 border border-border/50 flex items-center justify-between">
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-foreground truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.role.toUpperCase()}</span>
            </div>
            <button 
              onClick={() => logout()}
              className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border/50 bg-card/50 backdrop-blur-md md:hidden z-20">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-display font-bold text-lg text-white">ControleOp</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full w-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
        
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
