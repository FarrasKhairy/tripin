"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Star,
  WalletCards,
} from "lucide-react";

import { destinations } from "@/data/destinations";
import WishlistButton from "@/components/WishlistButton";

const WISHLIST_KEY = "tripin_wishlist";
const TRIP_KEY = "tripin_trip";

function getStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return fallback;

    const parsed = JSON.parse(saved);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const loadData = () => {
      const savedWishlist = getStorage(
        WISHLIST_KEY,
        []
      );

      const savedTrip = getStorage(
        TRIP_KEY,
        null
      );

      setWishlist(
        Array.isArray(savedWishlist)
          ? savedWishlist
          : []
      );

      setTrip(savedTrip);
    };

    loadData();

    window.addEventListener(
      "tripin-wishlist-update",
      loadData
    );

    window.addEventListener(
      "tripin-trip-update",
      loadData
    );

    window.addEventListener("storage", loadData);
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener(
        "tripin-wishlist-update",
        loadData
      );

      window.removeEventListener(
        "tripin-trip-update",
        loadData
      );

      window.removeEventListener(
        "storage",
        loadData
      );

      window.removeEventListener(
        "focus",
        loadData
      );
    };
  }, []);

  const popularDestinations = useMemo(() => {
    return [...destinations]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, 6);
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        destinations
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ].slice(0, 6);
  }, []);

  const recommendedDestinations = useMemo(() => {
    return [...destinations]
      .sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      )
      .slice(0, 4);
  }, []);

  const filteredSearch = useMemo(() => {
    if (!search.trim()) return [];

    const keyword = search.toLowerCase();

    return destinations
      .filter((destination) => {
        return [
          destination.name,
          destination.location,
          destination.category,
          destination.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(keyword)
          );
      })
      .slice(0, 5);
  }, [search]);

  const tripDestinations = Array.isArray(
    trip?.destinations
  )
    ? trip.destinations
    : trip?.destination
      ? [{ name: trip.destination }]
      : [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-emerald-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.12),transparent_28%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                <Sparkles size={14} />
                YOUR TRAVEL COMPANION
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Plan your trip.
                <br />
                <span className="text-emerald-100">
                  Enjoy the journey.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-50 sm:text-base">
                Temukan destinasi terbaik, susun
                itinerary, kelola budget, dan simpan
                semua rencana perjalananmu dalam satu
                tempat bersama TRIPIN.
              </p>

              {/* SEARCH */}
              <div className="relative mt-8 max-w-xl">
                <div className="flex items-center rounded-2xl bg-white p-2 shadow-2xl">
                  <Search
                    size={20}
                    className="ml-3 shrink-0 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Cari destinasi, kota, atau kategori..."
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />

                  <Link
                    href={
                      search
                        ? `/explore?search=${encodeURIComponent(
                            search
                          )}`
                        : "/explore"
                    }
                    className="hidden rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 sm:block"
                  >
                    Explore
                  </Link>
                </div>

                {search &&
                  filteredSearch.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
                      {filteredSearch.map(
                        (destination) => (
                          <Link
                            key={destination.id}
                            href={`/destinations/${destination.id}`}
                            onClick={() =>
                              setSearch("")
                            }
                            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-emerald-50"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-50">
                              {destination.image && (
                                <img
                                  src={
                                    destination.image
                                  }
                                  alt={
                                    destination.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">
                                {destination.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                {
                                  destination.location
                                }
                              </p>
                            </div>

                            <ArrowRight
                              size={16}
                              className="ml-auto text-gray-400"
                            />
                          </Link>
                        )
                      )}
                    </div>
                  )}

                {search &&
                  filteredSearch.length === 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl bg-white p-5 text-center text-sm text-gray-500 shadow-2xl">
                      Destinasi tidak ditemukan.
                    </div>
                  )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {categories.slice(0, 4).map(
                  (category) => (
                    <Link
                      key={category}
                      href={`/explore?category=${encodeURIComponent(
                        category
                      )}`}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      {category}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* HERO CARD */}
            <div className="hidden lg:block">
              <div className="relative ml-auto max-w-md">
                <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl" />

                <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
                  <div className="relative h-[420px] overflow-hidden rounded-[1.5rem]">
                    {popularDestinations[0]?.image ? (
                      <img
                        src={
                          popularDestinations[0].image
                        }
                        alt={
                          popularDestinations[0].name
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-emerald-100 text-emerald-600">
                        <MapPin size={50} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-6 pt-32">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <MapPin size={14} />
                        Destinasi Populer
                      </div>

                      <h2 className="mt-2 text-2xl font-black text-white">
                        {popularDestinations[0]
                          ?.name || "Explore Indonesia"}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                        <Star
                          size={15}
                          fill="currentColor"
                          className="text-yellow-300"
                        />
                        {popularDestinations[0]
                          ?.rating || "4.8"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-8 rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Compass size={20} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Destinasi
                      </p>
                      <p className="font-black text-gray-900">
                        {destinations.length}+
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="relative z-10 -mt-7 px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg md:grid-cols-4">
          <StatCard
            icon={<Compass size={20} />}
            value={destinations.length}
            label="Destinasi"
          />

          <StatCard
            icon={<Heart size={20} />}
            value={wishlist.length}
            label="Wishlist Kamu"
          />

          <StatCard
            icon={<CalendarDays size={20} />}
            value={tripDestinations.length}
            label="Destinasi Trip"
          />

          <StatCard
            icon={<WalletCards size={20} />}
            value="Smart"
            label="Budget Planner"
          />
        </div>
      </section>

      {/* CURRENT TRIP */}
      {tripDestinations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50">
            <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  <CalendarDays size={14} />
                  Trip Kamu
                </div>

                <h2 className="mt-2 text-xl font-black text-gray-900">
                  {tripDestinations.length}{" "}
                  destinasi sudah direncanakan
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tripDestinations
                    .slice(0, 4)
                    .map((destination, index) => (
                      <span
                        key={
                          destination.id ??
                          `${destination.name}-${index}`
                        }
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                      >
                        {destination.name}
                      </span>
                    ))}

                  {tripDestinations.length > 4 && (
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-400">
                      +{tripDestinations.length - 4}
                      lainnya
                    </span>
                  )}
                </div>
              </div>

              <Link
                href="/my-trip"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Lihat My Trip
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* POPULAR */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <SectionHeader
          eyebrow="EXPLORE"
          title="Destinasi Populer"
          description="Temukan tempat menarik yang banyak dipilih untuk perjalanan berikutnya."
          href="/explore"
          linkText="Lihat semua"
        />

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularDestinations.map(
            (destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            )
          )}
        </div>
      </section>

      {/* SMART PLANNER CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-gray-900">
          <div className="relative p-7 sm:p-10 lg:p-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                  <Sparkles size={14} />
                  SMART TRIP PLANNER
                </div>

                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                  Bingung mulai dari mana?
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
                  Masukkan destinasi, tanggal,
                  budget, dan gaya perjalananmu.
                  TRIPIN akan membantu membuat
                  rencana perjalanan untukmu.
                </p>
              </div>

              <Link
                href="/planner"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-500"
              >
                Coba Smart Planner
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <SectionHeader
          eyebrow="DISCOVER"
          title="Jelajahi Berdasarkan Kategori"
          description="Pilih pengalaman perjalanan yang sesuai dengan gayamu."
        />

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const count = destinations.filter(
              (destination) =>
                destination.category === category
            ).length;

            return (
              <Link
                key={category}
                href={`/explore?category=${encodeURIComponent(
                  category
                )}`}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-100 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Compass size={20} />
                </div>

                <h3 className="mt-4 text-sm font-black text-gray-900">
                  {category}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  {count} destinasi
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* BUDGET RECOMMENDATION */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:pb-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <WalletCards size={14} />
              BUDGET FRIENDLY
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Liburan seru tidak harus mahal.
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Temukan destinasi dengan estimasi
              budget yang lebih ramah untuk perjalanan
              berikutnya.
            </p>

            <Link
              href="/budget"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Atur Budget
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {recommendedDestinations.map(
              (destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.id}`}
                  className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-emerald-50">
                    {destination.image && (
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="min-w-0 py-1">
                    <p className="truncate text-sm font-black text-gray-900">
                      {destination.name}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      <span className="truncate">
                        {destination.location}
                      </span>
                    </p>

                    <p className="mt-3 text-xs font-black text-emerald-600">
                      {formatRupiah(
                        destination.price
                      )}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MapPin size={25} />
          </div>

          <h2 className="mt-5 text-2xl font-black text-gray-900 sm:text-3xl">
            Siap merencanakan perjalananmu?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Mulai dari mencari destinasi sampai
            menyusun itinerary. Semua bisa dilakukan
            di TRIPIN.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Mulai Explore
              <Compass size={18} />
            </Link>

            <Link
              href="/planner"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
            >
              Buat Trip
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 p-5 last:border-b-0 sm:p-6 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>

      <div>
        <p className="text-lg font-black text-gray-900">
          {value}
        </p>

        <p className="text-xs text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkText,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
        >
          {linkText || "Lihat semua"}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function DestinationCard({
  destination,
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-60 overflow-hidden bg-emerald-50">
        {destination.image ? (
          <img
            src={destination.image}
            alt={destination.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-emerald-600">
            <MapPin size={40} />
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm backdrop-blur">
          {destination.category}
        </div>

        <WishlistButton
          destination={destination}
          className="absolute right-4 top-4"
        />

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          <Star
            size={13}
            fill="currentColor"
            className="text-yellow-300"
          />
          {destination.rating}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-black text-gray-900">
          {destination.name}
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={13} />
          <span className="truncate">
            {destination.location}
          </span>
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-gray-400">
              Mulai dari
            </p>

            <p className="mt-0.5 text-sm font-black text-emerald-600">
              {formatRupiah(destination.price)}
            </p>
          </div>

          <Link
            href={`/destinations/${destination.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            Detail
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}