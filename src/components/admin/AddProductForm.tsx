import { useState } from "react";
import { ProductImage } from "@/types/product";
import { createClient } from "@/utils/supabase/client";

interface AddProductFormProps {
    onProductAdded: () => void;
    onClose: () => void;
    isOpen: boolean;
}

interface ImageFileWithPreview extends File {
    previewUrl: string;
}

export default function AddProductForm({
    isOpen,
    onClose,
    onProductAdded,
}: AddProductFormProps) {
    if (!isOpen) return null;

    const supabase = createClient();
    const [newProductName, setNewProductName] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("");
    const [newProductDescription, setNewProductDescription] = useState("");
    const [newProductUnits, setNewProductUnits] = useState("");
    const [newProductImages, setNewProductImages] = useState<ImageFileWithPreview[]>([]);
    const [newProductAvailable, setNewProductAvailable] = useState<boolean>(true);

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
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("product-images")
                .getPublicUrl(data.path);

            uploadedImages.push({ url: publicUrlData.publicUrl, alt: newProductName, path: data.path });
        }

        const { error } = await supabase.from("products").insert({
            name: newProductName,
            handle: newProductName.toLowerCase().replace(/\s+/g, "-"),
            price: parseFloat(newProductPrice || "0"),
            description: newProductDescription,
            units: parseInt(newProductUnits || "0"),
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
            newProductImages.forEach((image) => URL.revokeObjectURL(image.previewUrl)); // Clean up preview URLs
            setNewProductImages([]);
            setNewProductAvailable(true);
            onClose(); // Close modal after adding product
        }
    };

    const handleAddNewImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Clear previous preview URLs if any
            newProductImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
            const file = e.target.files[0];
            const fileWithPreview = Object.assign(file, { previewUrl: URL.createObjectURL(file) });
            setNewProductImages([fileWithPreview]);
        }
    };

    const handleRemoveImageFromNewProduct = (index: number) => {
        const imageToRemove = newProductImages[index];
        URL.revokeObjectURL(imageToRemove.previewUrl); // Clean up the specific preview URL
        setNewProductImages(newProductImages.filter((_, i) => i !== index));
        // Clear the file input value to allow re-uploading the same file
        const fileInput = document.getElementById("new-product-images") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-3"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:w-1/5 px-6 py-12 bg-white/60 backdrop-blur-lg rounded-xl shadow-2xl">
                <button
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl cursor-pointer hover:scale-110"
                    onClick={onClose}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="#000"
                            d="M5 5h2v2H5zm4 4H7V7h2zm2 2H9V9h2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2zm2-2v2h-2V9zm2-2v2h-2V7zm0 0V5h2v2z"
                        />
                    </svg>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Add New Product</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder:text-gray-600 rounded-md outline-none transition duration-200"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder:text-gray-600 rounded-md outline-none transition duration-200"
                    />
                    <textarea
                        placeholder="Description"
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder-gray-600 rounded-md outline-none transition duration-200 md:col-span-2"
                        rows={3}
                    ></textarea>
                    <input
                        type="number"
                        placeholder="Units"
                        value={newProductUnits}
                        onChange={(e) => setNewProductUnits(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder-gray-600 rounded-md outline-none transition duration-200 w-1/3 sm:w-2/3"
                    />
                    <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 md:col-span-2">
                        <input
                            type="file"
                            id="new-product-images"
                            onChange={handleAddNewImageFile}
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:brightness-150 cursor-pointer"
                            accept="image/*"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 md:col-span-2">
                        {newProductImages.map((imageFile, index) => (
                            <div key={index} className="flex items-center bg-white/70 rounded-full pl-3 pr-2 py-1 space-x-2 shadow-md">
                                <img src={imageFile.previewUrl} alt={imageFile.name} className="h-8 w-8 object-cover rounded-lg" />
                                <span className="text-sm text-neutral-700 truncate max-w-[100px]">{imageFile.name}</span>
                                <button
                                    onClick={() => handleRemoveImageFromNewProduct(index)}
                                    className="text-red-500 hover:text-red-400 text-xl leading-none font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="flex items-center space-x-2 text-neutral-800 md:col-span-2 cursor-pointer relative">
                        <input
                            type="checkbox"
                            checked={newProductAvailable}
                            onChange={(e) => setNewProductAvailable(e.target.checked)}
                            className="absolute opacity-0 w-5 h-5"
                        />
                        <span className="flex items-center justify-center h-5 w-5 border rounded transition duration-200 ease-in-out flex-shrink-0 focus:ring-2 focus:ring-gray-500"
                            style={{ backgroundColor: newProductAvailable ? 'black' : 'white', borderColor: newProductAvailable ? 'black' : 'gray' }}>
                            {newProductAvailable && (
                                <svg
                                    className="h-4 w-4 text-white pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </span>
                        <span className="text-neutral-800 text-base">Available</span>
                    </label>
                    <button
                        onClick={handleAddProduct}
                        className="col-span-1 md:col-span-2 border hover:bg-black hover:text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform shadow-lg cursor-pointer"
                    >
                        Add Product
                    </button>
                </div>
            </div>
        </div>
    );
}
