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

    // Check if user is admin or semiadmin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!['admin', 'semiadmin'].includes(roleData?.role)) {
      return new Response(JSON.stringify({ error: 'Only admins and semiadmins can assign jobs' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { jobId, technicianId } = await req.json();

    if (!jobId || !technicianId) {
      return new Response(JSON.stringify({ error: 'Missing jobId or technicianId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify job is unassigned
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (job.status !== 'unassigned') {
      return new Response(JSON.stringify({ error: 'Job is already assigned' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify technician exists and is a technician
    const { data: techRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', technicianId)
      .single();

    if (techRole?.role !== 'technician') {
      return new Response(JSON.stringify({ error: 'Selected user is not a technician' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update job
    const { data: updatedJob, error: updateError } = await supabaseClient
      .from('jobs')
      .update({
        technician_id: technicianId,
        assigned_by: user.id,
        status: 'assigned',
        timeline: {
          assignedAt: new Date().toISOString(),
        },
      })
      .eq('id', jobId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to assign job' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert status history
    await supabaseClient
      .from('status_history')
      .insert({
        job_id: jobId,
        status: 'assigned',
        changed_by: user.id,
      });

    return new Response(JSON.stringify({ success: true, job: updatedJob }), {
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
