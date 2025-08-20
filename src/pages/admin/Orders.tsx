import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  ShoppingBag, 
  Eye,
  Calendar,
  Mail,
  Phone,
  User,
  CreditCard
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number;
  paid_amount: number | null;
  fee: number | null;
  status: string;
  payment_method: string | null;
  abacatepay_id: string | null;
  abacatepay_url: string | null;
  created_at: string;
  dev_mode: boolean | null;
  metadata: any;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_amount: number;
  total_amount: number | null;
  product_id: string | null;
}

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch order items for selected order
  const { data: orderItems } = useQuery({
    queryKey: ['order-items', selectedOrder?.id],
    queryFn: async (): Promise<OrderItem[]> => {
      if (!selectedOrder) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', selectedOrder.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedOrder
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string | null) => {
    if (!method) return null;
    
    const methodMap = {
      PIX: { label: 'PIX', variant: 'outline' as const },
      CARD: { label: 'Cartão', variant: 'outline' as const },
    };
    
    const methodInfo = methodMap[method as keyof typeof methodMap];
    if (!methodInfo) return null;
    
    return (
      <Badge variant={methodInfo.variant}>
        {methodInfo.label}
      </Badge>
    );
  };

  return (
    <AdminLayout 
      title="Pedidos" 
      description="Gerencie todos os pedidos da sua loja"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Pedidos ({orders?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">#{order.id.slice(0, 8)}</h3>
                        {getStatusBadge(order.status)}
                        {getPaymentMethodBadge(order.payment_method)}
                        {order.dev_mode && (
                          <Badge variant="outline" className="text-xs">DEV</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.customer_name || 'Cliente'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {order.customer_email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(order.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Pedido #{order.id.slice(0, 8)}
                          </DialogTitle>
                          <DialogDescription>
                            Detalhes completos do pedido
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Informações do cliente */}
                          <div>
                            <h4 className="font-medium mb-3">Informações do Cliente</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Nome</p>
                                <p className="font-medium">{order.customer_name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{order.customer_email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Telefone</p>
                                <p className="font-medium">{order.customer_phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CPF</p>
                                <p className="font-medium">{(order as any).customer_cpf || 'N/A'}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Endereço</p>
                                <p className="font-medium">
                                  {(order as any).customer_address && (order as any).customer_city && (order as any).customer_state 
                                    ? `${(order as any).customer_address}, ${(order as any).customer_city} - ${(order as any).customer_state}`
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CEP</p>
                                <p className="font-medium">{(order as any).customer_zipcode || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Data do Pedido</p>
                                <p className="font-medium">
                                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Informações de pagamento */}
                          <div>
                            <h4 className="font-medium mb-3">Informações de Pagamento</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(order.status)}</div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Método</p>
                                <div className="mt-1">
                                  {getPaymentMethodBadge(order.payment_method) || (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total</p>
                                <p className="font-medium text-lg">{formatCurrency(order.total_amount)}</p>
                              </div>
                              {order.paid_amount && (
                                <div>
                                  <p className="text-muted-foreground">Valor Pago</p>
                                  <p className="font-medium">{formatCurrency(order.paid_amount)}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Itens do pedido */}
                          <div>
                            <h4 className="font-medium mb-3">Itens do Pedido</h4>
                            <div className="space-y-2">
                              {orderItems?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Quantidade: {item.quantity} x {formatCurrency(item.unit_amount)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {formatCurrency(item.total_amount || (item.quantity * item.unit_amount))}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ID do AbacatePay */}
                          {order.abacatepay_id && (
                            <div>
                              <h4 className="font-medium mb-3">Informações Técnicas</h4>
                              <div className="text-sm">
                                <p className="text-muted-foreground">ID AbacatePay</p>
                                <p className="font-mono text-xs bg-muted p-2 rounded">
                                  {order.abacatepay_id}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground">
                  {search || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Os pedidos dos clientes aparecerão aqui'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}