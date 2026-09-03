"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Heart,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";

import WishlistButton from "@/components/WishlistButton";

const WISHLIST_KEY = "tripin_wishlist";

function getWishlist() {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    setWishlist(getWishlist());
    setLoading(false);
  };

  useEffect(() => {
    loadWishlist();

    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener(
      "tripin-wishlist-update",
      handleWishlistUpdate
    );

    window.addEventListener(
      "storage",
      handleWishlistUpdate
    );

    window.addEventListener(
      "focus",
      handleWishlistUpdate
    );

    return () => {
      window.removeEventListener(
        "tripin-wishlist-update",
        handleWishlistUpdate
      );

      window.removeEventListener(
        "storage",
        handleWishlistUpdate
      );

      window.removeEventListener(
        "focus",
        handleWishlistUpdate
      );
    };
  }, []);

  const totalWishlist = wishlist.length;

  const removeWishlist = (id) => {
    const updated = wishlist.filter(
      (item) => String(item.id) !== String(id)
    );

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(updated)
    );

    setWishlist(updated);

    window.dispatchEvent(
      new Event("tripin-wishlist-update")
    );
  };

  const clearWishlist = () => {
    const confirmed = window.confirm(
      "Hapus semua destinasi dari wishlist?"
    );

    if (!confirmed) return;

    localStorage.removeItem(WISHLIST_KEY);

    setWishlist([]);

    window.dispatchEvent(
      new Event("tripin-wishlist-update")
    );
  };

  const averageRating = useMemo(() => {
    if (wishlist.length === 0) return 0;

    const total = wishlist.reduce(
      (sum, item) =>
        sum + Number(item.rating || 0),
      0
    );

    return (total / wishlist.length).toFixed(1);
  }, [wishlist]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="animate-pulse">
            <div className="h-10 w-64 rounded-xl bg-gray-200" />

            <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-gray-200" />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-96 rounded-3xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500">
                <Heart
                  size={14}
                  fill="currentColor"
                />
                WISHLIST
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                Destinasi favoritmu
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                Simpan destinasi yang menarik perhatianmu
                dan tentukan mana yang ingin kamu masukkan
                ke perjalanan.
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50 lg:self-auto"
              >
                <Trash2 size={16} />
                Hapus Semua
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {wishlist.length === 0 ? (
          <div className="flex min-h-[55vh] items-center justify-center">
            <div className="w-full max-w-xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-400">
                <Heart size={38} />
              </div>

              <h2 className="mt-6 text-2xl font-black text-gray-900 sm:text-3xl">
                Wishlist masih kosong
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                Belum ada destinasi yang kamu simpan.
                Yuk explore dan temukan tempat yang ingin
                kamu kunjungi.
              </p>

              <Link
                href="/explore"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Compass size={18} />
                Explore Destinasi
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="mb-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Heart
                    size={20}
                    fill="currentColor"
                  />
                </div>

                <p className="mt-4 text-2xl font-black text-gray-900">
                  {totalWishlist}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Destinasi tersimpan
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Star
                    size={20}
                    fill="currentColor"
                  />
                </div>

                <p className="mt-4 text-2xl font-black text-gray-900">
                  {averageRating}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Rata-rata rating
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Compass size={20} />
                </div>

                <p className="mt-4 text-2xl font-black text-gray-900">
                  Explore
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Cari destinasi lainnya
                </p>
              </div>
            </div>

            {/* GRID */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((destination) => (
                <article
                  key={destination.id}
                  className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* IMAGE */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    {destination.image ? (
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <MapPin size={42} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm backdrop-blur">
                        {destination.category ||
                          "Destinasi"}
                      </span>

                      <div className="flex gap-2">
                        <WishlistButton
                          destination={destination}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeWishlist(destination.id)
                          }
                          aria-label="Hapus destinasi"
                          title="Hapus dari wishlist"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm backdrop-blur">
                      <Star
                        size={14}
                        className="text-amber-500"
                        fill="currentColor"
                      />

                      {destination.rating || "4.8"}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <h2 className="line-clamp-1 text-xl font-black text-gray-900">
                      {destination.name}
                    </h2>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin
                        size={15}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {destination.location ||
                          "Indonesia"}
                      </span>
                    </p>

                    {destination.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                        {destination.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400">
                          Mulai dari
                        </p>

                        <p className="mt-1 font-black text-emerald-600">
                          {formatRupiah(
                            destination.price || 0
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/destinations/${destination.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-600"
                      >
                        Detail
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* BOTTOM CTA */}
            <div className="mt-10 overflow-hidden rounded-3xl bg-emerald-600 p-7 text-white sm:p-9">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-100">
                    SUDAH PUNYA DESTINASI FAVORIT?
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Saatnya masukkan ke trip kamu.
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">
                    Pilih destinasi favoritmu lalu susun
                    perjalanan menggunakan Smart Trip Planner.
                  </p>
                </div>

                <Link
                  href="/planner"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Compass size={17} />
                  Buat Trip
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}