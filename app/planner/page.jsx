"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

const TRIP_KEY = "tripin_trip";
const BUDGET_KEY = "tripin_budget";
const ITINERARY_KEY = "tripin_itinerary";
const WISHLIST_KEY = "tripin_wishlist";

const styles = [
  {
    id: "santai",
    title: "Santai",
    description: "Jalan-jalan ringan tanpa terlalu padat",
    emoji: "🌿",
  },
  {
    id: "petualangan",
    title: "Petualangan",
    description: "Eksplor tempat menarik dan aktivitas seru",
    emoji: "🏕️",
  },
  {
    id: "kuliner",
    title: "Kuliner",
    description: "Fokus menikmati makanan khas daerah",
    emoji: "🍜",
  },
  {
    id: "budaya",
    title: "Budaya",
    description: "Wisata sejarah, budaya, dan tempat ikonik",
    emoji: "🏛️",
  },
];

const activityTemplates = {
  santai: [
    {
      time: "09:00",
      activity: "Sarapan dan persiapan",
      cost: 50000,
    },
    {
      time: "10:00",
      activity: "Explore destinasi utama",
      cost: 75000,
    },
    {
      time: "14:00",
      activity: "Istirahat dan makan siang",
      cost: 75000,
    },
    {
      time: "16:00",
      activity: "Menikmati suasana sore",
      cost: 50000,
    },
  ],
  petualangan: [
    {
      time: "07:00",
      activity: "Persiapan dan sarapan",
      cost: 50000,
    },
    {
      time: "09:00",
      activity: "Eksplorasi tempat wisata",
      cost: 100000,
    },
    {
      time: "13:00",
      activity: "Makan siang",
      cost: 75000,
    },
    {
      time: "15:00",
      activity: "Aktivitas outdoor",
      cost: 100000,
    },
  ],
  kuliner: [
    {
      time: "08:00",
      activity: "Sarapan kuliner lokal",
      cost: 60000,
    },
    {
      time: "11:00",
      activity: "Berburu makanan khas",
      cost: 100000,
    },
    {
      time: "14:00",
      activity: "Makan siang",
      cost: 100000,
    },
    {
      time: "18:00",
      activity: "Kuliner malam",
      cost: 100000,
    },
  ],
  budaya: [
    {
      time: "08:00",
      activity: "Sarapan",
      cost: 50000,
    },
    {
      time: "09:00",
      activity: "Mengunjungi tempat bersejarah",
      cost: 75000,
    },
    {
      time: "13:00",
      activity: "Makan siang",
      cost: 75000,
    },
    {
      time: "15:00",
      activity: "Eksplorasi budaya lokal",
      cost: 75000,
    },
  ],
};

function formatRupiah(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDuration(startDate, endDate) {
  if (!startDate || !endDate) return 1;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference = end.getTime() - start.getTime();
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(1, Math.min(7, days));
}

function createDateFromStart(startDate, dayIndex) {
  const date = new Date(`${startDate}T00:00:00`);

  date.setDate(date.getDate() + dayIndex);

  return date.toISOString().split("T")[0];
}

export default function PlannerPage() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState(2000000);
  const [style, setStyle] = useState("santai");

  const [wishlist, setWishlist] = useState([]);
  const [selectedWishlistId, setSelectedWishlistId] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      const parsedWishlist = savedWishlist
        ? JSON.parse(savedWishlist)
        : [];

      if (Array.isArray(parsedWishlist)) {
        setWishlist(parsedWishlist);
      }

      const savedTrip = localStorage.getItem(TRIP_KEY);

      if (savedTrip) {
        const trip = JSON.parse(savedTrip);

        if (trip && typeof trip === "object") {
          if (trip.destination) {
            setDestination(trip.destination);
          }

          if (trip.startDate) {
            setStartDate(trip.startDate);
          }

          if (trip.endDate) {
            setEndDate(trip.endDate);
          }

          if (trip.people) {
            setPeople(Number(trip.people) || 2);
          }

          if (trip.style) {
            setStyle(trip.style);
          }
        }
      }

      const savedBudget = localStorage.getItem(BUDGET_KEY);

      if (savedBudget) {
        const parsedBudget = JSON.parse(savedBudget);

        if (parsedBudget?.budget) {
          setBudget(Number(parsedBudget.budget) || 2000000);
        }
      }
    } catch {
      // Abaikan data localStorage yang rusak.
    }
  }, []);

  const duration = useMemo(() => {
    return getDuration(startDate, endDate);
  }, [startDate, endDate]);

  const selectedStyle = styles.find((item) => item.id === style);

  const estimatedDailyActivityCost = useMemo(() => {
    const activities = activityTemplates[style] || [];

    return activities.reduce(
      (total, activity) => total + Number(activity.cost || 0),
      0
    );
  }, [style]);

  const estimatedActivityCost =
    estimatedDailyActivityCost * people * duration;

  const budgetPercentage =
    budget > 0
      ? Math.min(100, (estimatedActivityCost / budget) * 100)
      : 0;

  const selectWishlistDestination = (item) => {
    setSelectedWishlistId(String(item.id));
    setDestination(item.name || "");
  };

  const handleWishlistChange = (event) => {
    const id = event.target.value;

    setSelectedWishlistId(id);

    if (!id) return;

    const selected = wishlist.find(
      (item) => String(item.id) === String(id)
    );

    if (selected) {
      setDestination(selected.name || "");
    }
  };

  const handleStartDateChange = (event) => {
    const value = event.target.value;

    setStartDate(value);

    if (!endDate || endDate < value) {
      const autoEnd = new Date(`${value}T00:00:00`);

      autoEnd.setDate(autoEnd.getDate() + 2);

      setEndDate(autoEnd.toISOString().split("T")[0]);
    }
  };

  const handleGenerate = () => {
    if (!destination.trim()) {
      alert("Silakan masukkan destinasi terlebih dahulu.");
      return;
    }

    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal perjalanan.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    if (people < 1) {
      alert("Jumlah orang minimal 1.");
      return;
    }

    if (budget < 0) {
      alert("Budget tidak boleh negatif.");
      return;
    }

    setLoading(true);

    const activitiesTemplate =
      activityTemplates[style] || activityTemplates.santai;

    const generatedDays = Array.from(
      { length: duration },
      (_, index) => {
        const date = createDateFromStart(startDate, index);

        const dayActivities = activitiesTemplate.map(
          (activity, activityIndex) => ({
            id: `${Date.now()}-${index}-${activityIndex}`,
            time: activity.time,
            destination: destination.trim(),
            activity: activity.activity,
            cost:
              Number(activity.cost || 0) * Number(people || 1),
            completed: false,
          })
        );

        return {
          id: `day-${index + 1}`,
          day: index + 1,
          date,
          activities: dayActivities,
        };
      }
    );

    const itinerary = {
      destination: destination.trim(),
      startDate,
      endDate,
      duration,
      people: Number(people),
      style,
      days: generatedDays,
      updatedAt: new Date().toISOString(),
    };

    const trip = {
      destination: destination.trim(),
      startDate,
      endDate,
      duration,
      people: Number(people),
      style,
      updatedAt: new Date().toISOString(),
    };

    const budgetData = {
      budget: Number(budget),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
    localStorage.setItem(
      BUDGET_KEY,
      JSON.stringify(budgetData)
    );
    localStorage.setItem(
      ITINERARY_KEY,
      JSON.stringify(itinerary)
    );

    setTimeout(() => {
      router.push("/my-trip");
    }, 250);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
              <Sparkles size={16} />
              Smart Trip Planner
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Rencanakan perjalananmu
              <span className="text-emerald-600">
                {" "}
                dengan mudah.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Isi beberapa informasi perjalanan dan TRIPIN
              akan membantu membuat itinerary awal yang bisa
              kamu sesuaikan kembali.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* FORM */}
          <div className="space-y-6">
            {/* DESTINATION */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  1. Mau ke mana?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Pilih destinasi dari Wishlist atau masukkan
                  sendiri.
                </p>
              </div>

              {wishlist.length > 0 && (
                <div className="mb-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Heart
                      size={17}
                      className="text-red-500"
                      fill="currentColor"
                    />
                    <p className="text-sm font-bold text-gray-800">
                      Destinasi dari Wishlist
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {wishlist.slice(0, 4).map((item) => {
                      const active =
                        String(item.id) ===
                        String(selectedWishlistId);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            selectWishlistDestination(item)
                          }
                          className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            active
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                          }`}
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || "Destinasi"}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <MapPin size={20} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {item.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {item.location || "Indonesia"}
                            </p>
                          </div>

                          {active && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                              <Check size={15} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <select
                    value={selectedWishlistId}
                    onChange={handleWishlistChange}
                    className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">
                      Pilih destinasi Wishlist...
                    </option>

                    {wishlist.map((item) => (
                      <option
                        key={item.id}
                        value={String(item.id)}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="destination"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Destinasi
                </label>

                <div className="relative">
                  <MapPin
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="destination"
                    type="text"
                    value={destination}
                    onChange={(event) => {
                      setDestination(event.target.value);
                      setSelectedWishlistId("");
                    }}
                    placeholder="Contoh: Yogyakarta"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>

            {/* DATE */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  2. Kapan perjalanannya?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Maksimal 7 hari untuk itinerary otomatis.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Tanggal mulai
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Tanggal selesai
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="endDate"
                      type="date"
                      min={startDate || undefined}
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(event.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      Durasi perjalanan
                    </p>
                    <p className="mt-1 text-lg font-black text-emerald-900">
                      {duration} hari
                    </p>
                  </div>

                  <CalendarDays
                    size={28}
                    className="text-emerald-500"
                  />
                </div>

                {startDate && endDate && (
                  <p className="mt-2 text-xs text-emerald-700">
                    {formatDate(startDate)} —{" "}
                    {formatDate(endDate)}
                  </p>
                )}
              </div>
            </div>

            {/* PEOPLE + BUDGET */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  3. Atur budget perjalanan
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Sesuaikan jumlah orang dan budget yang kamu
                  punya.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="people"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Jumlah orang
                  </label>

                  <div className="relative">
                    <Users
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="people"
                      type="number"
                      min="1"
                      max="20"
                      value={people}
                      onChange={(event) =>
                        setPeople(
                          Math.max(
                            1,
                            Number(event.target.value) || 1
                          )
                        )
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="budget"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Total budget
                  </label>

                  <div className="relative">
                    <WalletCards
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="budget"
                      type="number"
                      min="0"
                      step="50000"
                      value={budget}
                      onChange={(event) =>
                        setBudget(
                          Math.max(
                            0,
                            Number(event.target.value) || 0
                          )
                        )
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <p className="mt-2 text-xs font-semibold text-gray-400">
                    {formatRupiah(budget)}
                  </p>
                </div>
              </div>
            </div>

            {/* STYLE */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  4. Pilih gaya perjalanan
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Gaya ini digunakan untuk membuat rekomendasi
                  aktivitas awal.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {styles.map((item) => {
                  const active = style === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStyle(item.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                            {item.emoji}
                          </div>

                          <div>
                            <p className="font-black text-gray-900">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {active && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="bg-emerald-600 p-6 text-white">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                  <Sparkles size={17} />
                  Trip Preview
                </div>

                <h2 className="mt-3 text-2xl font-black">
                  {destination || "Destinasi kamu"}
                </h2>

                <p className="mt-1 text-sm text-emerald-100">
                  {duration} hari • {people} orang
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Gaya perjalanan
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl">
                      {selectedStyle?.emoji}
                    </span>

                    <span className="font-black text-gray-900">
                      {selectedStyle?.title}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Budget
                    </span>

                    <span className="font-black text-gray-900">
                      {formatRupiah(budget)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Estimasi aktivitas
                    </span>

                    <span className="font-black text-emerald-600">
                      {formatRupiah(
                        estimatedActivityCost
                      )}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetPercentage >= 100
                          ? "bg-red-500"
                          : budgetPercentage >= 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${budgetPercentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Estimasi ini hanya untuk aktivitas,
                    belum termasuk hotel dan transportasi.
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-800">
                    Yang akan dibuat:
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-gray-500">
                    <li className="flex gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      Trip tersimpan di My Trip
                    </li>

                    <li className="flex gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      Itinerary otomatis {duration} hari
                    </li>

                    <li className="flex gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      Budget tersimpan
                    </li>

                    <li className="flex gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      Aktivitas siap diedit
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Membuat trip...
                    </>
                  ) : (
                    <>
                      Buat Trip Saya
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-gray-400">
                  Kamu masih bisa mengubah itinerary dan
                  budget setelah trip dibuat.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}