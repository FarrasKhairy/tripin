"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  MapPin,
  User,
  Menu,
  X,
  Map,
} from "lucide-react";

const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Explore",
    href: "/explore",
  },
  {
    name: "My Trip",
    href: "/my-trip",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <MapPin size={21} strokeWidth={2.5} />
          </div>

          <div className="leading-none">
            <span className="text-xl font-black tracking-tight text-gray-900">
              TRIP<span className="text-emerald-600">IN</span>
            </span>

            <p className="mt-1 hidden text-[9px] font-medium tracking-wide text-gray-400 sm:block">
              PLAN • EXPLORE • ENJOY
            </p>
          </div>
        </Link>

        {/* =========================
            DESKTOP NAV
        ========================= */}

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* =========================
            DESKTOP ACTIONS
        ========================= */}

        <div className="hidden items-center gap-1 md:flex">

          <Link
            href="/explore"
            title="Explore"
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              isActive("/explore")
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <Compass size={20} />
          </Link>

          <Link
            href="/wishlist"
            title="Wishlist"
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              isActive("/wishlist")
                ? "bg-red-50 text-red-500"
                : "text-gray-500 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart
              size={20}
              fill={isActive("/wishlist") ? "currentColor" : "none"}
            />
          </Link>

          <Link
            href="/profile"
            title="Profile"
            className={`ml-1 flex h-10 w-10 items-center justify-center rounded-xl transition ${
              isActive("/profile")
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <User size={20} />
          </Link>
        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 md:hidden"
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            {/* NAVIGATION */}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 border-t border-gray-100" />

            {/* MOBILE ACTIONS */}

            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/explore"
                onClick={closeMobileMenu}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-semibold transition ${
                  isActive("/explore")
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                <Compass size={19} />
                Explore
              </Link>

              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-semibold transition ${
                  isActive("/wishlist")
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart
                  size={19}
                  fill={
                    isActive("/wishlist")
                      ? "currentColor"
                      : "none"
                  }
                />
                Wishlist
              </Link>

              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-semibold transition ${
                  isActive("/profile")
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                <User size={19} />
                Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}