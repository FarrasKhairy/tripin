import Link from "next/link";
import {
  MapPin,
  Compass,
  Heart,
  CalendarDays,
  WalletCards,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">

      {/* =========================
          MAIN FOOTER
      ========================= */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* BRAND */}

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <MapPin size={21} strokeWidth={2.5} />
              </div>

              <span className="text-xl font-black tracking-tight text-gray-900">
                TRIP<span className="text-emerald-600">IN</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
              Plan your trip. Enjoy the journey.
              Temukan destinasi, susun itinerary,
              dan kelola budget perjalananmu dengan
              lebih mudah bersama TRIPIN.
            </p>

            <Link
              href="/explore"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Mulai Explore
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* EXPLORE */}

          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Explore
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/explore"
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  <Compass size={16} />
                  Destinasi
                </Link>
              </li>

              <li>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-red-500"
                >
                  <Heart size={16} />
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  <MapPin size={16} />
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* TRIP TOOLS */}

          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Trip Tools
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/my-trip"
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  <MapPin size={16} />
                  My Trip
                </Link>
              </li>

              <li>
                <Link
                  href="/itinerary"
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  <CalendarDays size={16} />
                  Itinerary
                </Link>
              </li>

              <li>
                <Link
                  href="/budget"
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  <WalletCards size={16} />
                  Budget
                </Link>
              </li>
            </ul>
          </div>

          {/* ACCOUNT */}

          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Account
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  Profile
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 transition hover:text-emerald-600"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:text-left">

          <p className="text-xs text-gray-400 sm:text-sm">
            © {new Date().getFullYear()} TRIPIN. All rights reserved.
          </p>

          <p className="text-xs font-medium text-gray-400 sm:text-sm">
            Plan your trip. Enjoy the journey. ✈️
          </p>
        </div>
      </div>
    </footer>
  );
}