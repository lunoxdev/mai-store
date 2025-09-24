'use client';

import { useState } from 'react';
import Image from 'next/image';
import { type Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[] | null;
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const [isImageEnlarged, setIsImageEnlarged] = useState(false);

    const toggleImageEnlargement = () => {
        setIsImageEnlarged(!isImageEnlarged);
    };

    return (
        <section className="my-5 sm:my-10 w-full p-3 mx-auto">
            <div className="grid lg:grid-cols-2 gap-6">
                {product.images.length > 0 && (
                    <div
                        className="relative h-[450px] sm:h-[600px] w-full overflow-hidden rounded-lg cursor-pointer p-[1px] backdrop-blur-3xl"
                        onClick={toggleImageEnlargement}
                    >
                        <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,theme(colors.black)_0%,theme(colors.white)_50%,theme(colors.black)_100%)]' />
                        <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-cover w-full h-full inline-flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium text-gray-50 backdrop-blur-3xl"
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
                        <p className="mt-2 sm:text-xl text-green-500 font-semibold">
                            Units in stock: {product.units}
                        </p>
                    ) : (
                        <p className="mt-2 text-red-500 sm:text-xl">Out of stock</p>
                    )}
                    <div className="mt-6 flex items-center">
                        <AddToCartButton product={product} />
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

            {/* Zoom Image */}
            {isImageEnlarged && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={toggleImageEnlargement}
                >
                    <div className="relative h-full w-[90%] sm:h-[90%] sm::w-[70%]">
                        <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
