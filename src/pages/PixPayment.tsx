import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  pixId: string;
  brCode: string;
  brCodeBase64: string;
  amount: number;
  orderId: string;
  expiresAt: string;
}

export default function PixPayment() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get payment data from sessionStorage
    const storedData = sessionStorage.getItem('pixPaymentData');
    if (!storedData) {
      navigate('/');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setPaymentData(data);
    } catch (error) {
      console.error('Erro ao processar dados do pagamento:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!paymentData?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expiration = new Date(paymentData.expiresAt);
      const diff = expiration.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentData?.expiresAt]);

  const copyPixCode = () => {
    if (paymentData?.brCode) {
      navigator.clipboard.writeText(paymentData.brCode);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu aplicativo bancário para efetuar o pagamento",
      });
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.pixId) return;

    setIsCheckingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-abacatepay-payment', {
        body: { pixId: paymentData.pixId }
      });

      if (error) {
        throw error;
      }

      if (data?.status === 'PAID') {
        // Payment confirmed, clear stored data and redirect to success
        sessionStorage.removeItem('pixPaymentData');
        navigate('/pagamento/confirmado');
      } else {
        toast({
          title: "Pagamento ainda não confirmado",
          description: "Aguarde alguns instantes e tente novamente",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast({
        title: "Erro ao verificar pagamento",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  if (!paymentData) {
    return null;
  }

  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">Pagamento PIX</CardTitle>
              <p className="text-muted-foreground">
                Valor: <span className="font-bold text-lg">{formatAmount(paymentData.amount)}</span>
              </p>
              {timeRemaining && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Expira em: {timeRemaining}</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={paymentData.brCodeBase64} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Escaneie o QR Code com seu aplicativo bancário
                </p>
              </div>

              {/* PIX Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Código PIX:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.brCode}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-muted rounded border font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPixCode}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ou copie e cole no seu aplicativo bancário
                </p>
              </div>

              {/* Payment Check Button */}
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingPayment}
                className="w-full"
                size="lg"
              >
                {isCheckingPayment ? (
                  "Verificando pagamento..."
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Já efetuei o pagamento
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-sm"
                >
                  Voltar à loja
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}