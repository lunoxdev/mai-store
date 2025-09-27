import type { Product } from '../types/product';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ProductCardProps {
    product: Product;
}

const ProductCard = React.forwardRef<HTMLAnchorElement, ProductCardProps>(({ product }, ref) => {
    return (
        <Link
            href={`/product/${product.handle}`}
            className="group rounded-lg border border-transparent relative h-68 sm:h-96 cursor-pointer overflow-hidden"
            ref={ref}
        >
            {product.images.length > 0 && (
                <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-lg absolute inset-0 transition-transform duration-300 group-hover:scale-110 object-cover"
                />
            )}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col z-10 bg-gradient-to-tr from-[#F5F5DC] to-transparent backdrop-blur-xs p-2">
                <p className="text-sm sm:text-lg tracking-tight uppercase ">
                    ₡{parseFloat(product.price)}
                </p>
                <h2 className="text-sm sm:text-lg font-bold tracking-tight truncate uppercase ">
                    {product.name}
                </h2>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
