import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, ShoppingCart, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/');
    // O carrinho será mantido para tentar novamente
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-muted rounded-full p-4 w-20 h-20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Pagamento Cancelado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Sem problemas! 😊
            </p>
            <p className="text-muted-foreground">
              Seu pagamento foi cancelado e nenhuma cobrança foi realizada. 
              Seus itens ainda estão no carrinho caso queira tentar novamente.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Experimente diferentes formas de pagamento 
              ou entre em contato se precisar de ajuda.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full gradient-primary hover:opacity-90 text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Button>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={() => {
                // Simular abrir carrinho
                navigate('/');
                setTimeout(() => {
                  // Aqui poderia abrir o carrinho automaticamente
                }, 100);
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ver Carrinho
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda? Entre em contato!
            </p>
            <p className="text-sm font-medium text-primary">
              📱 (11) 99999-9999
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;