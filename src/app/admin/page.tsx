"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AddProductForm from "@/components/admin/AddProductForm";
import ProductListTable from "@/components/admin/ProductListTable";

export default function AdminPage() {
    const supabase = createClient();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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

    return (
        <>
            <section className="min-h-screen my-0 sm:my-10 mx-2 px-3 py-4 bg-white/20 backdrop-blur-2xl rounded-xl shadow-2xl">
                <ProductListTable
                    products={filteredProducts}
                    onEdit={() => { }}
                    onDelete={handleDeleteProduct}
                    onProductSaved={fetchProducts}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAddProductClick={() => setIsAddProductModalOpen(true)}
                />
            </section>

            <AddProductForm
                isOpen={isAddProductModalOpen}
                onProductAdded={fetchProducts}
                onClose={() => setIsAddProductModalOpen(false)}
            />
        </>
    );
}
