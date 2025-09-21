import { notFound } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function Page({ params: resolvedParams }: { params: Promise<{ id: string }> }) {
    const params = await resolvedParams;
    const id = params.id;
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("handle", id)
        .single();

    if (error) {
        console.error("Error fetching product:", error);
        notFound();
    }

    // Fetch related products
    const { data: relatedProducts, error: relatedProductsError } = await supabase
        .from("products")
        .select("*")
        .neq("handle", id) // Exclude the current product
        .limit(3); // Limit to 3 related products

    if (relatedProductsError) {
        console.error("Error fetching related products:", relatedProductsError);
        // Optionally, handle this more gracefully on the frontend
    }

    return (
        <section className="my-5 sm:my-10 w-full max-w-5xl p-3 mx-auto">
            <div className="grid lg:grid-cols-2 gap-6">
                {product.images.length > 0 && (
                    <div className="relative h-[400px] sm:h-[600px] w-full overflow-hidden rounded-lg">
                        <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
                <div className="flex flex-col w-full">
                    <h1 className="text-3xl sm:text-4xl font-bold">{product.name}</h1>
                    <p className="mt-2 text-2xl font-semibold">
                        ₡{parseFloat(product.price)}
                    </p>
                    <p className="mt-4 sm:text-xl">{product.description}</p>
                    {product.units > 0 ? (
                        <p className="mt-2 sm:text-xl text-green-500">
                            Units in stock: {product.units}
                        </p>
                    ) : (
                        <p className="mt-2 text-red-500 sm:text-xl">Out of stock</p>
                    )}
                    <div className="mt-6 flex items-center">
                        <button className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700">
                            Add To Cart
                        </button>
                    </div>
                </div>
            </div>
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="mt-12 mx-auto">
                    <h2 className="text-2xl font-bold">Related Products</h2>
                    <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
                        {relatedProducts.map((relatedProduct: Product) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </section>
            )}
        </section>
    );
}
