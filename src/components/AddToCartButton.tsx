"use client";

import { useCart } from '@/context/CartContext';
import { type Product } from '@/types/product';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(product)}
            className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
        >
            Add To Cart
        </button>
    );
}
