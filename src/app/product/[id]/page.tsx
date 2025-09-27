import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductDetailClient from "@/components/ProductDetailClient";

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
        .limit(20); // Limit to 20 related products

    if (relatedProductsError) {
        console.error("Error fetching related products:", relatedProductsError);
    }

    return (
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    );
}
