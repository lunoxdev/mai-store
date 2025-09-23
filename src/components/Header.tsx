"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import AuthButton from "./auth/AuthButton";

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cartCount } = useCart();

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <header className="flex justify-between items-center p-4 mt-1 sm:mt-5">
            <Link href="/">
                <h1 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text uppercase">
                    M&M Store
                </h1>
            </Link>
            <div className="flex justify-end md:w-1/3">
                <AuthButton />
                <div className="relative cursor-pointer" onClick={openCart}>
                    {/* SVG Shopping icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="44"
                        height="44"
                        viewBox="0 0 256 256"
                        className="h-8 w-8 sm:h-11 sm:w-11 cursor-pointer transition duration-200 ease-in-out hover:scale-110"
                    >
                        <g fill="#e6e6e6">
                            <path
                                d="m231.94 80.93l-14.25 120a8.06 8.06 0 0 1-8 7.07H46.33a8.06 8.06 0 0 1-8-7.07l-14.25-120a8 8 0 0 1 8-8.93h191.84a8 8 0 0 1 8.02 8.93"
                                opacity=".2"
                            />
                            <path d="M236 69.4a16.13 16.13 0 0 0-12.08-5.4H176a48 48 0 0 0-96 0H32.08a16.13 16.13 0 0 0-12 5.4a16 16 0 0 0-3.92 12.48l14.26 120a16 16 0 0 0 16 14.12h163.25a16 16 0 0 0 16-14.12l14.26-120A16 16 0 0 0 236 69.4M128 32a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32m81.76 168a.13.13 0 0 1-.09 0H46.25L32.08 80H80v24a8 8 0 0 0 16 0V80h64v24a8 8 0 0 0 16 0V80h48Z" />
                        </g>
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute top-1 -right-1 bg-gradient-to-br from-pink-500 to-purple-500 text-xs sm:text-sm font-extrabold rounded-full h45 w-4 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </div>
                <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
            </div>
        </header>
    );
}
