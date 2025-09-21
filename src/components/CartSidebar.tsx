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
                                                <div className="h-24 w-24 flex-shrink-0 rounded-md relative">
                                                    {product.images.length > 0 && (
                                                        <Image
                                                            src={product.images[0].url}
                                                            alt={product.images[0].alt || product.name}
                                                            width={96}
                                                            height={96}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="absolute top-0 left-0 -mt-3 -ml-3 p-1 text-xl bg-black/30 hover:bg-black rounded-full cursor-pointer"
                                                        onClick={() => removeFromCart(product.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#ffffff" d="M5 5h2v2H5zm4 4H7V7h2zm2 2H9V9h2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2zm2-2v2h-2V9zm2-2v2h-2V7zm0 0V5h2v2z" /></svg>
                                                    </button>
                                                </div>

                                                <div className="ml-4 flex flex-1 flex-col">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                                            <h3>
                                                                <a href={`/product/${product.handle}`}>{product.name}</a>
                                                            </h3>
                                                            <p className="ml-4">₡{parseFloat(product.price) * product.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end mt-2">
                                                        <div className="flex items-center space-x-2 border border-gray-300 rounded-full p-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                                disabled={product.quantity <= 1}
                                                                className="text-gray-400 hover:text-white disabled:opacity-50 px-2 cursor-pointer outline-none disabled:cursor-not-allowed"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                                </svg>
                                                            </button>
                                                            <span className="text-sm font-medium">{product.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                                disabled={product.quantity >= product.units}
                                                                className="text-gray-400 hover:text-white disabled:opacity-50 px-2 cursor-pointer outline-none disabled:cursor-not-allowed"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 dark:border-gray-700">
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <p>Impuestos</p>
                            <p>₡0.00</p>
                        </div>
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mt-2">
                            <p>Envío</p>
                            <p>Calculado al finalizar la compra</p>
                        </div>
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mt-2">
                            <p>Total</p>
                            <p>₡{cartTotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400"></p>
                        <div className="mt-6">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Instrucciones de Pago SINPE Móvil:</h4>
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Realiza tu pago al siguiente número:</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-blue-600 font-semibold text-lg">22222222</span>
                                    <button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText("22222222")}
                                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25A2.25 2.25 0 0113.5 22H6a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 016 5.25h2.25m2.25 11.25H12a2.25 2.25 0 002.25-2.25V9m-7.5 3.75H12m-7.5 3.75h3.75M12 10.5h.008v.008H12V10.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">Una vez realizado el pago, ingresa el número de comprobante:</p>
                                <input
                                    type="text"
                                    placeholder="Número de comprobante"
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <a
                                href="#"
                                className="flex items-center justify-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
                            >
                                Confirmar Pedido y Enviar
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
