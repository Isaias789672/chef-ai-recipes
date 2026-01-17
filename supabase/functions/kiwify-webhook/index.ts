import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_TOKEN = 'm1bft6fb7oo';

interface KiwifyWebhookPayload {
  email: string;
  evento: string;
  produto?: string;
  token: string;
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
    
    console.log('Received webhook payload:', JSON.stringify(payload));

    // Validate token
    if (!payload.token || payload.token !== VALID_TOKEN) {
      console.error('Invalid or missing token');
      return new Response(
        JSON.stringify({ error: 'Forbidden - Invalid token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!payload.email || !payload.evento) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Bad request - Missing email or evento' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = payload.email.toLowerCase().trim();
    const evento = payload.evento.toLowerCase();
    const produto = payload.produto || '';

    // Determine plan and status based on event
    let plan: 'free' | 'normal' | 'master' = 'free';
    let status: 'active' | 'cancelled' | 'overdue' = 'active';
    let planoAplicado = 'free';

    if (evento.includes('cancelada') || evento.includes('cancelado')) {
      status = 'cancelled';
      plan = 'free';
      planoAplicado = 'Cancelado - Acesso Bloqueado';
    } else if (evento.includes('atrasada') || evento.includes('atrasado')) {
      status = 'overdue';
      plan = 'free';
      planoAplicado = 'Atrasado - Acesso Bloqueado';
    } else if (evento.includes('renovada') || evento.includes('aprovada') || evento.includes('aprovado') || evento.includes('renovado')) {
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
    }

    console.log(`Processing: email=${email}, evento=${evento}, plan=${plan}, status=${status}`);

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

    // Log the webhook event
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        email,
        evento: payload.evento,
        produto,
        plano_aplicado: planoAplicado
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
      // Don't fail the request just because logging failed
    }

    console.log('Webhook processed successfully:', { email, plan, status, planoAplicado });

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
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
