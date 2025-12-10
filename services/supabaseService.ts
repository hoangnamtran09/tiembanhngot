import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database Types
export interface SupabaseIngredient {
  id: string;
  name: string;
  unit: string;
  price: number;
  buying_quantity: number;
  current_stock: number;
  min_threshold: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  selling_price: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseRecipeItem {
  id?: number;
  product_id: string;
  ingredient_id: string;
  quantity: number;
}

export interface SupabaseOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  deadline: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseOrderItem {
  id?: number;
  order_id: string;
  product_id: string;
  quantity: number;
}

// Supabase Client Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase URL hoặc Anon Key chưa được cấu hình trong .env.local');
  console.error('Vui lòng tạo file .env.local và thêm:');
  console.error('VITE_SUPABASE_URL=your-project-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Check connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('ingredients').select('count').limit(1);
    if (error) {
      console.error('Lỗi kết nối Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Không thể kết nối Supabase:', err);
    return false;
  }
};

