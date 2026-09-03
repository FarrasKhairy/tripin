"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  WalletCards,
  Plus,
  Trash2,
  Hotel,
  BusFront,
  Utensils,
  Ticket,
  ShoppingBag,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const STORAGE_KEY = "tripin_budget";
const ITINERARY_KEY = "tripin_itinerary";
const TRIP_KEY = "tripin_trip";

const categories = [
  {
    id: "hotel",
    name: "Hotel",
    icon: Hotel,
  },
  {
    id: "transport",
    name: "Transportasi",
    icon: BusFront,
  },
  {
    id: "food",
    name: "Makanan",
    icon: Utensils,
  },
  {
    id: "ticket",
    name: "Tiket Wisata",
    icon: Ticket,
  },
  {
    id: "shopping",
    name: "Belanja",
    icon: ShoppingBag,
  },
  {
    id: "other",
    name: "Lainnya",
    icon: WalletCards,
  },
];

function parseAmount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) return 0;

  const cleaned = String(value).replace(/[^\d]/g, "");

  return Number(cleaned) || 0;
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getCategoryName(categoryId) {
  return (
    categories.find((category) => category.id === categoryId)?.name ||
    "Lainnya"
  );
}

function getCategoryIcon(categoryId) {
  return (
    categories.find((category) => category.id === categoryId)?.icon ||
    WalletCards
  );
}

export default function BudgetPage() {
  const [budget, setBudget] = useState(2000000);
  const [expenses, setExpenses] = useState([]);

  const [itineraryCost, setItineraryCost] = useState(0);
  const [itineraryItems, setItineraryItems] = useState([]);

  const [category, setCategory] = useState("hotel");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");

  const [budgetInput, setBudgetInput] = useState("2000000");
  const [editingBudget, setEditingBudget] = useState(false);

  // =========================================================
  // LOAD ITINERARY
  // =========================================================

  const loadItinerary = () => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(ITINERARY_KEY);

      if (!saved) {
        setItineraryCost(0);
        setItineraryItems([]);
        return;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setItineraryCost(0);
        setItineraryItems([]);
        return;
      }

      const items = [];

      parsed.forEach((day, dayIndex) => {
        const activities = Array.isArray(day?.activities)
          ? day.activities
          : [];

        activities.forEach((activity, activityIndex) => {
          const cost = parseAmount(activity?.cost);

          if (cost > 0) {
            items.push({
              id: `${dayIndex}-${activity?.id || activityIndex}`,
              day: dayIndex + 1,
              name: activity?.activity || "Aktivitas",
              destination: activity?.destination || "",
              cost,
            });
          }
        });
      });

      const total = items.reduce(
        (sum, item) => sum + item.cost,
        0
      );

      setItineraryItems(items);
      setItineraryCost(total);
    } catch (error) {
      console.error("Gagal membaca itinerary:", error);

      setItineraryCost(0);
      setItineraryItems([]);
    }
  };

  // =========================================================
  // LOAD BUDGET
  // =========================================================

  const loadBudget = () => {
    if (typeof window === "undefined") return;

    try {
      const savedBudget = localStorage.getItem(STORAGE_KEY);

      if (savedBudget) {
        const parsed = JSON.parse(savedBudget);

        const parsedBudget = parseAmount(parsed?.budget);

        if (parsedBudget > 0) {
          setBudget(parsedBudget);
          setBudgetInput(String(parsedBudget));
        }

        if (Array.isArray(parsed?.expenses)) {
          setExpenses(parsed.expenses);
        }

        return;
      }

      // Jika belum ada budget planner,
      // coba ambil budget dari My Trip.
      const savedTrip = localStorage.getItem(TRIP_KEY);

      if (savedTrip) {
        const trip = JSON.parse(savedTrip);

        const tripBudget = parseAmount(
          trip?.budget ||
            trip?.totalBudget ||
            trip?.settings?.budget
        );

        if (tripBudget > 0) {
          setBudget(tripBudget);
          setBudgetInput(String(tripBudget));
        }
      }
    } catch (error) {
      console.error("Gagal memuat budget:", error);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBudget();
    loadItinerary();
  }, []);

  // =========================================================
  // SAVE BUDGET
  // =========================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          budget,
          expenses,
        })
      );
    } catch (error) {
      console.error("Gagal menyimpan budget:", error);
    }
  }, [budget, expenses]);

  // =========================================================
  // STORAGE SYNC
  // =========================================================

  useEffect(() => {
    const handleStorage = () => {
      loadBudget();
      loadItinerary();
    };

    const handleTripUpdate = () => {
      loadBudget();
      loadItinerary();
    };

    const handleItineraryUpdate = () => {
      loadItinerary();
    };

    const handleFocus = () => {
      loadBudget();
      loadItinerary();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener(
      "tripin-trip-update",
      handleTripUpdate
    );

    window.addEventListener(
      "tripin-itinerary-update",
      handleItineraryUpdate
    );

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "tripin-trip-update",
        handleTripUpdate
      );

      window.removeEventListener(
        "tripin-itinerary-update",
        handleItineraryUpdate
      );

      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const manualExpenseTotal = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total + parseAmount(expense?.amount),
      0
    );
  }, [expenses]);

  const totalUsed = manualExpenseTotal + itineraryCost;

  const remaining = budget - totalUsed;

  const percentage =
    budget > 0
      ? Math.min((totalUsed / budget) * 100, 100)
      : 0;

  // =========================================================
  // CATEGORY TOTALS
  // =========================================================

  const categoryTotals = useMemo(() => {
    const totals = {};

    categories.forEach((item) => {
      totals[item.id] = 0;
    });

    expenses.forEach((expense) => {
      const validCategory = categories.some(
        (item) => item.id === expense?.category
      )
        ? expense.category
        : "other";

      totals[validCategory] += parseAmount(
        expense?.amount
      );
    });

    return totals;
  }, [expenses]);

  // =========================================================
  // ADD EXPENSE
  // =========================================================

  const handleAddExpense = (event) => {
    event.preventDefault();

    const numericAmount = parseAmount(amount);

    if (!expenseName.trim()) {
      alert("Masukkan nama pengeluaran.");
      return;
    }

    if (numericAmount <= 0) {
      alert("Masukkan nominal pengeluaran yang valid.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      name: expenseName.trim(),
      category,
      amount: numericAmount,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [
      newExpense,
      ...prev,
    ]);

    setExpenseName("");
    setAmount("");
  };

  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const handleDeleteExpense = (id) => {
    setExpenses((prev) =>
      prev.filter(
        (expense) => expense.id !== id
      )
    );
  };

  // =========================================================
  // UPDATE BUDGET
  // =========================================================

  const handleSaveBudget = () => {
    const numericBudget = parseAmount(
      budgetInput
    );

    if (numericBudget <= 0) {
      alert("Masukkan budget yang valid.");
      return;
    }

    setBudget(numericBudget);
    setBudgetInput(String(numericBudget));
    setEditingBudget(false);
  };

  // =========================================================
  // RESET EXPENSES
  // =========================================================

  const handleReset = () => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus semua pengeluaran manual?"
    );

    if (!confirmed) return;

    setExpenses([]);
  };

  return (
    <main className="min-h-screen bg-[#F7FBF8]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-emerald-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <Link
            href="/my-trip"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Kembali ke My Trip
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <WalletCards size={14} />
                BUDGET PLANNER
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                Atur budget perjalananmu
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Pantau pengeluaran perjalanan dan lihat biaya
                itinerary secara otomatis dalam satu tempat.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadBudget();
                loadItinerary();
              }}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RefreshCw size={16} />
              Sinkronkan Itinerary
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL BUDGET */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Budget
                </p>

                <p className="mt-2 text-2xl font-black text-gray-900">
                  {formatRupiah(budget)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <WalletCards size={21} />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditingBudget(!editingBudget)
              }
              className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              {editingBudget
                ? "Batal"
                : "Ubah budget →"}
            </button>
          </div>

          {/* USED */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Sudah Terpakai
                </p>

                <p className="mt-2 text-2xl font-black text-gray-900">
                  {formatRupiah(totalUsed)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <ShoppingBag size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-gray-400">
              {percentage.toFixed(0)}% dari budget
            </p>
          </div>

          {/* REMAINING */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Sisa Budget
                </p>

                <p
                  className={`mt-2 text-2xl font-black ${
                    remaining >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {formatRupiah(
                    Math.abs(remaining)
                  )}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  remaining >= 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {remaining >= 0 ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <AlertTriangle size={21} />
                )}
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-gray-400">
              {remaining >= 0
                ? "Masih aman"
                : "Melebihi budget"}
            </p>
          </div>

          {/* ITINERARY */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Biaya Itinerary
                </p>

                <p className="mt-2 text-2xl font-black text-gray-900">
                  {formatRupiah(itineraryCost)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <CalendarDays size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-gray-400">
              {itineraryItems.length} aktivitas berbayar
            </p>
          </div>
        </div>

        {/* ===================================================
            EDIT BUDGET
        =================================================== */}

        {editingBudget && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Budget perjalanan
                </label>

                <input
                  type="number"
                  min="0"
                  value={budgetInput}
                  onChange={(event) =>
                    setBudgetInput(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Contoh: 2000000"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBudget}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Simpan Budget
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-900">
                Progress Budget
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {formatRupiah(totalUsed)} dari{" "}
                {formatRupiah(budget)}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                percentage >= 100
                  ? "bg-red-50 text-red-600"
                  : percentage >= 80
                  ? "bg-orange-50 text-orange-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {percentage.toFixed(0)}%
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100
                  ? "bg-red-500"
                  : percentage >= 80
                  ? "bg-orange-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ADD EXPENSE */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Tambah Pengeluaran
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Catat pengeluaran di luar itinerary.
              </p>
            </div>

            <form
              onSubmit={handleAddExpense}
              className="mt-6 space-y-4"
            >
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Nama Pengeluaran
                </label>

                <input
                  type="text"
                  value={expenseName}
                  onChange={(event) =>
                    setExpenseName(
                      event.target.value
                    )
                  }
                  placeholder="Contoh: Hotel 2 malam"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Kategori
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((item) => {
                    const Icon = item.icon;

                    const active =
                      category === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setCategory(item.id)
                        }
                        className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${
                          active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-emerald-100 hover:bg-emerald-50"
                        }`}
                      >
                        <Icon size={16} />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AMOUNT */}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Nominal
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    Rp
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                <Plus size={18} />
                Tambah Pengeluaran
              </button>
            </form>
          </div>

          {/* BREAKDOWN */}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Breakdown Pengeluaran
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Pengeluaran manual berdasarkan kategori.
                </p>
              </div>

              {expenses.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {categories.map((item) => {
                const Icon = item.icon;

                const total =
                  categoryTotals[item.id] || 0;

                const maxValue = Math.max(
                  manualExpenseTotal,
                  1
                );

                const width = Math.min(
                  (total / maxValue) * 100,
                  100
                );

                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                          <Icon size={16} />
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        {formatRupiah(total)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================
            ITINERARY COST
        =================================================== */}

        <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <h2 className="font-black text-gray-900">
                    Biaya dari Itinerary
                  </h2>

                  <p className="text-xs text-gray-500">
                    Otomatis diambil dari aktivitas itinerary.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-medium text-gray-500">
                Total
              </p>

              <p className="text-xl font-black text-blue-600">
                {formatRupiah(itineraryCost)}
              </p>
            </div>
          </div>

          {itineraryItems.length > 0 ? (
            <div className="mt-5 space-y-2">
              {itineraryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-600">
                        DAY {item.day}
                      </span>

                      <p className="truncate text-sm font-bold text-gray-800">
                        {item.name}
                      </p>
                    </div>

                    {item.destination && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {item.destination}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-sm font-black text-gray-900">
                    {formatRupiah(item.cost)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-white p-6 text-center">
              <CalendarDays
                size={28}
                className="mx-auto text-blue-300"
              />

              <p className="mt-2 text-sm font-bold text-gray-700">
                Belum ada biaya dari itinerary
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Tambahkan aktivitas berbayar di halaman itinerary.
              </p>

              <Link
                href="/itinerary"
                className="mt-4 inline-flex rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600"
              >
                Buka Itinerary
              </Link>
            </div>
          )}
        </section>

        {/* ===================================================
            MANUAL EXPENSE LIST
        =================================================== */}

        <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Riwayat Pengeluaran
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Pengeluaran manual yang kamu tambahkan.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {expenses.length} item
            </span>
          </div>

          {expenses.length > 0 ? (
            <div className="mt-5 divide-y divide-gray-100">
              {expenses.map((expense) => {
                const Icon = getCategoryIcon(
                  expense.category
                );

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {expense.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {getCategoryName(
                          expense.category
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-black text-gray-900">
                      {formatRupiah(
                        expense.amount
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteExpense(
                          expense.id
                        )
                      }
                      title="Hapus"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <WalletCards
                size={30}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-bold text-gray-600">
                Belum ada pengeluaran manual
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Tambahkan pengeluaran menggunakan form di atas.
              </p>
            </div>
          )}
        </section>

        {/* ===================================================
            WARNING / TIP
        =================================================== */}

        <section className="mt-5">
          {remaining < 0 ? (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-red-500"
                size={21}
              />

              <div>
                <h3 className="text-sm font-black text-red-700">
                  Budget kamu sudah terlewati
                </h3>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  Pengeluaranmu melebihi budget sebesar{" "}
                  {formatRupiah(
                    Math.abs(remaining)
                  )}
                  . Coba kurangi beberapa pengeluaran
                  sebelum perjalanan.
                </p>
              </div>
            </div>
          ) : percentage >= 80 ? (
            <div className="flex gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-orange-500"
                size={21}
              />

              <div>
                <h3 className="text-sm font-black text-orange-700">
                  Budget mulai menipis
                </h3>

                <p className="mt-1 text-xs leading-5 text-orange-600">
                  Kamu sudah menggunakan sekitar{" "}
                  {percentage.toFixed(0)}% dari budget.
                  Sebaiknya sisakan dana untuk kebutuhan
                  tak terduga.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-emerald-600"
                size={21}
              />

              <div>
                <h3 className="text-sm font-black text-emerald-700">
                  Budget masih aman
                </h3>

                <p className="mt-1 text-xs leading-5 text-emerald-600">
                  Kamu masih memiliki{" "}
                  {formatRupiah(
                    Math.max(remaining, 0)
                  )}{" "}
                  untuk perjalanan.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}