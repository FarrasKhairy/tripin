"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  CalendarDays,
  Heart,
  Wallet,
  ArrowLeft,
  Pencil,
  Save,
  LogOut,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const [name, setName] = useState("Traveler");
  const [email, setEmail] = useState("traveler@tripin.com");
  const [location, setLocation] = useState("Indonesia");

  const [editing, setEditing] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("tripin_profile") || "null"
      );

      const savedTrips = JSON.parse(
        localStorage.getItem("tripin_trip") || "[]"
      );

      const savedWishlist = JSON.parse(
        localStorage.getItem("tripin_wishlist") || "[]"
      );

      if (savedProfile) {
        setName(savedProfile.name || "Traveler");
        setEmail(
          savedProfile.email || "traveler@tripin.com"
        );
        setLocation(
          savedProfile.location || "Indonesia"
        );
      }

      /*
       * tripin_trip menyimpan object trip,
       * bukan array destinasi secara langsung.
       *
       * Karena itu kita cek struktur destinations
       * supaya jumlah destinasi yang tampil benar.
       */
      if (
        savedTrips &&
        typeof savedTrips === "object" &&
        !Array.isArray(savedTrips)
      ) {
        setTripCount(
          Array.isArray(savedTrips.destinations)
            ? savedTrips.destinations.length
            : 0
        );
      } else {
        setTripCount(
          Array.isArray(savedTrips)
            ? savedTrips.length
            : 0
        );
      }

      setWishlistCount(
        Array.isArray(savedWishlist)
          ? savedWishlist.length
          : 0
      );
    } catch (error) {
      console.error(
        "Gagal membaca data profil:",
        error
      );
    }
  }, []);

  const saveProfile = () => {
    const profile = {
      name: name.trim() || "Traveler",
      email:
        email.trim() || "traveler@tripin.com",
      location:
        location.trim() || "Indonesia",
    };

    localStorage.setItem(
      "tripin_profile",
      JSON.stringify(profile)
    );

    setName(profile.name);
    setEmail(profile.email);
    setLocation(profile.location);

    setEditing(false);

    alert("Profil berhasil disimpan!");
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Apakah kamu yakin ingin logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("tripin_logged_in");

    window.location.href = "/";
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f6fbf8]">
        {/* 
          Navbar TIDAK ditulis di sini.
          Navbar sudah berasal dari app/layout.jsx.
        */}

        {/* HEADER */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-emerald-600"
            >
              <ArrowLeft size={17} />
              Kembali ke Home
            </Link>

            <div className="mt-6">
              <p className="text-sm font-bold tracking-widest text-emerald-600">
                MY PROFILE
              </p>

              <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">
                Profil Saya
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Kelola informasi profil dan
                perjalananmu di TRIPIN.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {/* PROFILE CARD */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {/* COVER */}
            <div className="h-28 bg-emerald-600 sm:h-32" />

            <div className="px-5 pb-7 sm:px-8">
              {/* AVATAR + BUTTON */}
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  {/* AVATAR */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-emerald-100 shadow-sm sm:h-24 sm:w-24">
                    <User
                      size={36}
                      className="text-emerald-600 sm:h-[42px] sm:w-[42px]"
                    />
                  </div>

                  {/* NAME */}
                  <div className="min-w-0 pb-1">
                    <h2 className="truncate text-xl font-black text-gray-900 sm:text-2xl">
                      {name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Traveler TRIPIN
                    </p>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  {!editing ? (
                    <button
                      type="button"
                      onClick={() =>
                        setEditing(true)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Pencil size={17} />
                      Edit Profil
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={saveProfile}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      <Save size={17} />
                      Simpan
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-100"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              </div>

              {/* FORM */}
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-bold text-gray-900"
                  >
                    Nama
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    disabled={!editing}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      editing
                        ? "border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        : "cursor-not-allowed border-transparent bg-gray-50"
                    }`}
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-bold text-gray-900"
                  >
                    Email
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled={!editing}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      editing
                        ? "border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        : "cursor-not-allowed border-transparent bg-gray-50"
                    }`}
                  />
                </div>

                {/* LOCATION */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="profile-location"
                    className="mb-2 block text-sm font-bold text-gray-900"
                  >
                    Lokasi
                  </label>

                  <input
                    id="profile-location"
                    type="text"
                    value={location}
                    disabled={!editing}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      editing
                        ? "border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        : "cursor-not-allowed border-transparent bg-gray-50"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STATISTICS */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* TRIP */}
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <MapPin
                  size={21}
                  className="text-emerald-600"
                />
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Destinasi Trip
              </p>

              <p className="mt-1 text-3xl font-black text-gray-900">
                {tripCount}
              </p>
            </div>

            {/* WISHLIST */}
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <Heart
                  size={21}
                  className="text-red-500"
                />
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Wishlist
              </p>

              <p className="mt-1 text-3xl font-black text-gray-900">
                {wishlistCount}
              </p>
            </div>

            {/* STATUS */}
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <CalendarDays
                  size={21}
                  className="text-blue-500"
                />
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Status
              </p>

              <p className="mt-1 text-lg font-black text-gray-900">
                Traveler Aktif
              </p>
            </div>
          </div>

          {/* QUICK MENU */}
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black text-gray-900">
              Menu Perjalanan
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {/* MY TRIP */}
              <Link
                href="/my-trip"
                className="group rounded-2xl border border-gray-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <MapPin
                  size={22}
                  className="text-emerald-600"
                />

                <p className="mt-4 font-black text-gray-900">
                  My Trip
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Kelola destinasi perjalanan
                </p>
              </Link>

              {/* ITINERARY */}
              <Link
                href="/itinerary"
                className="group rounded-2xl border border-gray-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <CalendarDays
                  size={22}
                  className="text-emerald-600"
                />

                <p className="mt-4 font-black text-gray-900">
                  Itinerary
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Atur jadwal perjalanan
                </p>
              </Link>

              {/* BUDGET */}
              <Link
                href="/budget"
                className="group rounded-2xl border border-gray-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Wallet
                  size={22}
                  className="text-emerald-600"
                />

                <p className="mt-4 font-black text-gray-900">
                  Budget
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Kelola budget liburan
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}