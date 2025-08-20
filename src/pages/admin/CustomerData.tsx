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
  Users, 
  Eye,
  Calendar,
  Mail,
  Phone,
  User,
  MapPin,
  CreditCard
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerOrder {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_cpf: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_zipcode: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function CustomerData() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOrder | null>(null);

  // Fetch customer data
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customer-data', search, statusFilter],
    queryFn: async (): Promise<CustomerOrder[]> => {
      let query = supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          customer_cpf,
          customer_address,
          customer_city,
          customer_state,
          customer_zipcode,
          total_amount,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
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

  return (
    <AdminLayout 
      title="Dados dos Clientes" 
      description="Visualize todos os dados coletados dos clientes"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
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

        {/* Lista de clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes ({customers?.length || 0})
            </CardTitle>
            <CardDescription>
              Informações completas coletadas durante os pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : customers && customers.length > 0 ? (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{customer.customer_name || 'Cliente'}</h3>
                        {getStatusBadge(customer.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.customer_email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.customer_phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.customer_city && customer.customer_state 
                            ? `${customer.customer_city} - ${customer.customer_state}`
                            : 'N/A'
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(customer.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {customer.customer_name || 'Cliente'}
                          </DialogTitle>
                          <DialogDescription>
                            Informações completas do cliente
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Dados pessoais */}
                          <div>
                            <h4 className="font-medium mb-3">Dados Pessoais</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Nome</p>
                                <p className="font-medium">{customer.customer_name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{customer.customer_email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Telefone</p>
                                <p className="font-medium">{customer.customer_phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CPF</p>
                                <p className="font-medium">{customer.customer_cpf || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Endereço */}
                          <div>
                            <h4 className="font-medium mb-3">Endereço de Entrega</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Endereço</p>
                                <p className="font-medium">{customer.customer_address || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Cidade</p>
                                <p className="font-medium">{customer.customer_city || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Estado</p>
                                <p className="font-medium">{customer.customer_state || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CEP</p>
                                <p className="font-medium">{customer.customer_zipcode || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Informações do pedido */}
                          <div>
                            <h4 className="font-medium mb-3">Informações do Pedido</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(customer.status)}</div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Valor Total</p>
                                <p className="font-medium text-lg">{formatCurrency(customer.total_amount)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Data do Pedido</p>
                                <p className="font-medium">
                                  {format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground">
                  {search || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Os dados dos clientes aparecerão aqui após os primeiros pedidos'
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