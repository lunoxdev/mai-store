// TODO: Segment the code
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { ProductImage } from "@/types/product";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminPage() {
    const supabase = createClient();
    const router = useRouter(); // Initialize useRouter
    const [products, setProducts] = useState<Product[]>([]);
    const [newProductName, setNewProductName] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("");
    const [newProductDescription, setNewProductDescription] = useState("");
    const [newProductUnits, setNewProductUnits] = useState("");
    const [newProductImages, setNewProductImages] = useState<File[]>([]); // Changed to File[]
    const [newProductAvailable, setNewProductAvailable] = useState<boolean>(true); // New state for availability

    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editedProductName, setEditedProductName] = useState("");
    const [editedProductPrice, setEditedProductPrice] = useState("");
    const [editedProductDescription, setEditedProductDescription] = useState("");
    const [editedProductUnits, setEditedProductUnits] = useState("");
    const [editedProductImages, setEditedProductImages] = useState<ProductImage[]>([]); // Remains ProductImage[] for existing images
    const [editedNewImages, setEditedNewImages] = useState<File[]>([]); // For new images during edit
    const [editedProductAvailable, setEditedProductAvailable] = useState<boolean>(true); // New state for availability

    const [session, setSession] = useState<Session | null>(null); // State for session
    const [userRole, setUserRole] = useState<string | null>(null); // State for user role
    const [loadingAuth, setLoadingAuth] = useState(true); // State for authentication loading

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
                    router.push("/"); // Redirect to home if not admin or error fetching role
                } else {
                    setUserRole(profile.role);
                    fetchProducts();
                }
            } else {
                router.push("/"); // Redirect to home if no session
            }
            setLoadingAuth(false);
        };
        checkAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
            setSession(currentSession);
            if (currentSession) {
                checkAuth(); // Re-check auth on state change
            } else {
                router.push("/"); // Redirect if logged out
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

    const handleAddProduct = async () => {
        const uploadedImages: ProductImage[] = [];

        for (const imageFile of newProductImages) {
            const { data, error } = await supabase.storage
                .from("product-images")
                .upload(`${Date.now()}_${imageFile.name}`, imageFile, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                console.error("Error uploading image:", error.message);
                return; // Stop if any upload fails
            }

            const { data: publicUrlData } = supabase.storage
                .from("product-images")
                .getPublicUrl(data.path);

            uploadedImages.push({ url: publicUrlData.publicUrl, alt: newProductName, path: data.path });
        }

        const { error } = await supabase.from("products").insert({
            name: newProductName,
            handle: newProductName.toLowerCase().replace(/\s+/g, '-'), // Automatically generate handle
            price: parseFloat(newProductPrice || '0'),
            description: newProductDescription,
            units: parseInt(newProductUnits || '0'),
            images: uploadedImages,
            available: newProductAvailable,
        });
        if (error) {
            console.error("Error adding product:", error.message);
        } else {
            setNewProductName("");
            setNewProductPrice("");
            setNewProductDescription("");
            setNewProductUnits("");
            setNewProductImages([]);
            setNewProductAvailable(true);
            fetchProducts();
        }
    };

    const handleAddNewImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewProductImages([...newProductImages, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveImageFromNewProduct = (index: number) => {
        setNewProductImages(newProductImages.filter((_, i) => i !== index));
    };

    const handleDeleteProduct = async (productId: string) => {
        const { error } = await supabase.from("products").delete().eq("id", productId);
        if (error) {
            console.error("Error deleting product:", error);
        } else {
            fetchProducts();
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProductId(product.id);
        setEditedProductName(product.name);
        setEditedProductPrice(product.price);
        setEditedProductDescription(product.description);
        setEditedProductUnits(product.units.toString());
        setEditedProductImages(product.images || []);
        setEditedNewImages([]); // Reset new images when starting edit
        setEditedProductAvailable(product.available);
    };

    const handleAddNewImageFileToEditedProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEditedNewImages([...editedNewImages, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveImageFromEditedProduct = async (index: number, isNew: boolean) => {
        if (isNew) {
            setEditedNewImages(editedNewImages.filter((_, i) => i !== index));
        } else {
            const imageToRemove = editedProductImages[index];
            if (imageToRemove && imageToRemove.path) {
                const { error } = await supabase.storage.from("product-images").remove([imageToRemove.path]);
                if (error) {
                    console.error("Error deleting image from storage:", error);
                } else {
                    setEditedProductImages(editedProductImages.filter((_, i) => i !== index));
                }
            }
        }
    };

    const handleSaveProduct = async (productId: string) => {
        const uploadedImages: ProductImage[] = [];

        for (const imageFile of editedNewImages) {
            const { data, error } = await supabase.storage
                .from("product-images")
                .upload(`${Date.now()}_${imageFile.name}`, imageFile, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                console.error("Error uploading new image:", error.message);
                return; // Stop if any upload fails
            }

            const { data: publicUrlData } = supabase.storage
                .from("product-images")
                .getPublicUrl(data.path);

            uploadedImages.push({ url: publicUrlData.publicUrl, alt: editedProductName, path: data.path });
        }

        const { data: currentProduct, error: fetchError } = await supabase.from("products").select("name, handle").eq("id", productId).single();

        if (fetchError) {
            console.error("Error fetching current product for handle check:", fetchError.message);
            return;
        }

        let productHandle = currentProduct?.handle;
        if (editedProductName !== currentProduct?.name) {
            // Only generate new handle if name has changed
            let baseHandle = editedProductName.toLowerCase().replace(/\s+/g, '-');
            // Check if this new handle already exists for another product
            const { data: existingProducts, error: existingHandleError } = await supabase.from("products").select("id").eq("handle", baseHandle);

            if (existingHandleError) {
                console.error("Error checking for existing handle:", existingHandleError.message);
                return;
            }

            if (existingProducts && existingProducts.length > 0 && existingProducts[0].id !== productId) {
                // If handle exists and belongs to a different product, append part of the ID for uniqueness
                baseHandle = `${baseHandle}-${productId.substring(0, 8)}`; // Use first 8 chars of UUID
            }
            productHandle = baseHandle;
        }

        const { error } = await supabase
            .from("products")
            .update({
                name: editedProductName,
                handle: productHandle,
                price: parseFloat(editedProductPrice || '0'),
                description: editedProductDescription,
                units: parseInt(editedProductUnits || '0'),
                images: [...editedProductImages, ...uploadedImages],
                available: editedProductAvailable,
            })
            .eq("id", productId);
        if (error) {
            console.error("Error updating product:", error.message);
        } else {
            setEditingProductId(null);
            setEditedProductName("");
            setEditedProductPrice("");
            setEditedProductDescription("");
            setEditedProductUnits("");
            setEditedProductImages([]);
            setEditedNewImages([]);
            setEditedProductAvailable(true);
            fetchProducts();
        }
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setEditedProductName("");
        setEditedProductPrice("");
        setEditedProductDescription("");
        setEditedProductUnits("");
        setEditedProductImages([]);
        setEditedNewImages([]);
        setEditedProductAvailable(true);
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

    return (
        <div className="container mx-auto p-4 bg-neutral-950 min-h-screen text-white">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Admin Dashboard</h1>

            <div className="mb-12 p-6 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-700">
                <h2 className="text-3xl font-bold mb-6 text-white text-center">Add New Product</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    />
                    <textarea
                        placeholder="Description"
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                        className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 md:col-span-2"
                        rows={3}
                    ></textarea>
                    <input
                        type="number"
                        placeholder="Units"
                        value={newProductUnits}
                        onChange={(e) => setNewProductUnits(e.target.value)}
                        className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    />
                    <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 md:col-span-2">
                        <label className="block text-white text-base font-medium min-w-[120px]" htmlFor="new-product-images">
                            Upload Images:
                        </label>
                        <input
                            type="file"
                            id="new-product-images"
                            multiple
                            onChange={handleAddNewImageFile}
                            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                            accept="image/*"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 md:col-span-2">
                        {newProductImages.map((imageFile, index) => (
                            <div key={index} className="flex items-center bg-neutral-700 rounded-full pl-3 pr-2 py-1 space-x-2 shadow-md">
                                <span className="text-sm text-white truncate max-w-[100px]">{imageFile.name}</span>
                                <button
                                    onClick={() => handleRemoveImageFromNewProduct(index)}
                                    className="text-red-400 hover:text-red-300 text-xl leading-none font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="flex items-center space-x-2 text-white md:col-span-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newProductAvailable}
                            onChange={(e) => setNewProductAvailable(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500 bg-neutral-700 border-neutral-600"
                        />
                        <span className="text-white text-base">Available</span>
                    </label>
                    <button
                        onClick={handleAddProduct}
                        className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        Add Product
                    </button>
                </div>
            </div>

            <div className="mt-12 p-5 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-700">
                <h2 className="text-3xl font-bold mb-6 text-white text-center">Existing Products</h2>
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <table className="min-w-full bg-neutral-800 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-neutral-700 text-white uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Image</th>
                                <th className="py-3 px-6 text-left">Product Name</th>
                                <th className="py-3 px-6 text-left">Price</th>
                                <th className="py-3 px-6 text-left">Description</th>
                                <th className="py-3 px-6 text-left">Units</th>
                                <th className="py-3 px-6 text-left">Available</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-white text-sm font-light">
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-neutral-700 hover:bg-neutral-700">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">
                                        {product.images && product.images.length > 0 && (
                                            <img src={product.images[0].url} alt={product.images[0].alt || ""} className="w-16 h-16 object-cover rounded-md" />
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {editingProductId === product.id ? (
                                            <input
                                                type="text"
                                                value={editedProductName}
                                                onChange={(e) => setEditedProductName(e.target.value)}
                                                className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white w-full"
                                            />
                                        ) : (
                                            <p className="font-semibold">{product.name}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {editingProductId === product.id ? (
                                            <input
                                                type="number"
                                                value={editedProductPrice}
                                                onChange={(e) => setEditedProductPrice(e.target.value)}
                                                className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white w-full"
                                            />
                                        ) : (
                                            <p>${product.price}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {editingProductId === product.id ? (
                                            <textarea
                                                value={editedProductDescription}
                                                onChange={(e) => setEditedProductDescription(e.target.value)}
                                                className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white w-full" rows={1}
                                            ></textarea>
                                        ) : (
                                            <p className="truncate w-48">{product.description}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {editingProductId === product.id ? (
                                            <input
                                                type="number"
                                                value={editedProductUnits}
                                                onChange={(e) => setEditedProductUnits(e.target.value)}
                                                className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white w-full"
                                            />
                                        ) : (
                                            <p>{product.units}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {editingProductId === product.id ? (
                                            <input
                                                type="checkbox"
                                                checked={editedProductAvailable}
                                                onChange={(e) => setEditedProductAvailable(e.target.checked)}
                                                className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500 bg-neutral-700 border-neutral-600"
                                            />
                                        ) : (
                                            <span className={product.available ? "text-green-500" : "text-red-500"}>
                                                {product.available ? "Yes" : "No"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        {editingProductId === product.id ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => handleSaveProduct(product.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
