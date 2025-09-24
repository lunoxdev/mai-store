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
    userRole: string | null;
}

export default function UserAvatarDropdown({
    session,
    handleLogout,
    isDropdownOpen,
    toggleDropdown,
    dropdownRef,
    userRole,
}: UserAvatarDropdownProps) {
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center h-full space-x-2 mr-2 sm:mr-1 focus:outline-none cursor-pointer transition duration-200 ease-in-out hover:scale-110"
            >
                {session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture ? (
                    <Image
                        src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="h-9 sm:h-12 w-9 sm:w-12 rounded-full border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white shrink-0 object-cover"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full border bg-neutral-600 flex items-center justify-center text-white text-md font-bold">
                        {session.user?.user_metadata?.full_name ? session.user.user_metadata.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                )}
            </button>
            {isDropdownOpen && (
                <div className="absolute right-14 sm:right-20 -top-2 mt-2 w-40 sm:w-48 bg-[#171717] rounded-md shadow-lg py-1 z-20">
                    {userRole === 'admin' && (
                        <a
                            href="/admin"
                            className="block w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-black hover:brightness-150 ursor-pointer transition duration-300 ease-in-out"
                        >
                            Admin Dashboard
                        </a>
                    )}
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-black hover:brightness-150 cursor-pointer border-t border-gray-700 transition duration-300 ease-in-out"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
