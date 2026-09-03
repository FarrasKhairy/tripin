"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(
      localStorage.getItem("tripin_user") || "null"
    );

    if (!savedUser) {
      alert("Akun belum terdaftar. Silakan daftar terlebih dahulu.");
      return;
    }

    if (
      email !== savedUser.email ||
      password !== savedUser.password
    ) {
      alert("Email atau password salah.");
      return;
    }

    localStorage.setItem(
      "tripin_logged_in",
      "true"
    );

    alert("Login berhasil!");

    window.location.href = "/profile";
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
              Selamat datang kembali.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-gray-400">
              Lanjutkan perjalananmu dan kelola
              semua rencana liburanmu bersama TRIPIN.
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
            Login
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Masuk ke akun TRIPIN kamu.
          </p>


          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

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
                  placeholder="••••••••"
                  className="w-full px-3 py-3 outline-none"
                />

              </div>

            </div>


            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700"
            >
              Login
            </button>

          </form>


          <p className="mt-7 text-center text-sm text-gray-500">

            Belum punya akun?{" "}

            <Link
              href="/register"
              className="font-bold text-emerald-600 hover:underline"
            >
              Daftar sekarang
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}