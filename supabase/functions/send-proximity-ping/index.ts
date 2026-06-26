import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight CORS requests from mobile clients smoothly
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Client with service-role privileges to override RLS securely for background writing
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract payload from customer application background thread
    const { userId, partnerId, offerTitle, offerDescription } = await req.json()

    if (!userId || !partnerId) {
      return new Response(JSON.stringify({ error: 'Missing logging constraints.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Insert the log entry directly to kick off the 15-minute cooldown cache
    const { error: logError } = await supabaseClient
      .from('proximity_ping_logs')
      .insert([{ user_id: userId, partner_id: partnerId }])

    if (logError) throw logError

    // 2. Dispatch payload to physical device notification servers (Firebase/FCM example stub)
    // In a live environment, you would swap this payload with your direct Firebase or Expo access tokens.
    const fcmPayload = {
      to: `/topics/user_${userId}`,
      notification: {
        title: `🔥 Live Deal: ${offerTitle}`,
        body: offerDescription,
        sound: "default"
      }
    }

    return new Response(JSON.stringify({ success: true, logged: true, dispatched: fcmPayload.notification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})