"use client";

import Image from "next/image";
import GoogleSvg from "../../../public/google.svg";

interface LoginButtonProps {
    handleLogin: () => Promise<void>;
}

export default function LoginButton({ handleLogin }: LoginButtonProps) {
    return (
        <button
            onClick={handleLogin}
            aria-label="Iniciar sesión con Google"
            className="flex items-center h-full space-x-2 mr-4 focus:outline-none cursor-pointer transition duration-200 ease-in-out hover:scale-110"
        >
            <Image
                src={GoogleSvg}
                alt="Google G Logo"
                width={40}
                height={40}
                className="flex h-8 sm:h-11 w-8 sm:w-11 items-center justify-center rounded-full border border-neutral-600 text-black transition-colors shrink-0 object-cover"
            />
        </button>
    );
}
