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
    const [isLoading, setIsLoading] = useState(false);

    const handleAddProduct = async () => {
        setIsLoading(true);
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
                setIsLoading(false);
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
            available: true,
        });
        if (error) {
            console.error("Error adding product:", error.message);
            setIsLoading(false);
        } else {
            setNewProductName("");
            setNewProductPrice("");
            setNewProductDescription("");
            setNewProductUnits("");
            newProductImages.forEach((image) => URL.revokeObjectURL(image.previewUrl)); // Clean up preview URLs
            setNewProductImages([]);
            onClose(); // Close modal after adding product
            onProductAdded(); // Notify parent component that product was added
            setIsLoading(false);
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
                className="w-full sm:w-1/3 2xl:w-1/4 px-4 sm:px-6 py-6 sm:py-12 bg-white/60 backdrop-blur-lg rounded-xl shadow-2xl">
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
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Añadir Nuevo Producto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        placeholder="Nombre del Producto"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder:text-gray-600 rounded-md outline-none transition duration-200"
                    />
                    <input
                        type="number"
                        placeholder="Precio"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder:text-gray-600 rounded-md outline-none transition duration-200"
                    />
                    <textarea
                        placeholder="Descripción"
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder-gray-600 rounded-md outline-none transition duration-200 md:col-span-2"
                        rows={3}
                    ></textarea>
                    <input
                        type="number"
                        placeholder="Unidades"
                        value={newProductUnits}
                        onChange={(e) => setNewProductUnits(e.target.value)}
                        className="text-sm sm:text-base p-3 bg-white/50 placeholder-gray-600 rounded-md outline-none transition duration-200 w-1/3 sm:w-2/3"
                    />
                    <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 md:col-span-2">
                        <input
                            type="file"
                            id="new-product-images"
                            onChange={handleAddNewImageFile}
                            className="hidden"
                            accept="image/*"
                        />
                        <label htmlFor="new-product-images" className="cursor-pointer block w-full text-sm text-neutral-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:brightness-150">
                            <span className="inline-block bg-black text-white py-2 px-4 rounded-lg font-semibold cursor-pointer hover:brightness-150">
                                Seleccionar imagen
                            </span>
                            <span className="ml-3 text-neutral-700">
                                {newProductImages.length > 0 ? newProductImages[0].name : ""}
                            </span>
                        </label>
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
                    <button
                        onClick={handleAddProduct}
                        disabled={isLoading}
                        className={`col-span-1 md:col-span-2 border font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform shadow-lg ${isLoading ? "cursor-not-allowed opacity-50 bg-black text-white" : "hover:bg-black hover:text-white cursor-pointer"}`}
                    >
                        {isLoading ? "Subiendo..." : "Añadir Producto"}
                    </button>
                </div>
            </div>
        </div>
    );
}
