import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomField {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: 'printing' | 'certificates' | 'bills' | 'mp_online';
  price: number;
  is_active: boolean | null;
  icon: string | null;
  created_at: string | null;
  updated_at: string | null;
  custom_fields: unknown;
  price_per_copy: boolean | null;
  show_upload_section: boolean | null;
  show_completed_section: boolean | null;
}

export const parseCustomFields = (fields: unknown): CustomField[] | null => {
  if (!fields) return null;
  if (Array.isArray(fields)) {
    return fields as CustomField[];
  }
  return null;
};

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useAllServices = () => {
  return useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};
