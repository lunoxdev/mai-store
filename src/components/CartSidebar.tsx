"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export default function CartSidebar() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, closeCart } = useCart();
    const [session, setSession] = useState<Session | null>(null);
    const supabase = createClient();
    const [comprobanteNumber, setComprobanteNumber] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleConfirmOrder = () => {
        const phoneNumber = "50672829018"; // WhatsApp number without '+'
        const orderDetails = cartItems
            .map((item) => `${item.name} (x${item.quantity}) - ₡${parseFloat(item.price) * item.quantity}`)
            .join("\n");
        const message = `¡Hola! Me gustaría confirmar mi pedido:\n\n${orderDetails}\n\nTotal: ₡${cartTotal}\nNúmero de Comprobante: ${comprobanteNumber}\n\n¡Gracias!`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            message
        )}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            console.error("Error logging in with Google:", error);
        }
    };

    const sidebarClasses = `fixed inset-y-0 right-0 z-50 w-screen max-w-md transform transition-transform duration-500 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"
        }`;
    const overlayClasses = `fixed inset-0 z-20 bg-opacity-75 transition-opacity duration-500 ease-in-out ${isCartOpen ? "opacity-100" : "opacity-0"
        }`;

    return (
        <>
            {isCartOpen && <div className={overlayClasses} onClick={closeCart} />}

            <div className={sidebarClasses}>
                <section className="flex h-full flex-col overflow-y-auto bg-[#171717] text-white">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-medium">My Cart</h2>
                            <div className="ml-3 flex h-7 items-center hover:scale-110 outline-none">
                                <button
                                    type="button"
                                    className="-m-2 p-2 px-2 cursor-pointer outline-none"
                                    onClick={closeCart}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="#ffffff"
                                            d="M5 5h2v2H5zm4 4H7V7h2zm2 2H9V9h2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2zm2-2v2h-2V9zm2-2v2h-2V7zm0 0V5h2v2z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            {cartItems.length === 0 ? (
                                <p className="text-center text-gray-400">Your cart is empty.</p>
                            ) : (
                                <ul className="-my-6 divide-y divide-gray-700">
                                    {cartItems.map((product) => (
                                        <li key={product.id} className="flex py-6">
                                            <div className="h-24 w-24 flex-shrink-0 relative">
                                                {product.images.length > 0 && (
                                                    <div
                                                        className="relative h-full w-full overflow-hidden rounded-lg cursor-pointer p-[0.5px] backdrop-blur-3xl"
                                                    >
                                                        <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,theme(colors.black)_0%,theme(colors.white)_50%,theme(colors.black)_100%)]' />
                                                        <Image
                                                            src={product.images[0].url}
                                                            alt={product.images[0].alt || product.name}
                                                            fill
                                                            className="object-cover w-full h-full inline-flex items-center justify-center rounded-md p-1"
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="absolute top-0 left-0 -mt-3 -ml-3 p-1 text-xl bg-black/30 hover:bg-black rounded-full cursor-pointer"
                                                    onClick={() => removeFromCart(product.id)}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fill="#ffffff"
                                                            d="M5 5h2v2H5zm4 4H7V7h2zm2 2H9V9h2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2zm2-2v2h-2V9zm2-2v2h-2V7zm0 0V5h2v2z"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div className="flex-1">
                                                    <div className="flex justify-between font-medium">
                                                        <h3>
                                                            <a href={`/product/${product.handle}`} className="font-bold tracking-tight">
                                                                {product.name}
                                                            </a>
                                                        </h3>
                                                        <p className="text-white/90">
                                                            ₡{parseFloat(product.price) * product.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <div className="flex items-center space-x-2 border border-gray-300 rounded-full p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(product.id, product.quantity - 1)
                                                            }
                                                            disabled={product.quantity <= 1}
                                                            className="text-gray-400 hover:text-white disabled:opacity-50 px-2 cursor-pointer outline-none disabled:cursor-not-allowed"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-4 h-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19.5 12h-15"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <span className="text-sm font-medium">
                                                            {product.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(product.id, product.quantity + 1)
                                                            }
                                                            disabled={product.quantity >= product.units}
                                                            className="text-gray-400 hover:text-white disabled:opacity-50 px-2 cursor-pointer outline-none disabled:cursor-not-allowed"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-4 h-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 4.5v15m7.5-7.5h-15"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-6 border-gray-700 border-t">
                        <div className="flex justify-between mt-2 text-base sm:text-xl">
                            <p>Total</p>
                            <p className="text-green-500 font-bold">₡{cartTotal}</p>
                        </div>
                        <div className="mt-6">
                            <div className="bg-black p-4 rounded-md">
                                <h4 className="text-lg">Pago SINPE Móvil:</h4>
                                <div className="flex items-center mt-2">
                                    <span className="font-semibold text-xl">22222222</span>
                                    <button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText("22222222")}
                                        className="ml-3 hover:scale-110 cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fill="#cccccc"
                                                d="M0 2.729V2a1 1 0 0 1 1-1h2v1H1v12h4v1H1a1 1 0 0 1-1-1zM12 5V2a1 1 0 0 0-1-1H9v1h2v3zm-1 1h2v9H6V6zV5H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2z"
                                            />
                                            <path
                                                fill="#cccccc"
                                                d="M7 10h5V9H7zm0-2h5V7H7zm0 4h5v-1H7zm0 2h5v-1H7zM9 2V1a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1h1V1h4v1zM3 3h6V2H3z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <p className="mt-4 text-sm text-gray-300">
                                    Una vez realizado el pago, ingresa el número de comprobante:
                                </p>
                                <input
                                    type="text"
                                    placeholder="Número de comprobante"
                                    className="mt-2 w-full p-2 rounded-md border bg-gray-800/40 border-gray-600 outline-none"
                                    value={comprobanteNumber}
                                    onChange={(e) => setComprobanteNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            {session ? (
                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={!comprobanteNumber.trim()}
                                    className="flex items-center justify-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Pedido y Enviar
                                </button>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 w-full"
                                >
                                    Iniciar sesión para confirmar el pedido
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
