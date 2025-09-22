"use client";

import { useCart } from '@/context/CartContext';
import { type Product } from '@/types/product';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart, getProductQuantity } = useCart();

    const currentQuantity = getProductQuantity(product.id);
    const isDisabled = currentQuantity >= product.units;

    return (
        <button
            onClick={() => addToCart(product)}
            disabled={isDisabled}
            className={`flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
            Add To Cart
        </button>
    );
}
