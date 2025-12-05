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

    const userRole = roleData?.role;

    if (!['admin', 'semiadmin'].includes(userRole)) {
      return new Response(JSON.stringify({ error: 'Only admins and semiadmins can create invites' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Missing email or role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SemiAdmins can only invite technicians and viewers
    if (userRole === 'semiadmin' && !['technician', 'viewer'].includes(role)) {
      return new Response(JSON.stringify({ error: 'SemiAdmins can only invite technicians and viewers' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if invite already exists for this email
    const { data: existingInvite } = await supabaseClient
      .from('invites')
      .select('id, used')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .single();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: 'Active invite already exists for this email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create invite
    const { data: invite, error: createError } = await supabaseClient
      .from('invites')
      .insert({
        email: email.toLowerCase(),
        role,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      return new Response(JSON.stringify({ error: 'Failed to create invite' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invite,
      inviteUrl: `${req.headers.get('origin')}/invite?token=${invite.token}`
    }), {
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
