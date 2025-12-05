import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can create jobs' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jobData = await req.json();

    const { data: job, error: createError } = await supabaseClient
      .from('jobs')
      .insert({
        customer_name: jobData.customerName,
        customer_phone: jobData.customerPhone,
        customer_alt_phone: jobData.customerAltPhone,
        customer_address: jobData.customerAddress,
        customer_location: jobData.customerLocation,
        device_type: jobData.deviceType,
        device_issue: jobData.deviceIssue,
        notes: jobData.notes,
        time_slot: jobData.timeSlot,
        service_charge: jobData.serviceCharge || 0,
        parts_cost: jobData.partsCost || 0,
        gst: jobData.gst || 0,
        status: 'unassigned',
        created_by: user.id,
        timeline: {
          createdAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      return new Response(JSON.stringify({ error: 'Failed to create job' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert initial status history
    await supabaseClient
      .from('status_history')
      .insert({
        job_id: job.id,
        status: 'unassigned',
        changed_by: user.id,
      });

    return new Response(JSON.stringify({ success: true, job }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
