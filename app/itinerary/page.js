"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Trash2,
  WalletCards,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getStoredTrip,
  saveTrip,
} from "@/lib/tripStorage";

const ITINERARY_KEY = "tripin_itinerary";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function createActivity() {
  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    time: "09:00",
    destination: "",
    activity: "",
    cost: 0,
    completed: false,
  };
}

function createDay(dayNumber, date = "") {
  return {
    id: `day-${dayNumber}`,
    day: dayNumber,
    date,
    activities: [],
  };
}

function getStoredItinerary() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved =
      localStorage.getItem(ITINERARY_KEY);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveItinerary(itinerary) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ITINERARY_KEY,
    JSON.stringify({
      ...itinerary,
      updatedAt: new Date().toISOString(),
    })
  );

  window.dispatchEvent(
    new Event("tripin-itinerary-update")
  );
}

function createDateFromStart(startDate, dayIndex) {
  if (!startDate) {
    return "";
  }

  const date = new Date(startDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(
    date.getDate() + dayIndex
  );

  return date.toISOString().split("T")[0];
}

export default function ItineraryPage() {
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] =
    useState(null);

  const [selectedDay, setSelectedDay] =
    useState(0);

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState(
    createActivity()
  );

  const loadData = () => {
    const storedTrip = getStoredTrip();
    const storedItinerary =
      getStoredItinerary();

    setTrip(storedTrip);
    setItinerary(storedItinerary);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener(
      "tripin-trip-update",
      handleUpdate
    );

    window.addEventListener(
      "tripin-itinerary-update",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    window.addEventListener(
      "focus",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "tripin-trip-update",
        handleUpdate
      );

      window.removeEventListener(
        "tripin-itinerary-update",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        "focus",
        handleUpdate
      );
    };
  }, []);

  /*
   * Semua destinasi yang dipilih
   * di My Trip.
   */
  const destinations = useMemo(() => {
    if (!trip) {
      return [];
    }

    if (
      Array.isArray(trip.destinations) &&
      trip.destinations.length > 0
    ) {
      return trip.destinations;
    }

    if (trip.destination) {
      return [
        {
          id:
            trip.destinationId ||
            "main-destination",
          name: trip.destination,
        },
      ];
    }

    return [];
  }, [trip]);

  /*
   * Kalau belum ada itinerary,
   * otomatis buat berdasarkan durasi trip.
   */
  useEffect(() => {
    if (!trip || destinations.length === 0) {
      return;
    }

    const duration = Math.min(
      7,
      Math.max(
        1,
        Number(trip.duration) || 1
      )
    );

    const current =
      getStoredItinerary();

    if (
      current &&
      Array.isArray(current.days) &&
      current.days.length > 0
    ) {
      return;
    }

    const days = Array.from(
      { length: duration },
      (_, index) =>
        createDay(
          index + 1,
          createDateFromStart(
            trip.startDate,
            index
          )
        )
    );

    const newItinerary = {
      destination:
        trip.destination ||
        destinations[0]?.name ||
        "",

      startDate: trip.startDate || "",
      endDate: trip.endDate || "",
      duration,
      days,
      updatedAt:
        new Date().toISOString(),
    };

    saveItinerary(newItinerary);
    setItinerary(newItinerary);
  }, [
    trip,
    destinations.length,
  ]);

  /*
   * Pastikan selectedDay tidak keluar
   * dari jumlah hari.
   */
  useEffect(() => {
    if (!itinerary?.days?.length) {
      setSelectedDay(0);
      return;
    }

    setSelectedDay((current) =>
      Math.min(
        current,
        itinerary.days.length - 1
      )
    );
  }, [itinerary?.days?.length]);

  const currentDay =
    itinerary?.days?.[selectedDay] || null;

  const currentActivities =
    Array.isArray(currentDay?.activities)
      ? currentDay.activities
      : [];

  const totalCost = useMemo(() => {
    if (!itinerary?.days) {
      return 0;
    }

    return itinerary.days.reduce(
      (total, day) => {
        const activities =
          Array.isArray(day.activities)
            ? day.activities
            : [];

        return (
          total +
          activities.reduce(
            (dayTotal, activity) =>
              dayTotal +
              parseNumber(activity.cost),
            0
          )
        );
      },
      0
    );
  }, [itinerary]);

  const totalActivities = useMemo(() => {
    if (!itinerary?.days) {
      return 0;
    }

    return itinerary.days.reduce(
      (total, day) => {
        return (
          total +
          (Array.isArray(day.activities)
            ? day.activities.length
            : 0)
        );
      },
      0
    );
  }, [itinerary]);

  const completedActivities = useMemo(() => {
    if (!itinerary?.days) {
      return 0;
    }

    return itinerary.days.reduce(
      (total, day) => {
        const activities =
          Array.isArray(day.activities)
            ? day.activities
            : [];

        return (
          total +
          activities.filter(
            (activity) =>
              activity.completed
          ).length
        );
      },
      0
    );
  }, [itinerary]);

  const updateItinerary = (updated) => {
    setItinerary(updated);
    saveItinerary(updated);
  };

  const handleAddActivity = (event) => {
    event.preventDefault();

    if (!itinerary || !currentDay) {
      return;
    }

    if (!form.activity.trim()) {
      return;
    }

    const activity = {
      ...form,
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      activity: form.activity.trim(),
      cost: parseNumber(form.cost),
    };

    const updatedDays =
      itinerary.days.map((day, index) => {
        if (index !== selectedDay) {
          return day;
        }

        return {
          ...day,
          activities: [
            ...(Array.isArray(day.activities)
              ? day.activities
              : []),
            activity,
          ],
        };
      });

    updateItinerary({
      ...itinerary,
      days: updatedDays,
    });

    setForm(createActivity());
    setShowForm(false);
  };

  const handleDeleteActivity = (
    activityId
  ) => {
    if (!itinerary) {
      return;
    }

    const updatedDays =
      itinerary.days.map((day, index) => {
        if (index !== selectedDay) {
          return day;
        }

        return {
          ...day,
          activities: (
            Array.isArray(day.activities)
              ? day.activities
              : []
          ).filter(
            (activity) =>
              activity.id !== activityId
          ),
        };
      });

    updateItinerary({
      ...itinerary,
      days: updatedDays,
    });
  };

  const handleToggleActivity = (
    activityId
  ) => {
    if (!itinerary) {
      return;
    }

    const updatedDays =
      itinerary.days.map((day, index) => {
        if (index !== selectedDay) {
          return day;
        }

        return {
          ...day,
          activities: (
            Array.isArray(day.activities)
              ? day.activities
              : []
          ).map((activity) =>
            activity.id === activityId
              ? {
                  ...activity,
                  completed:
                    !activity.completed,
                }
              : activity
          ),
        };
      });

    updateItinerary({
      ...itinerary,
      days: updatedDays,
    });
  };

  const handleAddDestinationActivity = (
    destination
  ) => {
    setForm({
      ...createActivity(),
      destination:
        destination.name || "",
    });

    setShowForm(true);
  };

  /*
   * Belum punya trip.
   */
  if (!trip || destinations.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CalendarDays size={30} />
            </div>

            <h1 className="mt-6 text-2xl font-black text-gray-900 sm:text-3xl">
              Itinerary masih kosong
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
              Tambahkan destinasi ke My Trip terlebih
              dahulu untuk mulai membuat itinerary.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/explore"
                className="rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Explore Destinasi
              </Link>

              <Link
                href="/my-trip"
                className="rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-black text-gray-700 transition hover:bg-gray-50"
              >
                Buka My Trip
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * Loading itinerary.
   */
  if (!itinerary || !currentDay) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Menyiapkan itinerary...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black tracking-wide text-emerald-600">
                ITINERARY
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                Rencana Perjalanan
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {destinations.length} destinasi
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} />
                  {itinerary.duration} hari
                </span>

                <span>
                  {formatDate(
                    itinerary.startDate
                  )}
                  {" - "}
                  {formatDate(
                    itinerary.endDate
                  )}
                </span>
              </div>
            </div>

            <Link
              href="/budget"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-gray-800"
            >
              <WalletCards size={17} />
              Lihat Budget
            </Link>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Destinasi Trip
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Pilih destinasi untuk menambah
                aktivitas.
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {destinations.map(
              (destination) => (
                <button
                  key={destination.id}
                  type="button"
                  onClick={() =>
                    handleAddDestinationActivity(
                      destination
                    )
                  }
                  className="group flex min-w-[220px] items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-gray-900">
                      {destination.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {destination.location ||
                        "Indonesia"}
                    </p>
                  </div>

                  <Plus
                    size={17}
                    className="shrink-0 text-gray-400 transition group-hover:text-emerald-600"
                  />
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400">
              Total Aktivitas
            </p>

            <p className="mt-1 text-2xl font-black text-gray-900">
              {totalActivities}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400">
              Selesai
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-600">
              {completedActivities}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400">
              Estimasi Aktivitas
            </p>

            <p className="mt-1 text-xl font-black text-gray-900">
              {formatRupiah(totalCost)}
            </p>
          </div>
        </div>
      </section>

      {/* DAY SELECTOR */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {itinerary.days.map(
            (day, index) => (
              <button
                key={day.id || index}
                type="button"
                onClick={() =>
                  setSelectedDay(index)
                }
                className={`min-w-[110px] rounded-2xl border px-4 py-3 text-left transition ${
                  selectedDay === index
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-gray-100 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                <p className="text-xs font-bold opacity-70">
                  HARI
                </p>

                <p className="mt-0.5 text-lg font-black">
                  {day.day}
                </p>

                <p className="mt-0.5 text-xs opacity-70">
                  {formatDate(day.date)}
                </p>
              </button>
            )
          )}
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-6 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* ACTIVITIES */}
          <div>
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Hari {currentDay.day}
                  </p>

                  <h2 className="mt-1 text-xl font-black text-gray-900">
                    {formatDate(
                      currentDay.date
                    )}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setForm(
                      createActivity()
                    );
                    setShowForm(!showForm);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  <Plus size={17} />
                  Tambah Aktivitas
                </button>
              </div>

              {/* FORM */}
              {showForm && (
                <form
                  onSubmit={
                    handleAddActivity
                  }
                  className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700">
                        Waktu
                      </label>

                      <input
                        type="time"
                        value={form.time}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            time: event.target
                              .value,
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700">
                        Destinasi
                      </label>

                      <select
                        value={
                          form.destination
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            destination:
                              event.target
                                .value,
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="">
                          Pilih destinasi
                        </option>

                        {destinations.map(
                          (destination) => (
                            <option
                              key={
                                destination.id
                              }
                              value={
                                destination.name
                              }
                            >
                              {
                                destination.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700">
                        Aktivitas
                      </label>

                      <input
                        type="text"
                        value={
                          form.activity
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            activity:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Contoh: Mengunjungi Malioboro"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700">
                        Estimasi Biaya
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={form.cost}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            cost: event.target
                              .value,
                          })
                        }
                        placeholder="0"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
                    >
                      Simpan
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowForm(false)
                      }
                      className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}

              {/* ACTIVITY LIST */}
              <div className="mt-6">
                {currentActivities.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                      <CalendarDays
                        size={23}
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-black text-gray-800">
                      Belum ada aktivitas
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Tambahkan aktivitas untuk
                      hari ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentActivities.map(
                      (activity) => (
                        <div
                          key={activity.id}
                          className={`rounded-2xl border p-4 transition ${
                            activity.completed
                              ? "border-emerald-100 bg-emerald-50/60"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleActivity(
                                  activity.id
                                )
                              }
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                activity.completed
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {activity.completed && (
                                <span className="text-xs font-black">
                                  ✓
                                </span>
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p
                                    className={`text-base font-black ${
                                      activity.completed
                                        ? "text-gray-400 line-through"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {
                                      activity.activity
                                    }
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock3
                                        size={
                                          13
                                        }
                                      />
                                      {
                                        activity.time
                                      }
                                    </span>

                                    {activity.destination && (
                                      <span className="flex items-center gap-1">
                                        <MapPin
                                          size={
                                            13
                                          }
                                        />
                                        {
                                          activity.destination
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                                  <p className="text-sm font-black text-emerald-600">
                                    {formatRupiah(
                                      activity.cost
                                    )}
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteActivity(
                                        activity.id
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-gray-900">
                Ringkasan Trip
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">
                    Destinasi
                  </span>

                  <span className="text-sm font-black text-gray-900">
                    {destinations.length}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">
                    Durasi
                  </span>

                  <span className="text-sm font-black text-gray-900">
                    {itinerary.duration} hari
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">
                    Aktivitas
                  </span>

                  <span className="text-sm font-black text-gray-900">
                    {totalActivities}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Estimasi aktivitas
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-600">
                    {formatRupiah(totalCost)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">
                  Progress
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{
                      width:
                        totalActivities === 0
                          ? "0%"
                          : `${
                              (completedActivities /
                                totalActivities) *
                              100
                            }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-emerald-600">
                  {completedActivities} dari{" "}
                  {totalActivities} aktivitas
                  selesai
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href="/budget"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-black text-emerald-600 transition hover:bg-emerald-50"
                >
                  Atur Budget
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/my-trip"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white transition hover:bg-gray-800"
                >
                  Kembali ke My Trip
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}