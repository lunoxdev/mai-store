"use client";

import { useCart } from "@/context/CartContext";
import { type Product } from "@/types/product";

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
            className={`border text-sm sm:text-xl px-5 sm:px-6 py-3 sm:py-4 rounded-md hover:bg-black hover:text-white transition duration-300 ease-in-out ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            Add To Cart
        </button>
    );
}
