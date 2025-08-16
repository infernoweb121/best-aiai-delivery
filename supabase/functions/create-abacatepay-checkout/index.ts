import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { items, success_url, cancel_url } = await req.json();
    const abacatePayApiKey = Deno.env.get('ABACATEPAY_API_KEY');

    if (!abacatePayApiKey) {
      throw new Error('ABACATEPAY_API_KEY não configurada');
    }

    console.log('Criando checkout AbacatePay com itens:', items);

    // Calcular total dos itens
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.unit_amount * item.quantity);
    }, 0);

    // Criar sessão de checkout na AbacatePay
    const checkoutData = {
      amount: totalAmount, // Total em centavos
      currency: 'BRL',
      description: `Pedido Best Açaí - ${items.length} itens`,
      line_items: items,
      success_url: success_url,
      cancel_url: cancel_url,
      payment_method_types: ['card', 'pix'],
      mode: 'payment'
    };

    console.log('Dados do checkout:', checkoutData);

    // Fazer chamada para API da AbacatePay
    const response = await fetch('https://api.abacatepay.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API AbacatePay:', errorText);
      throw new Error(`Erro da API AbacatePay: ${response.status} - ${errorText}`);
    }

    const checkoutSession = await response.json();
    console.log('Sessão de checkout criada:', checkoutSession);

    return new Response(JSON.stringify({ 
      checkoutUrl: checkoutSession.url || checkoutSession.checkout_url 
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