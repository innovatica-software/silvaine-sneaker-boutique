import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  sku: string | null;
  category_id: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_trending: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { name: string; slug: string } | null;
  images: { url: string; alt_text: string | null; sort_order: number }[];
}

// Map DB product to the shape used by components
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
}

const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description || '',
  brand: p.brand,
  sku: p.sku || '',
  category: p.categories?.name || 'Uncategorized',
  price: Number(p.price),
  discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
  stock: p.stock,
  sizes: p.sizes || [],
  colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : (p.colors || []),
  images: p.product_images && p.product_images.length > 0
    ? p.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => img.url)
    : ['/placeholder.svg'],
  rating: Number(p.rating),
  reviewCount: p.review_count,
  isNew: p.is_new,
  isBestSeller: p.is_best_seller,
  isTrending: p.is_trending,
});

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_images(url, alt_text, sort_order)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapProduct);
};

const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_images(url, alt_text, sort_order)')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return mapProduct(data);
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};
