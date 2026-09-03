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

import Navbar from "@/components/Navbar";
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

      setTripCount(
        Array.isArray(savedTrips) ? savedTrips.length : 0
      );

      setWishlistCount(
        Array.isArray(savedWishlist)
          ? savedWishlist.length
          : 0
      );
    } catch (error) {
      console.error("Gagal membaca data profil:", error);
    }
  }, []);

  const saveProfile = () => {
    const profile = {
      name: name.trim() || "Traveler",
      email: email.trim() || "traveler@tripin.com",
      location: location.trim() || "Indonesia",
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
        <Navbar />

        {/* HEADER */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10">
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

              <h1 className="mt-2 text-4xl font-black text-gray-900">
                Profil Saya
              </h1>

              <p className="mt-3 text-gray-500">
                Kelola informasi profil dan perjalananmu
                di TRIPIN.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          {/* PROFILE CARD */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {/* COVER */}
            <div className="h-32 bg-emerald-600" />

            <div className="px-6 pb-7 md:px-8">
              {/* AVATAR + BUTTON */}
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-emerald-100 shadow-sm">
                    <User
                      size={42}
                      className="text-emerald-600"
                    />
                  </div>

                  <div className="pb-1">
                    <h2 className="text-2xl font-black text-gray-900">
                      {name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Traveler TRIPIN
                    </p>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-wrap gap-3">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Pencil size={17} />
                      Edit Profil
                    </button>
                  ) : (
                    <button
                      onClick={saveProfile}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      <Save size={17} />
                      Simpan
                    </button>
                  )}

                  <button
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
                  <label className="mb-2 block text-sm font-bold">
                    Nama
                  </label>

                  <input
                    type="text"
                    value={name}
                    disabled={!editing}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      editing
                        ? "border-gray-200 bg-white focus:border-emerald-500"
                        : "border-transparent bg-gray-50"
                    }`}
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    disabled={!editing}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      editing
                        ? "border-gray-200 bg-white focus:border-emerald-500"
                        : "border-transparent bg-gray-50"
                    }`}
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Lokasi
                  </label>

                  <input
                    type="text"
                    value={location}
                    disabled={!editing}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      editing
                        ? "border-gray-200 bg-white focus:border-emerald-500"
                        : "border-transparent bg-gray-50"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STATISTICS */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* TRIP */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <MapPin
                  size={21}
                  className="text-emerald-600"
                />
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Destinasi Trip
              </p>

              <p className="mt-1 text-3xl font-black">
                {tripCount}
              </p>
            </div>

            {/* WISHLIST */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <Heart
                  size={21}
                  className="text-red-500"
                />
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Wishlist
              </p>

              <p className="mt-1 text-3xl font-black">
                {wishlistCount}
              </p>
            </div>

            {/* STATUS */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <CalendarDays
                  size={21}
                  className="text-blue-500"
                />
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Status
              </p>

              <p className="mt-1 text-lg font-black">
                Traveler Aktif
              </p>
            </div>
          </div>

          {/* QUICK MENU */}
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              Menu Perjalanan
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {/* MY TRIP */}
              <Link
                href="/my-trip"
                className="rounded-2xl border border-gray-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <MapPin
                  size={22}
                  className="text-emerald-600"
                />

                <p className="mt-4 font-black">
                  My Trip
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Kelola destinasi perjalanan
                </p>
              </Link>

              {/* ITINERARY */}
              <Link
                href="/itinerary"
                className="rounded-2xl border border-gray-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <CalendarDays
                  size={22}
                  className="text-emerald-600"
                />

                <p className="mt-4 font-black">
                  Itinerary
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Atur jadwal perjalanan
                </p>
              </Link>

              {/* BUDGET */}
              <Link
                href="/budget"
                className="rounded-2xl border border-gray-100 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Wallet
                  size={22}
                  className="text-emerald-600"
                />

                <p className="mt-4 font-black">
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