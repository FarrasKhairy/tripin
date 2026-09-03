"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const TRIP_KEY = "tripin_trip";

const EMPTY_TRIP = {
  destination: "",
  destinations: [],
  startDate: "",
  endDate: "",
  duration: 1,
  people: 1,
  style: "santai",
};

function getTrip() {
  try {
    const saved = localStorage.getItem(TRIP_KEY);

    if (!saved) {
      return EMPTY_TRIP;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return EMPTY_TRIP;
    }

    return {
      ...EMPTY_TRIP,
      ...parsed,
      destinations: Array.isArray(parsed.destinations)
        ? parsed.destinations
        : [],
    };
  } catch {
    return EMPTY_TRIP;
  }
}

function saveTrip(trip) {
  localStorage.setItem(
    TRIP_KEY,
    JSON.stringify({
      ...trip,
      updatedAt: new Date().toISOString(),
    })
  );

  window.dispatchEvent(
    new Event("tripin-trip-update")
  );
}

function formatRupiah(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 1;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 1;
  }

  const difference =
    Math.round(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.max(1, difference);
}

function getStyleLabel(style) {
  const styles = {
    santai: "Santai",
    petualangan: "Petualangan",
    kuliner: "Kuliner",
    budaya: "Budaya",
  };

  return styles[style] || "Santai";
}

export default function MyTripPage() {
  const [trip, setTrip] = useState(EMPTY_TRIP);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    people: 1,
    style: "santai",
  });

  useEffect(() => {
    setMounted(true);

    const loadTrip = () => {
      const currentTrip = getTrip();

      /*
       * Kompatibilitas dengan data lama:
       * jika belum ada destinations tetapi ada
       * destination, jadikan destination sebagai
       * satu-satunya destinasi.
       */
      if (
        currentTrip.destinations.length === 0 &&
        currentTrip.destination
      ) {
        currentTrip.destinations = [
          {
            id: `legacy-${currentTrip.destination}`,
            name: currentTrip.destination,
            location: "",
            category: "Destinasi",
            rating: 0,
            price: 0,
            image: "",
          },
        ];
      }

      setTrip(currentTrip);

      setForm({
        startDate: currentTrip.startDate || "",
        endDate: currentTrip.endDate || "",
        people: Number(currentTrip.people) || 1,
        style: currentTrip.style || "santai",
      });
    };

    loadTrip();

    window.addEventListener(
      "tripin-trip-update",
      loadTrip
    );

    window.addEventListener("storage", loadTrip);
    window.addEventListener("focus", loadTrip);

    return () => {
      window.removeEventListener(
        "tripin-trip-update",
        loadTrip
      );

      window.removeEventListener("storage", loadTrip);
      window.removeEventListener("focus", loadTrip);
    };
  }, []);

  const destinations = useMemo(() => {
    if (!Array.isArray(trip.destinations)) {
      return [];
    }

    return trip.destinations;
  }, [trip.destinations]);

  const totalDestinationBudget = useMemo(() => {
    return destinations.reduce(
      (total, destination) =>
        total + (Number(destination?.price) || 0),
      0
    );
  }, [destinations]);

  const estimatedTripBudget = useMemo(() => {
    const people = Math.max(
      1,
      Number(trip.people) || 1
    );

    return totalDestinationBudget * people;
  }, [totalDestinationBudget, trip.people]);

  const duration = calculateDuration(
    trip.startDate,
    trip.endDate
  );

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "people"
          ? Math.max(1, Number(value) || 1)
          : value,
    }));
  };

  const handleSaveTrip = (event) => {
    event.preventDefault();

    const calculatedDuration = calculateDuration(
      form.startDate,
      form.endDate
    );

    const updatedTrip = {
      ...trip,
      startDate: form.startDate,
      endDate: form.endDate,
      duration: calculatedDuration,
      people: Math.max(1, Number(form.people) || 1),
      style: form.style,
    };

    saveTrip(updatedTrip);

    setTrip(updatedTrip);
    setEditing(false);
  };

  const handleRemoveDestination = (destinationId) => {
    const updatedDestinations =
      destinations.filter(
        (destination) =>
          String(destination.id) !==
          String(destinationId)
      );

    const updatedTrip = {
      ...trip,
      destinations: updatedDestinations,
      destination:
        updatedDestinations.length > 0
          ? updatedDestinations[0]?.name || ""
          : "",
    };

    saveTrip(updatedTrip);
    setTrip(updatedTrip);
  };

  const handleClearTrip = () => {
    localStorage.removeItem(TRIP_KEY);

    const emptyTrip = {
      ...EMPTY_TRIP,
      destinations: [],
    };

    setTrip(emptyTrip);

    setForm({
      startDate: "",
      endDate: "",
      people: 1,
      style: "santai",
    });

    window.dispatchEvent(
      new Event("tripin-trip-update")
    );
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-6 h-32 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <MapPin size={14} />
                TRIP PLANNER
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                My Trip
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Kelola destinasi, tanggal perjalanan,
                jumlah orang, dan rencana perjalananmu
                dalam satu tempat.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Plus size={18} />
                Tambah Destinasi
              </Link>

              <Link
                href="/planner"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Smart Planner
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {destinations.length === 0 ? (
          /* EMPTY STATE */
          <section className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <MapPin size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-gray-900">
              Trip kamu masih kosong
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              Pilih destinasi dari Explore lalu
              tambahkan ke trip. Kamu juga bisa
              menggunakan Smart Planner untuk membuat
              itinerary secara otomatis.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <CompassIcon />
                Explore Destinasi
              </Link>

              <Link
                href="/planner"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Buat Trip dengan Planner
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* TRIP SUMMARY */}
            <section className="overflow-hidden rounded-3xl bg-gray-900 text-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      Rencana Perjalanan
                    </p>

                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                      {destinations.length}{" "}
                      {destinations.length === 1
                        ? "Destinasi"
                        : "Destinasi"}{" "}
                      Pilihanmu
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      {trip.startDate
                        ? `${formatDate(
                            trip.startDate
                          )} — ${
                            trip.endDate
                              ? formatDate(
                                  trip.endDate
                                )
                              : "Belum ditentukan"
                          }`
                        : "Tanggal perjalanan belum diatur"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    <Pencil size={17} />
                    Atur Trip
                  </button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryItem
                    icon={<CalendarDays size={19} />}
                    label="Durasi"
                    value={`${duration} Hari`}
                  />

                  <SummaryItem
                    icon={<Users size={19} />}
                    label="Peserta"
                    value={`${Number(trip.people) || 1} Orang`}
                  />

                  <SummaryItem
                    icon={<WalletCards size={19} />}
                    label="Estimasi"
                    value={formatRupiah(
                      estimatedTripBudget
                    )}
                  />

                  <SummaryItem
                    icon={<Clock3 size={19} />}
                    label="Gaya"
                    value={getStyleLabel(trip.style)}
                  />
                </div>
              </div>
            </section>

            {/* DESTINATIONS */}
            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    Destinasi Trip
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {destinations.length} destinasi
                    tersimpan
                  </p>
                </div>

                <Link
                  href="/explore"
                  className="hidden items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 sm:flex"
                >
                  Tambah lagi
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {destinations.map(
                  (destination, index) => (
                    <DestinationTripCard
                      key={
                        destination.id ??
                        `${destination.name}-${index}`
                      }
                      destination={destination}
                      index={index}
                      onRemove={
                        handleRemoveDestination
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* TOOLS */}
            <section className="mt-10 grid gap-5 md:grid-cols-3">
              <ToolCard
                href="/itinerary"
                icon={
                  <CalendarDays size={22} />
                }
                title="Itinerary"
                description="Susun aktivitas perjalanan berdasarkan hari."
              />

              <ToolCard
                href="/budget"
                icon={
                  <WalletCards size={22} />
                }
                title="Budget Planner"
                description="Atur dan pantau budget perjalananmu."
              />

              <ToolCard
                href="/planner"
                icon={
                  <CheckCircle2 size={22} />
                }
                title="Smart Planner"
                description="Buat rencana perjalanan otomatis."
              />
            </section>

            {/* BOTTOM ACTION */}
            <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h3 className="font-black text-gray-900">
                  Mau menambahkan destinasi lain?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Jelajahi lebih banyak tempat dan
                  tambahkan ke trip kamu.
                </p>
              </div>

              <Link
                href="/explore"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Explore Sekarang
                <ArrowRight size={17} />
              </Link>
            </section>

            {/* CLEAR */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleClearTrip}
                className="text-xs font-semibold text-gray-400 transition hover:text-red-500"
              >
                Hapus semua data trip
              </button>
            </div>
          </>
        )}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Atur Trip
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Sesuaikan detail perjalananmu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Tutup"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSaveTrip}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Tanggal Berangkat
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Tanggal Pulang
                  </label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="people"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Jumlah Orang
                </label>

                <input
                  id="people"
                  name="people"
                  type="number"
                  min="1"
                  max="50"
                  value={form.people}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="style"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Gaya Trip
                </label>

                <select
                  id="style"
                  name="style"
                  value={form.style}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="santai">
                    Santai
                  </option>
                  <option value="petualangan">
                    Petualangan
                  </option>
                  <option value="kuliner">
                    Kuliner
                  </option>
                  <option value="budaya">
                    Budaya
                  </option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className="text-emerald-400">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-sm font-bold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DestinationTripCard({
  destination,
  index,
  onRemove,
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-emerald-50">
        {destination.image ? (
          <img
            src={destination.image}
            alt={destination.name || "Destinasi"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-emerald-600">
            <MapPin size={42} />
          </div>
        )}

        <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-sm font-black text-gray-900 shadow-sm backdrop-blur">
          {index + 1}
        </div>

        <button
          type="button"
          onClick={() =>
            onRemove(destination.id)
          }
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-gray-500 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-500"
          title="Hapus dari trip"
          aria-label={`Hapus ${destination.name || "destinasi"} dari trip`}
        >
          <X size={17} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-gray-900">
              {destination.name ||
                "Destinasi Tanpa Nama"}
            </h3>

            {destination.location && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={13} />
                <span className="truncate">
                  {destination.location}
                </span>
              </div>
            )}
          </div>

          {destination.rating > 0 && (
            <div className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
              ★ {destination.rating}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-[11px] font-medium text-gray-400">
              Estimasi
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

function ToolCard({
  href,
  icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-100 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-5 font-black text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
        Buka
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}

function CompassIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16 8 14 14 8 16 10 10 16 8" />
    </svg>
  );
}