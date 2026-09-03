"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  ChevronDown,
  Filter,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

import { destinations } from "@/data/destinations";
import WishlistButton from "@/components/WishlistButton";

const categories = [
  "Semua",
  ...new Set(
    destinations
      .map((destination) => destination.category)
      .filter(Boolean)
  ),
];

const budgetOptions = [
  { label: "Semua Budget", value: "all" },
  { label: "Di bawah Rp500 ribu", value: "500000" },
  { label: "Rp500 ribu - Rp1 juta", value: "1000000" },
  { label: "Rp1 juta - Rp2 juta", value: "2000000" },
  { label: "Di atas Rp2 juta", value: "above" },
];

function formatRupiah(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBudgetMatch(price, budget) {
  const amount = Number(price) || 0;

  if (budget === "all") return true;
  if (budget === "500000") return amount < 500000;
  if (budget === "1000000") {
    return amount >= 500000 && amount <= 1000000;
  }
  if (budget === "2000000") {
    return amount > 1000000 && amount <= 2000000;
  }
  if (budget === "above") return amount > 2000000;

  return true;
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [budget, setBudget] = useState("all");
  const [sort, setSort] = useState("recommended");

  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tripin_wishlist");
      const parsed = saved ? JSON.parse(saved) : [];

      setWishlist(Array.isArray(parsed) ? parsed : []);
    } catch {
      setWishlist([]);
    }

    const handleWishlistUpdate = () => {
      try {
        const saved =
          localStorage.getItem("tripin_wishlist");

        const parsed = saved ? JSON.parse(saved) : [];

        setWishlist(Array.isArray(parsed) ? parsed : []);
      } catch {
        setWishlist([]);
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
  }, []);

  const filteredDestinations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = destinations.filter((destination) => {
      const searchableText = [
        destination.name,
        destination.location,
        destination.category,
        destination.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword || searchableText.includes(keyword);

      const matchesCategory =
        category === "Semua" ||
        destination.category === category;

      const matchesBudget = getBudgetMatch(
        destination.price,
        budget
      );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBudget
      );
    });

    result = [...result];

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || ""),
          "id"
        )
      );
    }

    return result;
  }, [search, category, budget, sort]);

  const activeFilterCount =
    (category !== "Semua" ? 1 : 0) +
    (budget !== "all" ? 1 : 0) +
    (sort !== "recommended" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setCategory("Semua");
    setBudget("all");
    setSort("recommended");
  };

  const isWishlisted = (id) => {
    return wishlist.some(
      (item) => String(item.id) === String(id)
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
              <MapPin size={16} />
              Explore Indonesia
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Temukan destinasi
              <span className="text-emerald-600">
                {" "}
                favoritmu.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Cari tempat wisata berdasarkan nama,
              kategori, budget, dan rating yang sesuai
              dengan perjalananmu.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari Yogyakarta, pantai, budaya..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-14 pr-12 text-sm font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:text-base"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* MOBILE FILTER BUTTON */}
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <p className="text-sm font-bold text-gray-700">
            {filteredDestinations.length} destinasi
          </p>

          <button
            type="button"
            onClick={() =>
              setMobileFilterOpen(!mobileFilterOpen)
            }
            className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
          >
            <SlidersHorizontal size={17} />
            Filter

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* SIDEBAR FILTER */}
          <aside
            className={`${
              mobileFilterOpen
                ? "block"
                : "hidden"
            } lg:block`}
          >
            <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter
                    size={18}
                    className="text-emerald-600"
                  />

                  <h2 className="font-black text-gray-900">
                    Filter
                  </h2>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* CATEGORY */}
              <div className="mt-7">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-400">
                  Kategori
                </p>

                <div className="space-y-1">
                  {categories.map((item) => {
                    const active =
                      category === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setCategory(item);
                          setMobileFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                          active
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                        }`}
                      >
                        <span>{item}</span>

                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BUDGET */}
              <div className="mt-7 border-t border-gray-100 pt-6">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-400">
                  Budget
                </p>

                <div className="space-y-1">
                  {budgetOptions.map((item) => {
                    const active =
                      budget === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setBudget(item.value);
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                          active
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUICK INFO */}
              <div className="mt-7 rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">
                  Tips TRIPIN
                </p>

                <p className="mt-2 text-xs leading-5 text-emerald-800">
                  Simpan destinasi favorit ke Wishlist
                  agar mudah dipilih saat membuat Smart
                  Trip Planner.
                </p>
              </div>
            </div>
          </aside>

          {/* DESTINATIONS */}
          <div>
            {/* TOP BAR */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Menampilkan{" "}
                  <span className="font-black text-gray-900">
                    {filteredDestinations.length}
                  </span>{" "}
                  destinasi
                </p>

                {search && (
                  <p className="mt-1 text-xs text-gray-400">
                    Hasil pencarian untuk "
                    <span className="font-bold text-gray-600">
                      {search}
                    </span>
                    "
                  </p>
                )}
              </div>

              {/* SORT */}
              <div className="relative">
                <ArrowDownUp
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm font-semibold text-gray-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="recommended">
                    Rekomendasi
                  </option>

                  <option value="rating">
                    Rating Tertinggi
                  </option>

                  <option value="price-low">
                    Harga Terendah
                  </option>

                  <option value="price-high">
                    Harga Tertinggi
                  </option>

                  <option value="name">
                    Nama A-Z
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* ACTIVE FILTERS */}
            {(category !== "Semua" ||
              budget !== "all") && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-400">
                  Filter aktif:
                </span>

                {category !== "Semua" && (
                  <button
                    type="button"
                    onClick={() => setCategory("Semua")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                  >
                    {category}
                    <X size={13} />
                  </button>
                )}

                {budget !== "all" && (
                  <button
                    type="button"
                    onClick={() => setBudget("all")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                  >
                    {
                      budgetOptions.find(
                        (item) => item.value === budget
                      )?.label
                    }
                    <X size={13} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-gray-400 hover:text-gray-700"
                >
                  Hapus semua
                </button>
              </div>
            )}

            {/* GRID */}
            {filteredDestinations.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDestinations.map(
                  (destination) => (
                    <article
                      key={destination.id}
                      className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Link
                          href={`/destinations/${destination.id}`}
                          className="block h-full w-full"
                        >
                          {destination.image ? (
                            <img
                              src={destination.image}
                              alt={
                                destination.name ||
                                "Destinasi wisata"
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <MapPin size={32} />
                            </div>
                          )}
                        </Link>

                        {/* CATEGORY */}
                        {destination.category && (
                          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-gray-700 shadow-sm backdrop-blur">
                            {destination.category}
                          </div>
                        )}

                        {/* WISHLIST */}
                        <div className="absolute right-3 top-3">
                          <WishlistButton
                            destination={destination}
                          />
                        </div>

                        {/* SAVED BADGE */}
                        {isWishlisted(destination.id) && (
                          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-red-500 shadow-sm backdrop-blur">
                            <Heart
                              size={13}
                              fill="currentColor"
                            />
                            Tersimpan
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="p-5">
                        <Link
                          href={`/destinations/${destination.id}`}
                          className="block"
                        >
                          <h2 className="line-clamp-1 text-lg font-black text-gray-900 transition group-hover:text-emerald-600">
                            {destination.name}
                          </h2>

                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <MapPin
                              size={14}
                              className="shrink-0 text-emerald-500"
                            />

                            <span className="line-clamp-1">
                              {destination.location ||
                                "Indonesia"}
                            </span>
                          </div>
                        </Link>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <Star
                              size={16}
                              className="text-amber-400"
                              fill="currentColor"
                            />

                            <span className="text-sm font-black text-gray-900">
                              {destination.rating ||
                                "4.5"}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-medium text-gray-400">
                              Mulai dari
                            </p>

                            <p className="text-sm font-black text-emerald-600">
                              {formatRupiah(
                                destination.price
                              )}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/destinations/${destination.id}`}
                          className="mt-5 flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </article>
                  )
                )}
              </div>
            ) : (
              /* EMPTY */
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <Search size={28} />
                </div>

                <h2 className="mt-5 text-xl font-black text-gray-900">
                  Destinasi tidak ditemukan
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Coba gunakan kata pencarian lain atau
                  ubah filter kategori dan budget.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* BOTTOM CTA */}
            {filteredDestinations.length > 0 && (
              <div className="mt-10 overflow-hidden rounded-3xl bg-emerald-600 p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <p className="text-sm font-bold text-emerald-100">
                      Sudah menemukan destinasi?
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-white">
                      Saatnya susun perjalananmu.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-emerald-100">
                      Gunakan Smart Trip Planner untuk
                      membuat itinerary dan mengatur budget
                      perjalanan.
                    </p>
                  </div>

                  <Link
                    href="/planner"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Buat Trip
                    <ArrowDownUp
                      size={16}
                      className="rotate-90"
                    />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}