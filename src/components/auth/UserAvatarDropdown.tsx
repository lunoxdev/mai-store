"use client";

import Image from "next/image";
import { Session } from "@supabase/supabase-js";
import { RefObject } from "react";

interface UserAvatarDropdownProps {
    session: Session;
    handleLogout: () => Promise<void>;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    dropdownRef: RefObject<HTMLDivElement | null>;
}

export default function UserAvatarDropdown({
    session,
    handleLogout,
    isDropdownOpen,
    toggleDropdown,
    dropdownRef,
}: UserAvatarDropdownProps) {
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center h-full space-x-2 mr-4 focus:outline-none cursor-pointer transition duration-200 ease-in-out hover:scale-110"
            >
                {session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture ? (
                    <Image
                        src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="h-8 sm:h-12 w-8 sm:w-12 rounded-full border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white shrink-0 object-cover"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full border bg-neutral-600 flex items-center justify-center text-white text-md font-bold">
                        {session.user?.user_metadata?.full_name ? session.user.user_metadata.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                )}
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-20">
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
