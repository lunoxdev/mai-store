'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { type Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import { gsap } from 'gsap';
import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[] | null;
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const [isImageEnlarged, setIsImageEnlarged] = useState<boolean>(false);
    const imageRef = useRef(null);
    const detailsRef = useRef(null);
    const addToCartRef = useRef(null);
    const relatedProductsRefs = useRef<Array<HTMLAnchorElement | null>>([]);

    useEffect(() => {
        if (imageRef.current) {
            gsap.fromTo(imageRef.current,
                { opacity: 0, x: -50 },
                { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
            );
        }
        if (detailsRef.current) {
            gsap.fromTo(detailsRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
            );
        }
        if (addToCartRef.current) {
            gsap.fromTo(addToCartRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.4 }
            );
        }
        if (relatedProductsRefs.current && relatedProductsRefs.current.length > 0) {
            gsap.fromTo(relatedProductsRefs.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.8, stagger: 0.2 }
            );
        }
    }, [relatedProducts]);

    const toggleImageEnlargement = () => {
        setIsImageEnlarged(!isImageEnlarged);
    };

    return (
        <section className="my-0 sm:my-10 w-full p-3 mx-auto">
            <div className="grid lg:grid-cols-2 gap-6">
                {product.images.length > 0 && (
                    <div
                        className="relative h-[350px] sm:h-[600px] w-full overflow-hidden rounded-lg cursor-pointer p-[1px] backdrop-blur-3xl"
                        onClick={toggleImageEnlargement}
                        ref={imageRef}
                    >
                        <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,theme(colors.black)_0%,theme(colors.white)_50%,theme(colors.black)_100%)]' />
                        <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            priority
                            fill
                            className="object-cover w-full h-full inline-flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium text-gray-50 backdrop-blur-3xl"
                        />
                    </div>
                )}
                <div className="flex flex-col w-full" ref={detailsRef}>
                    <h1 className="text-3xl sm:text-4xl font-bold">{product.name}</h1>
                    <p className="mt-2 text-2xl font-semibold">
                        ₡{parseFloat(product.price)}
                    </p>
                    <p className="mt-4 sm:text-xl">{product.description}</p>
                    {product.units > 0 ? (
                        <p className="mt-2 sm:text-xl text-green-500 font-semibold">
                            Unidades en stock: {product.units}
                        </p>
                    ) : (
                        <p className="mt-2 text-red-500 sm:text-xl">Agotado</p>
                    )}
                    <div className="mt-3 sm:mt-6 flex items-center" ref={addToCartRef}>
                        <AddToCartButton product={product} />
                    </div>
                </div>
            </div>
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="mt-12 mx-auto">
                    <h2 className="text-2xl font-bold">Productos Relacionados</h2>
                    <div className="mt-6">
                        <InfiniteMovingCards
                            items={relatedProducts.map(product => ({
                                id: product.id, // Add product ID
                                quote: product.description || "",
                                name: product.name,
                                title: `₡${parseFloat(product.price).toFixed(2)}`,
                                image: product.images[0]?.url || "", // Add image URL
                                handle: product.handle, // Add product handle
                            }))}
                            direction="left"
                            speed="slow"
                            pauseOnHover={true}
                            className=""
                        />
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
