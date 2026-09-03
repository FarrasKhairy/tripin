"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MapPlus, Plus } from "lucide-react";

const TRIP_KEY = "tripin_trip";

function getTrip() {
  try {
    const saved = localStorage.getItem(TRIP_KEY);

    if (!saved) return null;

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export default function AddToTripButton({
  destination,
}) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!destination?.id) return;

    const trip = getTrip();

    if (!trip) {
      setAdded(false);
      return;
    }

    const tripDestinations = Array.isArray(
      trip.destinations
    )
      ? trip.destinations
      : [];

    const exists = tripDestinations.some(
      (item) =>
        String(item.id) === String(destination.id)
    );

    setAdded(exists);
  }, [destination?.id]);

  const handleAddToTrip = () => {
    if (!destination?.id) return;

    const currentTrip = getTrip();

    /*
     * Kalau belum punya trip,
     * buat trip baru secara otomatis.
     */
    if (!currentTrip) {
      const newTrip = {
        destination: destination.name || "",
        destinations: [destination],
        startDate: "",
        endDate: "",
        duration: 1,
        people: 1,
        style: "santai",
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        TRIP_KEY,
        JSON.stringify(newTrip)
      );

      setAdded(true);

      window.dispatchEvent(
        new Event("tripin-trip-update")
      );

      return;
    }

    const destinationsInTrip = Array.isArray(
      currentTrip.destinations
    )
      ? currentTrip.destinations
      : [];

    const exists = destinationsInTrip.some(
      (item) =>
        String(item.id) === String(destination.id)
    );

    if (exists) {
      setAdded(true);
      return;
    }

    const updatedDestinations = [
      ...destinationsInTrip,
      destination,
    ];

    const updatedTrip = {
      ...currentTrip,
      destination:
        currentTrip.destination ||
        destination.name ||
        "",
      destinations: updatedDestinations,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      TRIP_KEY,
      JSON.stringify(updatedTrip)
    );

    setAdded(true);

    window.dispatchEvent(
      new Event("tripin-trip-update")
    );
  };

  if (added) {
    return (
      <Link
        href="/my-trip"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700"
      >
        <Check size={18} />
        Sudah di Trip
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToTrip}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-4 text-sm font-black text-white transition hover:bg-gray-800"
    >
      <Plus size={19} />
      Tambah ke Trip
    </button>
  );
}