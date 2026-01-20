import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_TOKEN = 'hicptshjzqo';

// Real Kiwify webhook payload structure
interface KiwifyWebhookPayload {
  // Simple format (from admin simulator)
  email?: string;
  evento?: string;
  produto?: string;
  token?: string;
  
  // Real Kiwify format
  order_id?: string;
  order_ref?: string;
  order_status?: string;
  webhook_event_type?: string;
  Product?: {
    product_id?: string;
    product_name?: string;
  };
  Customer?: {
    email?: string;
    full_name?: string;
    mobile?: string;
  };
  Subscription?: {
    id?: string;
    status?: string;
    plan?: {
      id?: string;
      name?: string;
    };
  };
  // Kiwify sends token at root level
  signature?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload: KiwifyWebhookPayload = await req.json();
    
    console.log('=== KIWIFY WEBHOOK RECEIVED ===');
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    // Validate token - check both simple format and Kiwify format
    const receivedToken = payload.token || payload.signature;
    if (!receivedToken || receivedToken !== VALID_TOKEN) {
      console.error('Invalid or missing token. Received:', receivedToken);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Invalid token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract email - try multiple paths
    const email = (
      payload.email || 
      payload.Customer?.email || 
      ''
    ).toLowerCase().trim();

    // Extract event - try multiple paths
    const evento = (
      payload.evento || 
      payload.webhook_event_type || 
      payload.order_status || 
      ''
    ).toLowerCase();

    // Extract product name - try multiple paths
    const produto = (
      payload.produto || 
      payload.Product?.product_name || 
      payload.Subscription?.plan?.name ||
      ''
    );

    console.log('Extracted data:', { email, evento, produto });

    // Validate required fields
    if (!email || !evento) {
      console.error('Missing required fields after extraction. Email:', email, 'Evento:', evento);
      return new Response(
        JSON.stringify({ 
          error: 'Bad request - Missing email or evento',
          received: { email, evento, produto }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine plan and status based on event
    let plan: 'free' | 'normal' | 'master' = 'free';
    let status: 'active' | 'cancelled' | 'overdue' = 'active';
    let planoAplicado = 'free';

    // Map Kiwify events to our system
    // Kiwify events: order_paid, subscription_canceled, subscription_overdue, 
    // subscription_renewed, pix_created, chargeback, refund
    const eventoNormalized = evento.toLowerCase();
    
    if (
      eventoNormalized.includes('cancel') || 
      eventoNormalized.includes('cancelada') || 
      eventoNormalized.includes('cancelado') ||
      eventoNormalized.includes('chargeback') ||
      eventoNormalized.includes('refund') ||
      eventoNormalized.includes('reembolso')
    ) {
      status = 'cancelled';
      plan = 'free';
      planoAplicado = 'Cancelado/Reembolsado - Acesso Bloqueado';
    } else if (
      eventoNormalized.includes('overdue') || 
      eventoNormalized.includes('atrasada') || 
      eventoNormalized.includes('atrasado')
    ) {
      status = 'overdue';
      plan = 'free';
      planoAplicado = 'Atrasado - Acesso Bloqueado';
    } else if (
      eventoNormalized.includes('paid') ||
      eventoNormalized.includes('approved') ||
      eventoNormalized.includes('renew') ||
      eventoNormalized.includes('renovada') || 
      eventoNormalized.includes('aprovada') || 
      eventoNormalized.includes('aprovado') || 
      eventoNormalized.includes('renovado') ||
      eventoNormalized.includes('order_paid') ||
      eventoNormalized.includes('subscription_renewed')
    ) {
      status = 'active';
      
      // Determine plan based on product
      const produtoLower = produto.toLowerCase();
      if (produtoLower.includes('master')) {
        plan = 'master';
        planoAplicado = 'Master';
      } else if (produtoLower.includes('pro') || produtoLower.includes('normal')) {
        plan = 'normal';
        planoAplicado = 'Normal';
      } else {
        plan = 'normal';
        planoAplicado = 'Normal (padrão)';
      }
    } else if (
      eventoNormalized.includes('pix') ||
      eventoNormalized.includes('waiting') ||
      eventoNormalized.includes('pending')
    ) {
      // Pix generated - don't change plan yet, just log
      planoAplicado = 'Aguardando Pagamento (Pix)';
      // We'll still log but not update user status for pending payments
      console.log('Pix generated, logging only, not changing user status');
    }

    console.log(`Processing: email=${email}, evento=${evento}, plan=${plan}, status=${status}, planoAplicado=${planoAplicado}`);

    // Only upsert user if it's not a pending payment event
    if (!eventoNormalized.includes('pix') && !eventoNormalized.includes('waiting') && !eventoNormalized.includes('pending')) {
      // Upsert user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          email,
          plan,
          status,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (userError) {
        console.error('Error upserting user:', userError);
        return new Response(
          JSON.stringify({ error: 'Failed to update user', details: userError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('User updated:', userData);
    }

    // Log the webhook event (always log, even for pending payments)
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        email,
        evento: payload.evento || payload.webhook_event_type || payload.order_status || 'unknown',
        produto,
        plano_aplicado: planoAplicado
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
      // Don't fail the request just because logging failed
    }

    console.log('=== WEBHOOK PROCESSED SUCCESSFULLY ===');
    console.log({ email, plan, status, planoAplicado });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        data: {
          email,
          plan,
          status,
          plano_aplicado: planoAplicado
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
