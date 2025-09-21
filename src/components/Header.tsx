"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cartCount } = useCart();

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <header className="flex justify-between items-center p-4">
            <Link href="/">
                <h1 className="text-2xl font-bold">Mai Store</h1>
            </Link>
            <div className="relative cursor-pointer" onClick={openCart}>
                {/* SVG Shopping icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 256 256"
                    className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer transition duration-200 ease-in-out hover:scale-110"
                >
                    <path
                        fill="#ffffff"
                        d="M236 69.4a16.13 16.13 0 0 0-12.08-5.4H176a48 48 0 0 0-96 0H32.08a16.13 16.13 0 0 0-12 5.4a16 16 0 0 0-3.92 12.48l14.26 120a16 16 0 0 0 16 14.12h163.25a16 16 0 0 0 16-14.12l14.26-120A16 16 0 0 0 236 69.4M96 104a8 8 0 0 1-16 0V88a8 8 0 0 1 16 0Zm32-72a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32m48 72a8 8 0 0 1-16 0V88a8 8 0 0 1 16 0Z"
                    />
                </svg>
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-xs sm:text-sm font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </div>
            <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
        </header>
    );
}
