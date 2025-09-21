import type { Product } from '../types/product';
import Image from 'next/image';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group rounded-lg border border-transparent relative h-48 sm:h-60 cursor-pointer overflow-hidden">
            {product.images.length > 0 && (
                <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="rounded-lg absolute inset-0 transition-transform duration-300 group-hover:scale-110 object-cover"
                />
            )}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-2 z-10 rounded-full border bg-white/50 p-0.5 text-xs sm:text-sm font-semibold text-black backdrop-blur-md">
                <h2 className="min-w-0 line-clamp-2 grow pl-2 leading-none tracking-tight truncate">
                    {product.name}
                </h2>
                <p className="flex-none rounded-full bg-blue-600 p-2 text-white shrink-0">
                    ₡{parseFloat(product.price)}
                </p>
            </div>
        </div>
    );
}
