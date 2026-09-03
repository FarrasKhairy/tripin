// lib/tripStorage.js

export const TRIP_KEY = "tripin_trip";
export const ITINERARY_KEY = "tripin_itinerary";
export const BUDGET_KEY = "tripin_budget";
export const WISHLIST_KEY = "tripin_wishlist";

export function normalizeTrip(trip = {}) {
  const destinations = Array.isArray(
    trip.destinations
  )
    ? trip.destinations.filter(Boolean)
    : trip.destination
      ? [
          {
            id:
              trip.destinationId ||
              "main-destination",
            name: trip.destination,
          },
        ]
      : [];

  return {
    ...trip,

    destination:
      trip.destination ||
      destinations[0]?.name ||
      "",

    destinationId:
      trip.destinationId ||
      destinations[0]?.id ||
      "",

    destinations,

    startDate: trip.startDate || "",
    endDate: trip.endDate || "",

    duration: Math.max(
      1,
      Number(trip.duration) || 1
    ),

    people: Math.max(
      1,
      Number(trip.people) || 1
    ),

    budget: Math.max(
      0,
      Number(trip.budget) || 0
    ),

    style: trip.style || "santai",

    updatedAt:
      trip.updatedAt ||
      new Date().toISOString(),
  };
}

export function getStoredTrip() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved =
      localStorage.getItem(TRIP_KEY);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    return normalizeTrip(parsed);
  } catch (error) {
    console.error(
      "Gagal membaca trip:",
      error
    );

    return null;
  }
}

export function saveTrip(trip) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalized = normalizeTrip({
    ...trip,
    updatedAt:
      new Date().toISOString(),
  });

  localStorage.setItem(
    TRIP_KEY,
    JSON.stringify(normalized)
  );

  window.dispatchEvent(
    new Event("tripin-trip-update")
  );

  return normalized;
}

export function addDestinationToTrip(
  destination
) {
  if (typeof window === "undefined") {
    return null;
  }

  if (!destination?.id) {
    return null;
  }

  const currentTrip =
    getStoredTrip();

  /*
   * Belum mempunyai trip.
   * Buat trip baru.
   */
  if (!currentTrip) {
    return saveTrip({
      destination:
        destination.name || "",

      destinationId:
        destination.id,

      destinations: [
        destination,
      ],

      startDate: "",
      endDate: "",
      duration: 1,
      people: 1,
      budget: 0,
      style: "santai",
    });
  }

  const destinations =
    Array.isArray(
      currentTrip.destinations
    )
      ? currentTrip.destinations
      : [];

  const alreadyExists =
    destinations.some(
      (item) =>
        String(item.id) ===
        String(destination.id)
    );

  if (alreadyExists) {
    return currentTrip;
  }

  return saveTrip({
    ...currentTrip,

    destination:
      currentTrip.destination ||
      destination.name ||
      "",

    destinationId:
      currentTrip.destinationId ||
      destination.id,

    destinations: [
      ...destinations,
      destination,
    ],
  });
}

export function removeDestinationFromTrip(
  destinationId
) {
  if (typeof window === "undefined") {
    return null;
  }

  const currentTrip =
    getStoredTrip();

  if (!currentTrip) {
    return null;
  }

  const destinations =
    Array.isArray(
      currentTrip.destinations
    )
      ? currentTrip.destinations.filter(
          (item) =>
            String(item.id) !==
            String(destinationId)
        )
      : [];

  /*
   * Kalau semua destinasi dihapus,
   * hapus trip.
   */
  if (destinations.length === 0) {
    localStorage.removeItem(
      TRIP_KEY
    );

    localStorage.removeItem(
      ITINERARY_KEY
    );

    window.dispatchEvent(
      new Event("tripin-trip-update")
    );

    return null;
  }

  return saveTrip({
    ...currentTrip,

    destination:
      destinations[0]?.name ||
      "",

    destinationId:
      destinations[0]?.id ||
      "",

    destinations,
  });
}

export function getTripDestinations() {
  const trip =
    getStoredTrip();

  if (!trip) {
    return [];
  }

  return Array.isArray(
    trip.destinations
  )
    ? trip.destinations
    : [];
}

export function clearTrip() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    TRIP_KEY
  );

  localStorage.removeItem(
    ITINERARY_KEY
  );

  localStorage.removeItem(
    BUDGET_KEY
  );

  window.dispatchEvent(
    new Event("tripin-trip-update")
  );

  window.dispatchEvent(
    new Event(
      "tripin-itinerary-update"
    )
  );

  window.dispatchEvent(
    new Event("tripin-budget-update")
  );
}