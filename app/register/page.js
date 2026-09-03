"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  User,
  Mail,
  Lock,
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Semua field wajib diisi.");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Konfirmasi password tidak cocok.");
      return;
    }

    const existingUser = JSON.parse(
      localStorage.getItem("tripin_user") || "null"
    );

    if (
      existingUser &&
      existingUser.email === email
    ) {
      alert("Email sudah terdaftar. Silakan login.");
      return;
    }

    const user = {
      name,
      email,
      password,
      location: "Indonesia",
    };

    localStorage.setItem(
      "tripin_user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "tripin_profile",
      JSON.stringify({
        name,
        email,
        location: "Indonesia",
      })
    );

    alert("Registrasi berhasil! Silakan login.");

    window.location.href = "/login";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6fbf8] px-6 py-10">

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">

        {/* LEFT */}

        <div className="hidden bg-gray-900 p-10 text-white md:flex md:flex-col md:justify-between">

          <div>

            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-black"
            >
              <MapPin size={27} />
              TRIPIN
            </Link>

            <h1 className="mt-20 text-5xl font-black leading-tight">
              Mulai perjalananmu.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-gray-400">
              Buat akun TRIPIN dan mulai simpan
              destinasi, itinerary, wishlist, dan
              budget perjalananmu.
            </p>

          </div>

          <p className="text-sm text-gray-500">
            Travel smarter with TRIPIN.
          </p>

        </div>


        {/* RIGHT */}

        <div className="p-7 md:p-10">

          <Link
            href="/"
            className="text-sm font-semibold text-gray-400 hover:text-emerald-600"
          >
            ← Kembali
          </Link>

          <h2 className="mt-8 text-3xl font-black">
            Buat Akun
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Daftar untuk mulai menggunakan TRIPIN.
          </p>


          <form
            onSubmit={handleRegister}
            className="mt-8 space-y-5"
          >

            {/* NAMA */}

            <div>

              <label className="mb-2 block text-sm font-bold">
                Nama
              </label>

              <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-500">

                <User
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Nama kamu"
                  className="w-full px-3 py-3 outline-none"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-bold">
                Email
              </label>

              <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-500">

                <Mail
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="nama@email.com"
                  className="w-full px-3 py-3 outline-none"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-bold">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-500">

                <Lock
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-3 outline-none"
                />

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-bold">
                Konfirmasi Password
              </label>

              <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-500">

                <Lock
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Ulangi password"
                  className="w-full px-3 py-3 outline-none"
                />

              </div>

            </div>


            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700"
            >
              Daftar
            </button>

          </form>


          <p className="mt-7 text-center text-sm text-gray-500">

            Sudah punya akun?{" "}

            <Link
              href="/login"
              className="font-bold text-emerald-600 hover:underline"
            >
              Login sekarang
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}