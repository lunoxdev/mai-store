
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { ProductImage } from "@/types/product";

export default function AdminPage() {
    const supabase = createClient();
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

    useEffect(() => {
        fetchProducts();
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
        // Image upload logic will go here
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

        const { error } = await supabase
            .from("products")
            .update({
                name: editedProductName,
                handle: editedProductName.toLowerCase().replace(/\s+/g, '-'), // Automatically generate handle
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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
                <div className="flex flex-col space-y-2">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="border p-2 rounded text-gray-400"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        className="border p-2 rounded text-gray-400"
                    />
                    <textarea
                        placeholder="Description"
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                        className="border p-2 rounded text-gray-400"
                        rows={3}
                    ></textarea>
                    <input
                        type="number"
                        placeholder="Units"
                        value={newProductUnits}
                        onChange={(e) => setNewProductUnits(e.target.value)}
                        className="border p-2 rounded text-gray-400"
                    />
                    <div className="flex items-center space-x-2">
                        <label className="block text-white text-sm font-bold mb-2" htmlFor="new-product-images">
                            Upload Images:
                        </label>
                        <input
                            type="file"
                            id="new-product-images"
                            multiple
                            onChange={handleAddNewImageFile}
                            className="border p-2 rounded text-white"
                            accept="image/*"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {newProductImages.map((imageFile, index) => (
                            <div key={index} className="flex items-center bg-neutral-700 rounded p-1">
                                <span className="text-sm truncate w-32">{imageFile.name}</span>
                                <button
                                    onClick={() => handleRemoveImageFromNewProduct(index)}
                                    className="ml-2 text-red-400 hover:text-red-600"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="flex items-center space-x-2 text-white">
                        <input
                            type="checkbox"
                            checked={newProductAvailable}
                            onChange={(e) => setNewProductAvailable(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Available</span>
                    </label>
                    <button
                        onClick={handleAddProduct}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Product
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Existing Products</h2>
                <ul>
                    {products.map((product) => (
                        <li key={product.id} className="flex justify-between items-center bg-neutral-800 p-2 rounded mb-2">
                            {editingProductId === product.id ? (
                                <div className="flex flex-col space-y-2 w-full">
                                    <input
                                        type="text"
                                        value={editedProductName}
                                        onChange={(e) => setEditedProductName(e.target.value)}
                                        className="border p-2 rounded text-black flex-grow"
                                    />
                                    <input
                                        type="number"
                                        value={editedProductPrice}
                                        onChange={(e) => setEditedProductPrice(e.target.value)}
                                        className="border p-2 rounded text-black"
                                    />
                                    <textarea
                                        value={editedProductDescription}
                                        onChange={(e) => setEditedProductDescription(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        rows={3}
                                    ></textarea>
                                    <input
                                        type="number"
                                        value={editedProductUnits}
                                        onChange={(e) => setEditedProductUnits(e.target.value)}
                                        className="border p-2 rounded text-black"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <label className="block text-white text-sm font-bold mb-2" htmlFor="edited-product-new-images">
                                            Upload New Images:
                                        </label>
                                        <input
                                            type="file"
                                            id="edited-product-new-images"
                                            multiple
                                            onChange={handleAddNewImageFileToEditedProduct}
                                            className="border p-2 rounded text-white"
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {editedProductImages.map((image, index) => (
                                            <div key={image.url} className="flex items-center bg-neutral-700 rounded p-1">
                                                <span className="text-sm truncate w-32">{image.url.split('/').pop()}</span>
                                                <button
                                                    onClick={() => handleRemoveImageFromEditedProduct(index, false)}
                                                    className="ml-2 text-red-400 hover:text-red-600"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        {editedNewImages.map((imageFile, index) => (
                                            <div key={index} className="flex items-center bg-neutral-700 rounded p-1">
                                                <span className="text-sm truncate w-32">{imageFile.name}</span>
                                                <button
                                                    onClick={() => handleRemoveImageFromEditedProduct(index, true)}
                                                    className="ml-2 text-red-400 hover:text-red-600"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <label className="flex items-center space-x-2 text-white">
                                        <input
                                            type="checkbox"
                                            checked={editedProductAvailable}
                                            onChange={(e) => setEditedProductAvailable(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span>Available</span>
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSaveProduct(product.id)}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <span><strong>Name:</strong> {product.name}</span>
                                        <span><strong>Price:</strong> ${product.price}</span>
                                        <span><strong>Description:</strong> {product.description}</span>
                                        <span><strong>Units:</strong> {product.units}</span>
                                        <span><strong>Available:</strong> {product.available ? "Yes" : "No"}</span>
                                        {product.images && product.images.length > 0 && (
                                            <div>
                                                <strong>Images:</strong>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {product.images.map((image, index) => (
                                                        <a key={index} href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm truncate w-24">
                                                            {image.url.split('/').pop()}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
