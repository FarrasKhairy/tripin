"use client";

import Link from "next/link";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";

export default function DestinationCard({ destination }) {
  if (!destination) return null;

  const {
    id,
    name,
    location,
    category,
    rating,
    price,
    image,
  } = destination;

  const formatPrice = (value) => {
    return new Intl.NumberFormat("id-ID").format(value || 0);
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Category */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm backdrop-blur">
            {category}
          </span>
        </div>

        {/* Wishlist */}
        <div className="absolute right-4 top-4">
          <WishlistButton destination={destination} />
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
          <Star
            size={15}
            fill="currentColor"
            className="text-yellow-300"
          />
          {rating}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold text-gray-900">
              {name}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={15} className="shrink-0 text-emerald-500" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        <div className="my-4 border-t border-gray-100" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-400">
              Mulai dari
            </p>

            <p className="mt-0.5 text-lg font-black text-emerald-600">
              Rp {formatPrice(price)}
            </p>
          </div>

          <Link
            href={`/destinations/${id}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700"
            aria-label={`Lihat ${name}`}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}