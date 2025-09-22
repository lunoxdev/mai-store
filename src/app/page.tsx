'use client';

import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useState, useEffect } from 'react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
        setError('Error loading products.');
      } else {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <p className="text-center col-span-full text-base sm:text-xl animate-pulse brightness-110">Loading products...</p>;
  }

  if (error) {
    return <p className="text-center col-span-full text-base sm:text-xl animate-pulse brightness-110 text-red-500">{error}</p>;
  }

  return (
    <main className="flex flex-col items-center">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <section className="my-5 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 gap-4 p-3">
        {products
          ?.filter((product: Product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        {products?.filter((product: Product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ).length === 0 && ( /* This will only show if there are no search results and there are products in Supabase */
            <p className="text-center col-span-full text-base sm:text-xl animate-pulse brightness-110">No products found</p>
          )}
      </section>
    </main>
  );
}
