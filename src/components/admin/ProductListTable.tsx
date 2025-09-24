import { useState } from "react";
import { Product, ProductImage } from "@/types/product";
import { createClient } from "@/utils/supabase/client";

interface ProductListTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onProductSaved: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onAddProductClick: () => void; // New prop for opening the Add Product modal
}

export default function ProductListTable({ products, onEdit, onDelete, onProductSaved, searchTerm, setSearchTerm, onAddProductClick }: ProductListTableProps) {
    const supabase = createClient();
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editedProductName, setEditedProductName] = useState("");
    const [editedProductPrice, setEditedProductPrice] = useState("");
    const [editedProductDescription, setEditedProductDescription] = useState("");
    const [editedProductUnits, setEditedProductUnits] = useState("");
    const [editedProductImages, setEditedProductImages] = useState<ProductImage[]>([]);
    const [editedNewImages, setEditedNewImages] = useState<File[]>([]);
    const [editedProductAvailable, setEditedProductAvailable] = useState<boolean>(true);

    const handleEditProduct = (product: Product) => {
        setEditingProductId(product.id);
        setEditedProductName(product.name);
        setEditedProductPrice(product.price);
        setEditedProductDescription(product.description);
        setEditedProductUnits(product.units.toString());
        setEditedProductImages(product.images || []);
        setEditedNewImages([]);
        setEditedProductAvailable(product.available);
        onEdit(product);
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
                return;
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
            let baseHandle = editedProductName.toLowerCase().replace(/\s+/g, "-");
            const { data: existingProducts, error: existingHandleError } = await supabase.from("products").select("id").eq("handle", baseHandle);

            if (existingHandleError) {
                console.error("Error checking for existing handle:", existingHandleError.message);
                return;
            }

            if (existingProducts && existingProducts.length > 0 && existingProducts[0].id !== productId) {
                baseHandle = `${baseHandle}-${productId.substring(0, 8)}`;
            }
            productHandle = baseHandle;
        }

        const { error } = await supabase
            .from("products")
            .update({
                name: editedProductName,
                handle: productHandle,
                price: parseFloat(editedProductPrice || "0"),
                description: editedProductDescription,
                units: parseInt(editedProductUnits || "0"),
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
            onProductSaved();
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

    return (
        <div className="p-0 sm:p-3">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="transition duration-200 w-1/2 sm:w-1/3 px-2 py-1.5 sm:py-2 border border-gray-600 placeholder:text-gray-600 rounded-md outline-none"
                />
                <button
                    onClick={onAddProductClick}
                    className="px-4 py-2 bg-black text-white text-sm sm:text-base font-semibold rounded-lg border border-black transition-all duration-300 ease-in-out hover:bg-neutral-800 hover:scale-105 cursor-pointer"
                >
                    + Add Product
                </button>
            </div>
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden my-5">
                <table className="min-w-full bg-white/50 rounded-xl shadow-md">
                    <thead className="rounded-t-2xl">
                        <tr className="bg-black text-white uppercase text-sm leading-normal rounded-t-2xl shrink-0">
                            <th className="rounded-tl-lg py-3 px-3 text-xs sm:text-sm text-left tracking-wider w-24 sm:w-32">Image</th>
                            <th className="py-3 px-3 text-xs sm:text-sm text-left tracking-wider">Product Name</th>
                            <th className="py-3 px-3 text-xs sm:text-sm text-left tracking-wider">Price</th>
                            <th className="py-3 px-3 text-xs sm:text-sm text-left tracking-wider">Description</th>
                            <th className="py-3 px-3 text-xs sm:text-sm text-left tracking-wider">Units</th>
                            <th className="py-3 px-3 text-xs sm:text-sm text-left tracking-wider">Available</th>
                            <th className="rounded-tr-lg py-3 px-3 text-xs sm:text-sm text-left tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-light h-full">
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-white/30 hover:bg-black/5">
                                <td className="py-3 px-3 text-center flex items-center justify-center w-full">
                                    {product.images && product.images.length > 0 && (
                                        <img src={product.images[0].url} alt={product.images[0].alt || ""} className="w-14 h-14 sm:w-24 sm:h-24 object-cover rounded-md" />
                                    )}
                                </td>
                                <td className="py-3 px-6 text-left">
                                    {editingProductId === product.id ? (
                                        <input
                                            type="text"
                                            value={editedProductName}
                                            onChange={(e) => setEditedProductName(e.target.value)}
                                            className="p-2 rounded-lg bg-white/70 border border-white/60 text-neutral-800 w-full"
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
                                            className="p-2 rounded-lg bg-white/70 border border-white/60 text-neutral-800 w-full"
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
                                            className="p-2 rounded-lg bg-white/70 border border-white/60 text-neutral-800 w-full" rows={1}
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
                                            className="p-2 rounded-lg bg-white/70 border border-white/60 text-neutral-800 w-full"
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
                                            className="form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500 bg-white/70 border-white/60"
                                        />
                                    ) : (
                                        <span className={product.available ? "text-green-600" : "text-red-600"}>
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
                                                onClick={() => onDelete(product.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300 cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-4 px-2 sm:px-0 text-start sm:text-center col-span-full text-base sm:text-xl animate-pulse brightness-110">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
