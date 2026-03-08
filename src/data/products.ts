import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';

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

export const products: Product[] = [
  {
    id: '1',
    name: 'Milano Noir',
    slug: 'milano-noir',
    description: 'Crafted from premium Italian full-grain leather, the Milano Noir embodies the essence of understated luxury. Every stitch tells a story of Milanese craftsmanship passed down through generations.',
    brand: 'Silvaine',
    sku: 'SLV-MN-001',
    category: 'Classic',
    price: 485,
    stock: 24,
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: [{ name: 'Noir', hex: '#1a1a1a' }],
    images: [product1],
    rating: 4.9,
    reviewCount: 127,
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Bianco Puro',
    slug: 'bianco-puro',
    description: 'The Bianco Puro is a testament to minimalist elegance. Clean lines meet premium white calfskin leather, creating a silhouette that transcends seasons and trends.',
    brand: 'Silvaine',
    sku: 'SLV-BP-002',
    category: 'Minimal',
    price: 520,
    discountPrice: 445,
    stock: 18,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [{ name: 'White', hex: '#F5F5F5' }],
    images: [product2],
    rating: 4.8,
    reviewCount: 89,
    isNew: true,
  },
  {
    id: '3',
    name: 'Grigio Suede',
    slug: 'grigio-suede',
    description: 'Luxurious Italian suede meets contemporary design in the Grigio. Soft to the touch yet built to endure, this sneaker is the epitome of casual sophistication.',
    brand: 'Silvaine',
    sku: 'SLV-GS-003',
    category: 'Suede',
    price: 460,
    stock: 31,
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    colors: [{ name: 'Grey', hex: '#808080' }],
    images: [product3],
    rating: 4.7,
    reviewCount: 64,
    isTrending: true,
  },
  {
    id: '4',
    name: 'Blu Notte',
    slug: 'blu-notte',
    description: 'Inspired by the deep Mediterranean night sky, the Blu Notte features hand-dyed navy leather with subtle tonal stitching. A masterpiece of color and craft.',
    brand: 'Silvaine',
    sku: 'SLV-BN-004',
    category: 'Classic',
    price: 510,
    stock: 12,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: [{ name: 'Navy', hex: '#1B2838' }],
    images: [product4],
    rating: 4.9,
    reviewCount: 42,
    isBestSeller: true,
  },
  {
    id: '5',
    name: 'Cognac Classico',
    slug: 'cognac-classico',
    description: 'Rich cognac-toned leather ages beautifully with time, developing a unique patina that makes each pair truly one of a kind. Heritage meets modern luxury.',
    brand: 'Silvaine',
    sku: 'SLV-CC-005',
    category: 'Heritage',
    price: 545,
    discountPrice: 475,
    stock: 8,
    sizes: ['40', '41', '42', '43', '44'],
    colors: [{ name: 'Cognac', hex: '#8B4513' }],
    images: [product5],
    rating: 4.8,
    reviewCount: 56,
    isTrending: true,
  },
  {
    id: '6',
    name: 'Avorio Alto',
    slug: 'avorio-alto',
    description: 'The Avorio Alto elevates the classic silhouette with a sculpted platform sole. Bold architecture meets refined materials in this statement piece.',
    brand: 'Silvaine',
    sku: 'SLV-AA-006',
    category: 'Platform',
    price: 580,
    stock: 15,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: [{ name: 'Ivory', hex: '#FFFFF0' }],
    images: [product6],
    rating: 4.6,
    reviewCount: 33,
    isNew: true,
  },
];

export const categories = ['All', 'Classic', 'Minimal', 'Suede', 'Heritage', 'Platform'];
