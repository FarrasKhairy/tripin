"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Navigation,
  Star,
  WalletCards,
} from "lucide-react";

import { destinations } from "@/data/destinations";
import WishlistButton from "@/components/WishlistButton";
import AddToTripButton from "@/components/AddToTripButton";

function formatRupiah(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DestinationDetailPage() {
  const params = useParams();

  const [destination, setDestination] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    const found = destinations.find(
      (item) => String(item.id) === String(params.id)
    );

    if (!found) {
      setNotFound(true);
      return;
    }

    setDestination(found);

    try {
      const saved =
        localStorage.getItem("tripin_wishlist");

      const wishlist = saved
        ? JSON.parse(saved)
        : [];

      if (Array.isArray(wishlist)) {
        setIsWishlisted(
          wishlist.some(
            (item) =>
              String(item.id) === String(found.id)
          )
        );
      }
    } catch {
      setIsWishlisted(false);
    }

    const handleWishlistUpdate = () => {
      try {
        const saved =
          localStorage.getItem("tripin_wishlist");

        const wishlist = saved
          ? JSON.parse(saved)
          : [];

        if (Array.isArray(wishlist)) {
          setIsWishlisted(
            wishlist.some(
              (item) =>
                String(item.id) === String(found.id)
            )
          );
        }
      } catch {
        setIsWishlisted(false);
      }
    };

    window.addEventListener(
      "tripin-wishlist-update",
      handleWishlistUpdate
    );

    window.addEventListener(
      "storage",
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
    };
  }, [params?.id]);

  if (notFound) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <MapPin size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-900">
            Destinasi tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Destinasi yang kamu cari tidak tersedia atau
            sudah tidak ada.
          </p>

          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={17} />
            Kembali ke Explore
          </Link>
        </div>
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-6 h-[420px] animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  const highlights = Array.isArray(destination.highlights)
    ? destination.highlights
    : [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* BREADCRUMB */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Kembali ke Explore
          </Link>
        </div>
      </section>

      {/* HERO IMAGE */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:pt-8">
          <div className="relative overflow-hidden rounded-3xl bg-gray-100">
            <div className="aspect-[16/8] min-h-[300px] w-full sm:min-h-[400px] lg:min-h-[500px]">
              {destination.image ? (
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <MapPin size={48} />
                </div>
              )}
            </div>

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* CATEGORY */}
            {destination.category && (
              <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-gray-800 shadow-sm backdrop-blur sm:left-6 sm:top-6">
                {destination.category}
              </div>
            )}

            {/* WISHLIST */}
            <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
              <WishlistButton
                destination={destination}
                className="h-11 w-11"
              />
            </div>

            {/* HERO CONTENT */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-10">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {destination.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-white/90">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {destination.location ||
                      "Indonesia"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Star
                      size={16}
                      className="text-amber-300"
                      fill="currentColor"
                    />
                    <strong>
                      {destination.rating || "4.5"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* DESCRIPTION */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-gray-900">
                Tentang destinasi
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
                {destination.description ||
                  `Nikmati pengalaman perjalanan yang menarik di ${destination.name}. Temukan berbagai tempat menarik, suasana lokal, dan pengalaman baru selama perjalananmu.`}
              </p>
            </section>

            {/* HIGHLIGHTS */}
            {highlights.length > 0 && (
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-black text-gray-900">
                  Highlight perjalanan
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {highlights.map(
                    (highlight, index) => (
                      <div
                        key={`${highlight}-${index}`}
                        className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check size={16} />
                        </div>

                        <p className="pt-1 text-sm font-semibold leading-5 text-gray-700">
                          {highlight}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* INFO */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black text-gray-900">
                Informasi perjalanan
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <MapPin size={19} />
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Lokasi
                  </p>

                  <p className="mt-1 text-sm font-black text-gray-900">
                    {destination.location ||
                      "Indonesia"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Star
                      size={19}
                      fill="currentColor"
                    />
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Rating
                  </p>

                  <p className="mt-1 text-sm font-black text-gray-900">
                    {destination.rating || "4.5"} / 5
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <WalletCards size={19} />
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Estimasi
                  </p>

                  <p className="mt-1 text-sm font-black text-gray-900">
                    {formatRupiah(
                      destination.price
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* LOCATION CTA */}
            <section className="rounded-3xl bg-emerald-600 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                    <Navigation size={17} />
                    Siap menjelajah?
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-white">
                    Jadikan {destination.name} bagian
                    dari perjalananmu.
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100">
                    Simpan destinasi ini atau langsung
                    buat trip menggunakan Smart Trip
                    Planner.
                  </p>
                </div>

                <Link
                  href="/planner"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
                >
                  Buat Trip
                  <ArrowRight size={17} />
                </Link>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              {/* PRICE */}
              <div className="border-b border-gray-100 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Estimasi budget
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black text-gray-900">
                      {formatRupiah(
                        destination.price
                      )}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      estimasi perjalanan
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                    <Star
                      size={14}
                      fill="currentColor"
                    />
                    {destination.rating || "4.5"}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="space-y-3 p-6">
                <AddToTripButton
                  destination={destination}
                />

                <Link
                  href="/planner"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                >
                  <SparklesIcon />
                  Buat Smart Trip
                </Link>

                <Link
                  href="/wishlist"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <Heart
                    size={18}
                    fill={
                      isWishlisted
                        ? "currentColor"
                        : "none"
                    }
                  />

                  {isWishlisted
                    ? "Lihat Wishlist"
                    : "Buka Wishlist"}
                </Link>
              </div>

              {/* BENEFITS */}
              <div className="border-t border-gray-100 bg-gray-50 p-6">
                <p className="text-sm font-black text-gray-900">
                  Dengan TRIPIN kamu bisa:
                </p>

                <div className="mt-4 space-y-3">
                  <Benefit
                    icon={<CalendarDays size={17} />}
                    text="Menyusun itinerary perjalanan"
                  />

                  <Benefit
                    icon={<WalletCards size={17} />}
                    text="Mengatur budget perjalanan"
                  />

                  <Benefit
                    icon={<Heart size={17} />}
                    text="Menyimpan destinasi favorit"
                  />

                  <Benefit
                    icon={<Check size={17} />}
                    text="Memantau progress perjalanan"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
        {icon}
      </div>

      <span>{text}</span>
    </div>
  );
}

function SparklesIcon() {
  return (
    <span className="text-base leading-none">
      ✨
    </span>
  );
}