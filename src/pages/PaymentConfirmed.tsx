import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Clock } from 'lucide-react';

export default function PaymentConfirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any remaining payment data
    sessionStorage.removeItem('pixPaymentData');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Pagamento Confirmado!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="text-6xl">🏠</div>
                <h2 className="text-xl font-semibold text-primary">
                  Seu produto chegará em sua casa
                </h2>
                <p className="text-muted-foreground">
                  Obrigado pela sua compra! Seu pedido foi confirmado e em breve chegará até você.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Tempo estimado de entrega: 25-35 minutos</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/')}
                className="w-full"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Voltar à loja
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}