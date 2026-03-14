import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'buyer' | 'supplier' | 'admin' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else if (data && data.length > 0) {
          // Prioritize: admin > supplier > buyer
          const roles = data.map(r => r.role as UserRole);
          if (roles.includes('admin')) setRole('admin');
          else if (roles.includes('supplier')) setRole('supplier');
          else setRole(roles[0]);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading };
};
