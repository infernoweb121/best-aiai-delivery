import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin, assignFirstAdmin } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Mostra loading enquanto carrega dados
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card className="w-96 shadow-primary">
          <CardContent className="flex flex-col items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando permissões...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não está autenticado, não mostra nada (redirect já aconteceu)
  if (!user) return null;

  // Se requer admin mas não é admin
  if (requireAdmin && !isAdmin) {
    // Se não tem role alguma, pode ser o primeiro admin
    if (role === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
          <Card className="w-full max-w-md shadow-primary">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Primeiro Acesso Admin</h2>
              <p className="text-muted-foreground mb-6">
                Parece que você é o primeiro usuário! Deseja se tornar administrador do sistema?
              </p>
              <Button 
                onClick={assignFirstAdmin}
                className="w-full"
                size="lg"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Tornar-se Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Se tem role mas não é admin
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <Card className="w-full max-w-md shadow-primary">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Shield className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar esta área. Entre em contato com um administrador.
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}