import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGetMe, useLogin, useLogout, UserInfo, ErrorResponse } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";

interface AuthContextType {
  user: UserInfo | null | undefined;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutateAsync"];
  logout: ReturnType<typeof useLogout>["mutateAsync"];
  hasPermission: (permission: keyof UserInfo["permissions"]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        window.location.href = `${import.meta.env.BASE_URL}dashboard`;
      },
      onError: (err: any) => {
        toast({
          title: "Erro no login",
          description: err?.error || "Credenciais inválidas.",
          variant: "destructive",
        });
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        window.location.href = `${import.meta.env.BASE_URL}login`;
      }
    }
  });

  useEffect(() => {
    if (!isLoading && error && window.location.pathname !== `${import.meta.env.BASE_URL}login`) {
      setLocation("/login");
    }
  }, [isLoading, error, setLocation]);

  const hasPermission = (permission: keyof UserInfo["permissions"]) => {
    if (!user) return false;
    if (user.role === "master" || user.role === "admin") return true;
    return user.permissions?.[permission] === true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
