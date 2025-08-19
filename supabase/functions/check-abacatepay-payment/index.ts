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
    console.log('=== Verificando status do pagamento AbacatePay ===');
    const { pixId } = await req.json();
    console.log('PIX ID para verificação:', pixId);
    
    const abacatePayApiKey = Deno.env.get('ABACATEPAY_API_KEY');

    if (!abacatePayApiKey) {
      throw new Error('ABACATEPAY_API_KEY não configurada');
    }

    if (!pixId) {
      throw new Error('PIX ID não fornecido');
    }

    console.log('Enviando requisição para verificar pagamento PIX...');
    
    // Check payment status with AbacatePay
    const response = await fetch(`https://api.abacatepay.com/v1/pixQrCode/${pixId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Resposta da verificação AbacatePay - Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API AbacatePay na verificação:', response.status, errorText);
      throw new Error(`Erro da API AbacatePay: ${response.status}`);
    }

    const abacatePayResponse = await response.json();
    console.log('Status do pagamento verificado:', {
      pixId,
      status: abacatePayResponse.data?.status,
      expiresAt: abacatePayResponse.data?.expiresAt
    });

    if (abacatePayResponse.error) {
      console.error('Erro retornado pela AbacatePay na verificação:', abacatePayResponse.error);
      throw new Error(`AbacatePay: ${abacatePayResponse.error}`);
    }

    const paymentData = abacatePayResponse.data;

    console.log('=== Verificação de pagamento concluída ===');
    console.log('PIX ID:', pixId, 'Status:', paymentData.status);

    return new Response(JSON.stringify({ 
      status: paymentData.status,
      expiresAt: paymentData.expiresAt,
      pixId: pixId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função check-abacatepay-payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});