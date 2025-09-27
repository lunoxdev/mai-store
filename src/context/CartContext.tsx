"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Product } from '@/types/product';

interface CartItem extends Product {
    quantity: number;
    animationTrigger?: 'added' | 'removed' | null;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    getProductQuantity: (productId: string) => number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    resetAnimationTrigger: (productId: string) => void;
    removeItemFromCartPermanently: (productId: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('cart');

    const openCart = () => {
        setIsCartOpen(true);
        setActiveTab('cart');
    };
    const closeCart = () => setIsCartOpen(false);

    useEffect(() => {
        const storedCartItems = localStorage.getItem('cartItems');
        if (storedCartItems) {
            setCartItems(JSON.parse(storedCartItems));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                // Check if adding one more would exceed stock
                if (existingItem.quantity >= product.units) {
                    return prevItems; // Do not update cart if stock limit is reached
                }
                // If item exists and can be added, update quantity
                const updatedItems = prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1, animationTrigger: null } : item
                );
                openCart(); // Open cart sidebar when item is added or quantity updated
                return updatedItems;
            } else {
                // Check if product is in stock before adding new
                if (product.units <= 0) {
                    return prevItems; // Do not add if out of stock
                }
                // Add new item to cart
                openCart(); // Open cart sidebar when new item is added
                return [...prevItems, { ...product, quantity: 1, animationTrigger: 'added' as const }];
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, animationTrigger: 'removed' as const } : item
            )
        );
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(1, quantity), animationTrigger: null } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    const getProductQuantity = (productId: string) => {
        const item = cartItems.find((item) => item.id === productId);
        return item ? item.quantity : 0;
    };

    const resetAnimationTrigger = (productId: string) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, animationTrigger: null } : item
            )
        );
    };

    const removeItemFromCartPermanently = (productId: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                getProductQuantity,
                isCartOpen,
                openCart,
                closeCart,
                resetAnimationTrigger,
                removeItemFromCartPermanently,
                activeTab,
                setActiveTab,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context as CartContextType;
};
