
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
    console.log('=== Webhook AbacatePay recebido ===');
    const webhookSecret = new URL(req.url).searchParams.get('webhookSecret');
    const expectedSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');

    if (!expectedSecret) {
      console.error('ABACATEPAY_WEBHOOK_SECRET não configurado');
      return new Response(JSON.stringify({ error: 'Webhook secret não configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error('Webhook secret inválido:', webhookSecret);
      return new Response(JSON.stringify({ error: 'Webhook secret inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    console.log('Evento recebido:', payload.event, 'Billing ID:', payload.data?.billing?.id);

    const { event, data, devMode } = payload;

    if (event !== 'billing.paid') {
      console.log('Evento ignorado:', event, '- Aguardando billing.paid');
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Processando pagamento confirmado...');

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair dados do pagamento
    const { payment, billing } = data;
    const billingId = billing?.id;

    if (!billingId) {
      console.error('ID da cobrança não encontrado no webhook');
      return new Response(JSON.stringify({ error: 'ID da cobrança não encontrado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processando pagamento para cobrança:', billingId);

    // Buscar pedido pelo abacatepay_id
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('abacatepay_id', billingId)
      .single();

    if (findError || !order) {
      console.error('Pedido não encontrado para billing ID:', billingId, 'Erro:', findError);
      return new Response(JSON.stringify({ error: 'Pedido não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Pedido encontrado:', order.id, 'Status atual:', order.status);

    // Atualizar status do pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_amount: payment?.amount || billing?.paidAmount,
        fee: payment?.fee,
        payment_method: payment?.method,
        dev_mode: devMode
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError);
      throw new Error('Erro ao atualizar pedido');
    }

    console.log('=== Pagamento processado com sucesso ===');
    console.log('Pedido:', order.id, 'atualizado para status: paid');
    console.log('Valor pago:', payment?.amount || billing?.paidAmount, 'centavos');

    return new Response(JSON.stringify({ 
      received: true, 
      orderId: order.id,
      status: 'paid'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no webhook AbacatePay:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
