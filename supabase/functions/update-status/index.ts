import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string> = {
  'unassigned': 'assigned',
  'assigned': 'accepted',
  'accepted': 'waiting',
  'waiting': 'en_route',
  'en_route': 'doorstep',
  'doorstep': 'qc_before',
  'qc_before': 'job_started',
  'job_started': 'qc_after',
  'qc_after': 'invoice',
  'invoice': 'payment',
  'payment': 'completed',
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

    const { jobId, newStatus, qcData, paymentMethod, financials, jobStartAt, jobEndAt } = await req.json();

    if (!jobId || !newStatus) {
      return new Response(JSON.stringify({ error: 'Missing jobId or newStatus' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user role
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const userRole = roleData?.role;

    // Get current job
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate transition
    const expectedNext = VALID_TRANSITIONS[job.status];
    if (expectedNext !== newStatus) {
      return new Response(JSON.stringify({ 
        error: `Invalid transition from ${job.status} to ${newStatus}. Expected: ${expectedNext}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Role-based permission checks
    if (userRole === 'semiadmin') {
      // SemiAdmin can only assign (unassigned -> assigned)
      if (job.status !== 'unassigned') {
        return new Response(JSON.stringify({ error: 'SemiAdmin can only assign unassigned jobs' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (userRole === 'technician') {
      // Technician can only update own jobs
      if (job.technician_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Technicians can only update their own jobs' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Technician cannot do unassigned -> assigned
      if (job.status === 'unassigned') {
        return new Response(JSON.stringify({ error: 'Technicians cannot assign jobs' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (userRole === 'viewer') {
      return new Response(JSON.stringify({ error: 'Viewers cannot update jobs' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      status: newStatus,
      timeline: {
        ...job.timeline,
        [`${newStatus}At`]: new Date().toISOString(),
      },
    };

    // Handle QC data
    if (newStatus === 'qc_before' && qcData) {
      updateData.qc_before = qcData;
    }
    if (newStatus === 'qc_after' && qcData) {
      updateData.qc_after = qcData;
    }

    // Handle job timer
    if (newStatus === 'job_started' && jobStartAt) {
      updateData.timeline = {
        ...updateData.timeline as object,
        jobStartAt,
      };
    }
    if (newStatus === 'qc_after' && jobEndAt) {
      updateData.timeline = {
        ...updateData.timeline as object,
        jobEndAt,
      };
    }

    // Handle payment
    if (newStatus === 'completed' && paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    // Handle financials
    if (financials) {
      updateData.service_charge = financials.serviceCharge;
      updateData.parts_cost = financials.partsCost;
      updateData.gst = financials.gst;
    }

    // Update job
    const { data: updatedJob, error: updateError } = await supabaseClient
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update job' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert status history
    await supabaseClient
      .from('status_history')
      .insert({
        job_id: jobId,
        status: newStatus,
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
