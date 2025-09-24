"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import AuthButton from "./auth/AuthButton";
import Image from "next/image";
import shoppinBag from "@/assets/shopping-cart.svg"

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cartCount } = useCart();

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <header className="flex justify-between items-center p-3 sm:p-2 mt-1 sm:mt-5">
            <Link href="/">
                <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-gray-800 via-gray-500 to-gray-800 text-transparent bg-clip-text uppercase">
                    M&M Store
                </h1>
            </Link>
            <div className="flex justify-end md:w-1/3">
                <AuthButton />
                <div className="relative cursor-pointer" onClick={openCart}>
                    {/* Shopping icon */}
                    <Image
                        src={shoppinBag}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="h-12 sm:h-16 w-12 sm:w-16 rounded-full shrink-0 object-cover hover:scale-110 transition duration-300 ease-in-out"
                    />
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-1 text-white bg-gradient-to-br from-pink-500 to-purple-500 text-xs sm:text-sm font-extrabold rounded-full w-4 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </div>
                <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
            </div>
        </header>
    );
}
