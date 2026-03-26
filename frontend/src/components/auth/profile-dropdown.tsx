"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FiHome, FiMap, FiLogOut, FiUser } from "react-icons/fi";

interface ProfileDropdownProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileDropdown({ name, email }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((o) => !o); }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white text-xs font-bold hover:bg-forest/90 hover:scale-105 transition-all duration-150 ring-2 ring-white shadow-sm"
        aria-label="Open profile menu"
      >
        {name ? (
          getInitials(name)
        ) : (
          <FiUser size={14} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name ?? "User"}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => {
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-forest/5 hover:text-forest transition-colors"
            >
              <FiUser size={14} />
              Profile
            </Link>
            <Link
              href="/dashboard"
              onClick={() => { setOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-forest/5 hover:text-forest transition-colors"
            >
              <FiHome size={14} />
              Dashboard
            </Link>
            <Link
              href="/analyze-land"
              onClick={() => { setOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-forest/5 hover:text-forest transition-colors"
            >
              <FiMap size={14} />
              Analyze Land
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-50 pt-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
