import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpar carrinho do localStorage se estiver sendo usado
    localStorage.removeItem('cart');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-primary">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto gradient-primary rounded-full p-4 w-20 h-20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-primary">
            Pagamento Confirmado! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Obrigado pelo seu pedido!
            </p>
            <p className="text-muted-foreground">
              Seu pedido foi confirmado e está sendo preparado. 
              Você receberá atualizações sobre o status da entrega.
            </p>
          </div>

          <div className="gradient-accent rounded-lg p-4 text-accent-foreground">
            <p className="font-semibold">🕐 Tempo de entrega</p>
            <p className="text-sm opacity-90">25-35 minutos</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full gradient-primary hover:opacity-90 text-primary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Aqui poderia abrir uma página de pedidos ou enviar por email
                alert('Funcionalidade de comprovante será implementada em breve!');
              }}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Ver Comprovante
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Dúvidas? Entre em contato conosco!
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

export default PaymentSuccess;