import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import FluxoDados from "@/pages/fluxo-dados";
import FluxoCancelamento from "@/pages/fluxo-cancelamento";
import FluxoEmissao from "@/pages/fluxo-emissao";
import AdminUsuarios from "@/pages/admin-usuarios";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/fluxo-dados" component={FluxoDados} />
      <Route path="/fluxo-cancelamento" component={FluxoCancelamento} />
      <Route path="/fluxo-emissao" component={FluxoEmissao} />
      <Route path="/admin/usuarios" component={AdminUsuarios} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
