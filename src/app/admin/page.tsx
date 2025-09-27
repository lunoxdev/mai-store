"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AddProductForm from "@/components/admin/AddProductForm";
import ProductListTable from "@/components/admin/ProductListTable";
import Image from "next/image";
import { Order } from "@/types/order";

export default function AdminPage() {
    const supabase = createClient();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // For product search
    const [activeAdminTab, setActiveAdminTab] = useState('products');
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderSearchTerm, setOrderSearchTerm] = useState(""); // For order ID search
    const [emailSearchTerm, setEmailSearchTerm] = useState(""); // For user email search

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session) {
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();

                if (error || profile?.role !== "admin") {
                    router.push("/");
                } else {
                    setUserRole(profile.role);
                    fetchProducts();
                }
            } else {
                router.push("/");
            }
            setLoadingAuth(false);
        };
        checkAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
            setSession(currentSession);
            if (currentSession) {
                checkAuth();
            } else {
                router.push("/");
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from("products").select("*");
        if (error) {
            console.error("Error fetching products:", error);
        } else {
            setProducts(data as Product[]);
        }
    };

    // New fetchOrders function
    const fetchOrders = async () => {
        let query = supabase.from('orders').select('*, profiles(email)');

        if (orderSearchTerm) {
            // query = query.filter('id', 'eq', orderSearchTerm);
        }

        if (emailSearchTerm) {
            // query = query.filter('profiles.email', 'ilike', `%${emailSearchTerm}%`);
        }

        const { data, error } = await query.order('order_date', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", JSON.stringify(error, null, 2));
        } else {
            setOrders(data as Order[]);
        }
    };

    useEffect(() => {
        if (activeAdminTab === 'orders' && session && userRole === 'admin') {
            fetchOrders();
        }
    }, [activeAdminTab, session, userRole]);

    const handleDeleteProduct = async (productId: string) => {
        const { error } = await supabase.from("products").delete().eq("id", productId);
        if (error) {
            console.error("Error deleting product:", error);
        } else {
            fetchProducts();
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!session || userRole !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center" />
        );
    }

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrders = orders.filter((order) => {
        const orderIdMatch = order.id.toLowerCase().includes(orderSearchTerm.toLowerCase());
        const emailMatch = (order.profiles?.email || '').toLowerCase().includes(emailSearchTerm.toLowerCase());
        return orderIdMatch && emailMatch;
    });

    return (
        <>
            <section className="min-h-screen my-0 sm:my-10 mx-2 px-3 py-4 bg-white/20 backdrop-blur-2xl rounded-xl shadow-2xl">
                <div className="flex border-b border-gray-700 mb-4">
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeAdminTab === 'products' ? 'border-b-2 border-white' : 'text-gray-400'}`}
                        onClick={() => setActiveAdminTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeAdminTab === 'orders' ? 'border-b-2 border-white' : 'text-gray-400'}`}
                        onClick={() => setActiveAdminTab('orders')}
                    >
                        Orders
                    </button>
                </div>

                {activeAdminTab === 'products' && (
                    <ProductListTable
                        products={filteredProducts}
                        onEdit={() => { }}
                        onDelete={handleDeleteProduct}
                        onProductSaved={fetchProducts}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onAddProductClick={() => setIsAddProductModalOpen(true)}
                    />
                )}

                {activeAdminTab === 'orders' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search by Order ID"
                                value={orderSearchTerm}
                                onChange={(e) => setOrderSearchTerm(e.target.value)}
                                className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                            />
                            <input
                                type="text"
                                placeholder="Search by User Email"
                                value={emailSearchTerm}
                                onChange={(e) => setEmailSearchTerm(e.target.value)}
                                className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                            />
                        </div>
                        {orders.length === 0 ? (
                            <p className="text-center text-gray-400">No orders found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.id.substring(0, 8)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.profiles?.email || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(order.order_date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">₡{order.total_amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <details className="group">
                                                        <summary className="flex items-center cursor-pointer list-none">
                                                            View Items
                                                            <svg className="w-4 h-4 text-gray-400 transform group-open:rotate-180 transition-transform duration-200 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                            </svg>
                                                        </summary>
                                                        <div className="mt-2 p-2 bg-gray-800 rounded-md">
                                                            {order.items.map((item: any, index: number) => (
                                                                <div key={index} className="flex items-center mt-1">
                                                                    {item.image && (
                                                                        <Image
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            width={24}
                                                                            height={24}
                                                                            className="object-cover rounded-sm mr-2"
                                                                        />
                                                                    )}
                                                                    <p className="text-sm">{item.name} (x{item.quantity}) - ₡{parseFloat(item.price) * item.quantity}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <AddProductForm
                isOpen={isAddProductModalOpen}
                onProductAdded={fetchProducts}
                onClose={() => setIsAddProductModalOpen(false)}
            />
        </>
    );
}
