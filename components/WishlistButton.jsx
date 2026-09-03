"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const WISHLIST_KEY = "tripin_wishlist";

function getWishlist() {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function WishlistButton({
  destination,
  className = "",
}) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!destination?.id) return;

    const wishlist = getWishlist();

    setIsSaved(
      wishlist.some(
        (item) => String(item.id) === String(destination.id)
      )
    );
  }, [destination?.id]);

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!destination?.id) return;

    const wishlist = getWishlist();

    const exists = wishlist.some(
      (item) => String(item.id) === String(destination.id)
    );

    let updatedWishlist;

    if (exists) {
      updatedWishlist = wishlist.filter(
        (item) => String(item.id) !== String(destination.id)
      );
      setIsSaved(false);
    } else {
      updatedWishlist = [...wishlist, destination];
      setIsSaved(true);
    }

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(
      new Event("tripin-wishlist-update")
    );
  };

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      aria-label={
        isSaved
          ? "Hapus dari wishlist"
          : "Tambah ke wishlist"
      }
      title={
        isSaved
          ? "Hapus dari wishlist"
          : "Tambah ke wishlist"
      }
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 ${className}`}
    >
      <Heart
        size={19}
        className={
          isSaved
            ? "text-red-500"
            : "text-gray-500"
        }
        fill={isSaved ? "currentColor" : "none"}
      />
    </button>
  );
}