import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import ProductCard from '../components/ProductCard';

export default async function Home() {
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return <p>Error loading products.</p>;
  }

  return (
    <main className="flex flex-col items-center">
      <section className="my-5 sm:my-10 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 gap-4 p-3">
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
