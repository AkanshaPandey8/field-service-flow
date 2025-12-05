import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Technician {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      // Get all users with technician role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'technician');

      if (roleData && roleData.length > 0) {
        const techIds = roleData.map((r) => r.user_id);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', techIds);

        if (profiles) {
          setTechnicians(profiles);
        }
      }
      setLoading(false);
    };

    fetchTechnicians();
  }, []);

  return { technicians, loading };
}
