'use client';

import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const productGridRef = useRef<HTMLDivElement>(null);
  const animationPlayed = useRef(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });
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

  useEffect(() => {
    if (products.length > 0 && productGridRef.current && !animationPlayed.current) {
      gsap.fromTo(
        productGridRef.current.children,
        { opacity: 0, y: 50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: "back.out(1.7)" },
      );
      animationPlayed.current = true;
    }
  }, [products]);

  if (loading) {
    return <p className="text-center col-span-full text-base sm:text-xl animate-pulse brightness-110">Loading products...</p>;
  }

  if (error) {
    return <p className="text-center col-span-full text-base sm:text-xl animate-pulse brightness-110 text-red-500">{error}</p>;
  }

  return (
    <main className="flex flex-col items-center">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <section ref={productGridRef} className="mt-2 mb-10 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3">
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
