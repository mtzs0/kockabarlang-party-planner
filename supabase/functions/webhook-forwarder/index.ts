import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEBHOOK_URL = "https://n.dakexpo.hu/webhook/a243f7a5-3363-474c-9d06-569a1361daf1";

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
    const reservationData = await req.json();
    
    console.log('Forwarding reservation to webhook:', reservationData);

    // Forward the data to the webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    const responseText = await response.text();
    console.log('Webhook response status:', response.status);
    console.log('Webhook response body:', responseText);

    if (!response.ok) {
      console.error('Webhook call failed:', response.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Webhook call failed', 
          status: response.status,
          details: responseText 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhookStatus: response.status,
        webhookResponse: responseText 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in webhook-forwarder function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
