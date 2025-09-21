interface ProductImage {
  alt: string | null;
  url: string;
}

interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  handle: string;
  description: string;
  price: string;
  images: ProductImage[];
  available: boolean;
  metadata: Record<string, null>;
  units: number;
}

export type { Product, ProductImage };
