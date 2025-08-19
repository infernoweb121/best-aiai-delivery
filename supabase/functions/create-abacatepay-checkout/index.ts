
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Iniciando processamento de checkout AbacatePay ===');
    const { items, customer } = await req.json();
    console.log('Dados recebidos - Items:', items?.length, 'itens, Customer:', customer?.name || 'Anônimo');
    
    const abacatePayApiKey = Deno.env.get('ABACATEPAY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!abacatePayApiKey) {
      throw new Error('ABACATEPAY_API_KEY não configurada');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    console.log('Criando checkout AbacatePay com itens:', items);

    // Inicializar cliente Supabase com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calcular total dos itens
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.unit_amount * item.quantity);
    }, 0);

    // Criar pedido no banco
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        total_amount: totalAmount,
        customer_name: customer?.name || null,
        customer_email: customer?.email || null,
        customer_phone: customer?.phone || null,
        dev_mode: Deno.env.get("NODE_ENV") !== "production", // Define dev_mode com base no ambiente
        metadata: { source: 'web_app' }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      throw new Error('Erro ao criar pedido no banco de dados');
    }

    console.log('Pedido criado:', order.id);

    // Criar itens do pedido
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      name: item.name,
      unit_amount: item.unit_amount,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      throw new Error('Erro ao criar itens do pedido');
    }

    console.log('Itens do pedido criados');

    // Preparar dados para AbacatePay
    const description = `Pedido Best Açaí #${order.id.slice(-8)} - ${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
    
    // URLs de retorno - configurar com URLs reais do domínio
    const baseUrl = Deno.env.get("SITE_BASE_URL") || "https://43eee186-3009-4f9c-a03d-e342dd5279cf.lovableproject.com";
    const returnUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-canceled`;
    
    console.log('Configurando pagamento - Total:', totalAmount, 'centavos, Ambiente:', Deno.env.get("NODE_ENV") || 'development');
    
    const abacatePayData = {
      amount: totalAmount,
      description: description,
      frequency: 'ONE_TIME',
      methods: ['PIX', 'CARD'], // Verificar se a conta AbacatePay suporta ambos os métodos
      returnUrl: returnUrl,
      completionUrl: returnUrl,
      customer: customer ? {
        name: customer.name,
        email: customer.email,
        cellphone: customer.phone,
        taxId: customer.taxId || null
      } : undefined
    };

    // Preparar dados para AbacatePay PIX QR Code
    const pixPayload = {
      amount: totalAmount,
      description: description,
      expiresIn: 3600, // 1 hora
      customer: {
        name: customer?.name || 'Cliente',
        cellphone: customer?.phone || '',
        email: customer?.email || '',
        taxId: customer?.cpf || customer?.taxId || ''
      },
      metadata: {
        externalId: order.id,
        source: 'web_app'
      }
    };

    console.log('Dados para AbacatePay PIX:', { ...pixPayload, customer: customer ? 'Informado' : 'Não informado' });

    // Fazer chamada para AbacatePay PIX QR Code
    console.log('Enviando requisição para AbacatePay PIX API...');
    const response = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pixPayload),
    });
    
    console.log('Resposta da AbacatePay recebida - Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API AbacatePay:', response.status, errorText);
      throw new Error(`Erro da API AbacatePay: ${response.status}`);
    }

    const abacatePayResponse = await response.json();
    console.log('Resposta da AbacatePay PIX processada:', { 
      success: !abacatePayResponse.error, 
      pixId: abacatePayResponse.data?.id,
      brCode: abacatePayResponse.data?.brCode ? 'PIX gerado' : 'PIX não gerado',
      status: abacatePayResponse.data?.status
    });

    if (abacatePayResponse.error) {
      console.error('Erro retornado pela AbacatePay:', abacatePayResponse.error);
      throw new Error(`AbacatePay: ${abacatePayResponse.error}`);
    }

    const pixData = abacatePayResponse.data;

    // Atualizar pedido com dados da AbacatePay PIX
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        abacatepay_id: pixData.id,
        payment_method: 'PIX',
        metadata: { 
          ...order.metadata, 
          brCode: pixData.brCode,
          brCodeBase64: pixData.brCodeBase64,
          expiresAt: pixData.expiresAt
        }
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Erro ao atualizar pedido com dados AbacatePay:', updateError);
      // Não falha aqui pois a cobrança já foi criada
    }

    console.log('=== PIX QR Code criado com sucesso ===');
    console.log('Pedido ID:', order.id, 'PIX ID:', pixData.id);
    console.log('PIX gerado, retornando dados para exibição...');

    return new Response(JSON.stringify({ 
      pixId: pixData.id,
      brCode: pixData.brCode,
      brCodeBase64: pixData.brCodeBase64,
      amount: pixData.amount,
      orderId: order.id,
      expiresAt: pixData.expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função create-abacatepay-checkout:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
