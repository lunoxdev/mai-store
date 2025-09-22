import type { Product } from '../types/product';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link
            href={`/product/${product.handle}`}
            className="group rounded-lg border border-transparent relative h-68 sm:h-96 cursor-pointer overflow-hidden"
        >
            {product.images.length > 0 && (
                <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="rounded-lg absolute inset-0 transition-transform duration-300 group-hover:scale-110 object-cover"
                />
            )}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col z-10 bg-gradient-to-tr from-black to-90% to-transparent p-2 space-y-0.5">
                <p className="text-sm sm:text-base">
                    ₡{parseFloat(product.price)}
                </p>
                <h2 className="text-sm sm:text-lg font-bold tracking-tight truncate">
                    {product.name}
                </h2>
            </div>
        </Link>
    );
}
