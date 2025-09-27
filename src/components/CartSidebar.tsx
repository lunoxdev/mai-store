"use client";

import Image from "next/image";
import GoogleSvg from "@/assets/google.svg";
import WaSvg from "@/assets/wa.svg";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { useRef } from "react";

export default function CartSidebar() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, closeCart, resetAnimationTrigger, removeItemFromCartPermanently, clearCart, activeTab, setActiveTab } = useCart();
    const [session, setSession] = useState<Session | null>(null);
    const supabase = createClient();
    const cartItemRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});
    const [orders, setOrders] = useState<any[]>([]);
    const orderItemRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // Removed useEffect to set activeTab on isCartOpen change

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                // Upsert user email if a new session with a user is established
                if (session?.user?.id && session.user.email) {
                    const userId = session.user.id;
                    const userEmail = session.user.email;

                    supabase.from('profiles')
                        .select('email')
                        .eq('id', userId)
                        .single()
                        .then(async ({ data: profile, error: fetchError }) => {
                            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
                                console.error("Error fetching profile for email update:", fetchError);
                                return;
                            }

                            if (!profile || !profile.email) {
                                // Profile doesn't exist or email is null, so upsert/update it
                                const { error: upsertError } = await supabase
                                    .from('profiles')
                                    .upsert(
                                        {
                                            id: userId,
                                            email: userEmail,
                                        },
                                        { onConflict: 'id' }
                                    );
                                if (upsertError) {
                                    console.error("Error upserting profile with email:", upsertError);
                                }
                            }
                        });
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        cartItems.forEach((item) => {
            const ref = cartItemRefs.current[item.id];
            if (ref && item.animationTrigger === 'added') {
                gsap.fromTo(ref, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.6, onComplete: () => resetAnimationTrigger(item.id) });
            }
            else if (ref && item.animationTrigger === 'removed') {
                gsap.to(ref, { opacity: 0, x: 50, duration: 0.5, onComplete: () => removeItemFromCartPermanently(item.id) });
            }
        });
    }, [cartItems, resetAnimationTrigger, removeItemFromCartPermanently]);

    useEffect(() => {
        if (activeTab === 'history' && orders.length > 0) {
            const elements = Object.values(orderItemRefs.current);

            // Animate elements into view
            gsap.to(elements,
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
            );
        } else if (activeTab !== 'history') {
            // Reset opacity and position when switching away from history tab
            const elementsToReset = Object.values(orderItemRefs.current).filter(Boolean);
            if (elementsToReset.length > 0) {
                gsap.set(elementsToReset, { opacity: 1, y: 0 });
            }
        }
    }, [activeTab, orders]);

    useEffect(() => {
        if (activeTab === 'history' && session) {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, display_id, order_date, total_amount, items')
                    .eq('user_id', session.user.id)
                    .order('order_date', { ascending: false });
                if (error) {
                    console.error("Error fetching orders:", error);
                    setIsLoadingOrders(false);
                } else {
                    setOrders(data);
                    setIsLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab, session, supabase]);

    const handleConfirmOrder = async () => {
        if (!session) {
            console.error("User not logged in.");
            return;
        }

        // First, save the order to the database
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: session.user.id,
                total_amount: cartTotal,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images.length > 0 ? item.images[0].url : null,
                }))
            })
            .select();

        if (orderError) {
            console.error("Error saving order:", orderError);
            return;
        }

        // The ID is automatically generated by Supabase on insert. We need to fetch it to create the display_id.
        const newOrderId = orderData[0]?.id;

        if (!newOrderId) {
            console.error("Error: Order ID not returned after insertion.");
            return;
        }

        const newFormattedOrderId = "M&M-" + newOrderId.substring(0, 8);

        // Update the newly created order with the display_id
        const { error: updateError } = await supabase
            .from('orders')
            .update({ display_id: newFormattedOrderId })
            .eq('id', newOrderId);

        if (updateError) {
            console.error("Error updating order with display_id:", updateError);
            return;
        }

        // Then, send the WhatsApp message
        const phoneNumber = "50672829018"; // WhatsApp number without '+'
        const orderDetails = cartItems
            .map((item) => `${item.name} (x${item.quantity}) - ₡${parseFloat(item.price) * item.quantity}`)
            .join("\n");
        const message = `¡Hola M&M Store! Me gustaría confirmar mi pedido:\n\n${orderDetails}\n\nTotal: ₡${cartTotal}\n\n¡Gracias!`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            message
        )}`;
        window.open(whatsappUrl, "_blank");

        clearCart();
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

    const sidebarClasses = `fixed inset-y-0 right-0 z-50 w-screen max-w-md transform transition-transform duration-500 ease-in-out min-h-dvh ${isCartOpen ? "translate-x-0" : "translate-x-full"
        }`;
    const overlayClasses = `fixed inset-0 z-20 bg-opacity-75 transition-opacity duration-500 ease-in-out min-h-dvh ${isCartOpen ? "opacity-100" : "opacity-0"
        }`;

    return (
        <>
            {isCartOpen && <div className={overlayClasses} onClick={closeCart} />}

            <div className={sidebarClasses}>
                <section className="flex h-full flex-col overflow-y-auto bg-[#171717] text-white">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex items-start justify-between">
                            <div className="flex border-b border-gray-700 w-full">
                                <button
                                    className={`py-2 px-4 text-sm sm:text-lg font-medium outline-none cursor-pointer transition duration-500 ease-in-out ${activeTab === 'cart' ? 'border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setActiveTab('cart')}
                                >
                                    Mi Carrito
                                </button>
                                {session && (
                                    <button
                                        className={`py-2 px-4 text-sm sm:text-lg font-medium outline-none cursor-pointer transition duration-500 ease-in-out ${activeTab === 'history' ? 'border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => setActiveTab('history')}
                                    >
                                        Historial
                                    </button>
                                )}
                            </div>
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

                        {activeTab === 'cart' ? (
                            <div className="mt-8">
                                {cartItems.length === 0 ? (
                                    <p className="text-center text-base sm:text-xl text-gray-400 animate-pulse">Tu carrito está vacío.</p>
                                ) : (
                                    <ul className="-my-6 divide-y divide-gray-700">
                                        {cartItems.map((product) => (
                                            <li key={product.id} className="flex py-6" ref={(el) => { cartItemRefs.current[product.id] = el; }}>
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
                                                                sizes="96px"
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
                        ) : (
                            <div className="mt-8">
                                {isLoadingOrders ? (
                                    <div className="min-h-40 flex items-center justify-center animate-pulse">
                                        Cargando historial..
                                    </div>
                                ) : orders.length === 0 ? (
                                    <p className="text-base sm:text-xl text-center text-gray-400 animate-pulse">No se encontraron órdenes.</p>
                                ) : (
                                    <ul className="-my-6 divide-y divide-gray-700">
                                        {orders.map((order) => (
                                            <li key={order.id} className={`flex flex-col py-6 ${activeTab === 'history' ? 'opacity-0 translate-y-5' : ''}`} ref={(el) => { orderItemRefs.current[order.id] = el; }}>
                                                <details className="group">
                                                    <summary className="flex justify-between items-center cursor-pointer list-none py-2 px-4 rounded-md transition-colors duration-200 outline-none">
                                                        <p className="text-sm sm:text-base font-medium">Orden: {order.display_id || "M&M-" + order.id.substring(0, 8)} - {new Date(order.order_date).toLocaleDateString()}</p>
                                                        <p className="text-green-500 font-bold">₡{order.total_amount}</p>
                                                        <svg className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </summary>
                                                    <div className="mt-2 px-4 py-2">
                                                        {order.items.map((item: any, index: number) => (
                                                            <div key={`${order.id}-${item.id}`} className="flex items-center mt-0 space-y-4">
                                                                {item.image && (
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        width={48}
                                                                        height={48}
                                                                        className="h-14 w-14 object-cover rounded-md mr-4"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium">{item.name} (x{item.quantity})</p>
                                                                    <p className="text-gray-400">₡{parseFloat(item.price) * item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {activeTab === 'cart' && (
                        <div className="px-4 py-6 border-gray-700 border-t">
                            <div className="flex justify-between mt-2 text-base sm:text-xl">
                                <p>Total</p>
                                <p className="text-green-500 font-bold">₡{cartTotal}</p>
                            </div>
                            <div className="mt-6">
                                {session ? (
                                    <button
                                        onClick={handleConfirmOrder}
                                        className="flex items-center justify-center rounded-md px-6 py-3 text-sm sm:text-xl font-semibold bg-gradient-to-br from-green-700 via-green-500 to-green-700 hover:brightness-110 w-full space-x-2 cursor-pointer"
                                    >
                                        <Image
                                            src={WaSvg}
                                            alt="Logo de WhatsApp"
                                            width={24}
                                            height={24}
                                            className="h-6 w-6 mr-2"
                                        />
                                        Enviar Pedido
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleLogin}
                                        className="flex items-center justify-center rounded-md px-6 py-3 text-base sm:text-lg font-medium hover:bg-black border hover:brightness-125 w-full space-x-2 cursor-pointer"
                                    >
                                        <Image
                                            src={GoogleSvg}
                                            alt="Logo G de Google"
                                            width={24}
                                            height={24}
                                            className="h-6 w-6"
                                        />
                                        <span className="text-sm sm:text-base animate-pulse brightness-125">Iniciar sesión para confirmar el pedido</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
