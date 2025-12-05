-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'semiadmin', 'technician', 'viewer');

-- Create job status enum
CREATE TYPE public.job_status AS ENUM (
  'unassigned',
  'assigned', 
  'accepted',
  'waiting',
  'en_route',
  'doorstep',
  'qc_before',
  'job_started',
  'qc_after',
  'invoice',
  'payment',
  'completed'
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create invites table for invite-based role assignment
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_alt_phone TEXT,
  customer_address TEXT NOT NULL,
  customer_location TEXT,
  device_type TEXT NOT NULL,
  device_issue TEXT NOT NULL,
  notes TEXT,
  technician_id UUID REFERENCES public.profiles(id),
  assigned_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  status job_status NOT NULL DEFAULT 'unassigned',
  time_slot TEXT,
  service_charge NUMERIC DEFAULT 0,
  parts_cost NUMERIC DEFAULT 0,
  gst NUMERIC DEFAULT 0,
  total NUMERIC GENERATED ALWAYS AS (service_charge + parts_cost + gst) STORED,
  timeline JSONB DEFAULT '{}'::jsonb,
  qc_before JSONB,
  qc_after JSONB,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create status_history table
CREATE TABLE public.status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  status job_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger function to handle new user signup with invite
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  assigned_role app_role;
BEGIN
  -- Look for valid invite by email
  SELECT * INTO invite_record
  FROM public.invites
  WHERE email = NEW.email
    AND used = false
    AND expires_at > now()
  LIMIT 1;

  IF invite_record IS NOT NULL THEN
    assigned_role := invite_record.role;
    -- Mark invite as used
    UPDATE public.invites SET used = true WHERE id = invite_record.id;
  ELSE
    assigned_role := 'viewer';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for invites
CREATE POLICY "Admins can manage invites"
  ON public.invites FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SemiAdmins can create invites for technicians"
  ON public.invites FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'semiadmin')
    AND role IN ('technician', 'viewer')
  );

CREATE POLICY "Anyone can view invite by token"
  ON public.invites FOR SELECT
  USING (true);

-- RLS Policies for jobs
CREATE POLICY "Admins have full access to jobs"
  ON public.jobs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SemiAdmins can view all jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'semiadmin'));

CREATE POLICY "SemiAdmins can update unassigned jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'semiadmin')
    AND status = 'unassigned'
  );

CREATE POLICY "Technicians can view own jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'technician')
    AND technician_id = auth.uid()
  );

CREATE POLICY "Technicians can update own jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'technician')
    AND technician_id = auth.uid()
  );

CREATE POLICY "Viewers can view all jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'viewer'));

-- RLS Policies for status_history
CREATE POLICY "Authenticated users can view status history"
  ON public.status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert status history"
  ON public.status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.status_history;