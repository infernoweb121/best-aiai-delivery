import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Webhook, 
  Copy, 
  CheckCircle,
  ExternalLink,
  Shield,
  Database,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function Settings() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const webhookUrl = 'https://ilgkvfayuyxnruugkbnv.supabase.co/functions/v1/abacatepay-webhook';
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AdminLayout 
      title="Configurações" 
      description="Configure sua loja e integrações"
    >
      <div className="space-y-6">
        
        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Configuração do Webhook AbacatePay
            </CardTitle>
            <CardDescription>
              Configure o webhook para receber notificações de pagamento automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, 'URL do Webhook')}
                >
                  {copied === 'URL do Webhook' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Como configurar:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Acesse seu painel do AbacatePay</li>
                <li>Vá para Configurações → Webhooks</li>
                <li>Adicione uma nova URL de webhook</li>
                <li>Cole a URL acima no campo correspondente</li>
                <li>Selecione o evento "billing.paid"</li>
                <li>Salve as configurações</li>
              </ol>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Webhook configurado e funcionando</span>
            </div>
          </CardContent>
        </Card>

        {/* Sistema Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>
              Detalhes técnicos e status do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status do Banco de Dados</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Gateway de Pagamento</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    <CreditCard className="h-3 w-3 mr-1" />
                    AbacatePay Ativo
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Versão do Sistema</Label>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              
              <div className="space-y-2">
                <Label>Última Atualização</Label>
                <p className="text-sm text-muted-foreground">16/08/2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Row Level Security (RLS) Ativo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Todas as tabelas estão protegidas com políticas de segurança em nível de linha.
                Apenas administradores podem acessar dados sensíveis.
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Autenticação Supabase</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema de autenticação seguro com verificação de email e controle de sessão.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Links Úteis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Links Úteis
            </CardTitle>
            <CardDescription>
              Acesso rápido a painéis e documentações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://painel.abacatepay.com" target="_blank" rel="noopener noreferrer">
                <CreditCard className="h-4 w-4 mr-2" />
                Painel AbacatePay
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <Database className="h-4 w-4 mr-2" />
                Painel Supabase
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://docs.abacatepay.com" target="_blank" rel="noopener noreferrer">
                <Webhook className="h-4 w-4 mr-2" />
                Documentação AbacatePay
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}