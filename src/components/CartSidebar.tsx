"use client";

import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    const sidebarClasses = `fixed inset-y-0 right-0 z-50 w-screen max-w-md bg-white shadow-xl transform transition-transform duration-500 ease-in-out dark:bg-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
    const overlayClasses = `fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`;

    return (
        <>
            {isOpen && <div className={overlayClasses} onClick={onClose} />}

            <div className={sidebarClasses}>
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-gray-800">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                My Cart
                            </h2>
                            <div className="ml-3 flex h-7 items-center">
                                <button
                                    type="button"
                                    className="-m-2 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close panel</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flow-root">
                                {cartItems.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                                ) : (
                                    <ul role="list" className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                                        {cartItems.map((product) => (
                                            <li key={product.id} className="flex py-6">
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                                    {product.images.length > 0 && (
                                                        <Image
                                                            src={product.images[0].url}
                                                            alt={product.images[0].alt || product.name}
                                                            width={96}
                                                            height={96}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    )}
                                                </div>

                                                <div className="ml-4 flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                                            <h3>
                                                                <a href={`/product/${product.handle}`}>{product.name}</a>
                                                            </h3>
                                                            <p className="ml-4">₡{parseFloat(product.price) * product.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                        <p className="text-gray-500 dark:text-gray-400">Qty <input
                                                            type="number"
                                                            value={product.quantity}
                                                            onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                                                            className="w-12 text-center border rounded-md dark:bg-gray-700 dark:text-white"
                                                        /></p>

                                                        <div className="flex">
                                                            <button
                                                                type="button"
                                                                className="font-medium text-blue-600 hover:text-blue-500"
                                                                onClick={() => removeFromCart(product.id)}
                                                            >
                                                                Remove
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
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 dark:border-gray-700">
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <p>Subtotal</p>
                            <p>₡{cartTotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Shipping and taxes calculated at checkout.</p>
                        <div className="mt-6">
                            <a
                                href="#"
                                className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                            >
                                Checkout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
