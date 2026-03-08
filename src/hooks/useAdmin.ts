import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      if (error) return false;
      return data === true;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as {
        total_products: number;
        total_orders: number;
        total_revenue: number;
        total_customers: number;
        low_stock_products: number;
        pending_orders: number;
        recent_orders: any[] | null;
      };
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), product_images(url, sort_order)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAdminCustomers = () => {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAdminReviews = () => {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};
