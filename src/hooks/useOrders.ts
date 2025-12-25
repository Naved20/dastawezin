import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  user_id: string;
  service_id: string | null;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  details: Record<string, unknown> | null;
  notes: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
  expected_delivery_date: string | null;
  services?: {
    id: string;
    name: string;
    category: string;
    price: number;
    icon: string | null;
  } | null;
}

export interface OrderWithProfile extends Order {
  profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  created_at: string | null;
}

export const useUserOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (id, name, category, price, icon)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      // First get orders with services
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          services (id, name, category, price, icon)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Then get profiles for each order
      const userIds = [...new Set(orders.map(o => o.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge profiles with orders
      const ordersWithProfiles = orders.map(order => ({
        ...order,
        profiles: profiles?.find(p => p.id === order.user_id) || null,
      }));

      return ordersWithProfiles as OrderWithProfile[];
    },
  });
};

export const useOrderDocuments = (orderId: string) => {
  return useQuery({
    queryKey: ['order-documents', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_documents')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderDocument[];
    },
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderData: {
      service_id: string;
      details?: Record<string, string>;
      notes?: string;
      total_amount?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          service_id: orderData.service_id,
          details: orderData.details ? JSON.parse(JSON.stringify(orderData.details)) : null,
          notes: orderData.notes || null,
          total_amount: orderData.total_amount || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
  });
};

export const useUpdateOrderDeliveryDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, date }: { orderId: string; date: string | null }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ expected_delivery_date: date })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};
