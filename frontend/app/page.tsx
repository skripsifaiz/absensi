"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"teacher" | "admin">("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-margin-mobile md:p-margin-desktop geometric-bg">
      <main className="w-full max-w-md">
        <div className="login-card bg-surface-container-lowest rounded-xl p-8 md:p-10 flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-8 text-center">
            <img
              alt="Logo EduSync Academy"
              className="w-24 h-24 mb-4 object-contain mx-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDef2YwIvaKNxGqiZt4oo6w4PN2PsTzcifQp4WYeozvLG-rNOlVG8m3PXama0xdq2RtCahIIUED6OPOkqG9G00kuKr6fwzY6BKHXea4UtNIc6PQISYlBmLAFdJgDSyiZDOb3wDaIW5kK58ypDkIwQQlwK2444UDyt2xOS3drQU-c56NTxNB1YJADH-xrqkUfR5iVLjPZD3zQiTyasMpgFHiHWePbNskYcJ_o5xCNiBCbuyiQRa9nZbqbwkO1n6Vh3xk33XQGC1GCOA"
            />
            <h1 className="text-headline-md font-headline-md text-primary">EduSync Academy</h1>
            <p className="text-body-sm text-on-surface-variant mt-2">Redefinisi Efisiensi Institusi</p>
          </div>

          {/* Role Selection Toggle */}
          <div className="w-full mb-8 p-1 bg-surface-container-low rounded-lg flex relative" id="role-toggle-container">
            <div
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-md shadow-sm transition-all duration-300 ease-in-out"
              style={{
                transform: role === "teacher" ? "translateX(0)" : "translateX(calc(100% + 8px))",
              }}
            ></div>
            <button
              className={`relative z-10 flex-1 py-2 text-label-md font-label-md text-center transition-colors cursor-pointer ${
                role === "teacher" ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
              onClick={() => setRole("teacher")}
              type="button"
            >
              Masuk sebagai Guru
            </button>
            <button
              className={`relative z-10 flex-1 py-2 text-label-md font-label-md text-center transition-colors cursor-pointer ${
                role === "admin" ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
              onClick={() => setRole("admin")}
              type="button"
            >
              Masuk sebagai Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant block" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 input-focus transition-all group">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3">mail</span>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-md text-on-surface placeholder:text-outline-variant outline-none"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "teacher" ? "guru@edusync.com" : "admin@edusync.com"}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant block" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 input-focus transition-all group">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3">lock</span>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-md text-on-surface placeholder:text-outline-variant outline-none"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  className="text-outline hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-body-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Ingat Saya
                </span>
              </label>
              <a className="text-body-sm font-label-md text-primary hover:underline transition-all" href="#">
                Lupa Kata Sandi?
              </a>
            </div>

            {/* Primary CTA */}
            <button
              className="w-full bg-primary-container hover:bg-primary text-white font-headline-md py-4 rounded-lg transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              type="submit"
            >
              Masuk
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-surface-variant w-full text-center">
            <p className="text-body-sm text-on-surface-variant">
              Mengalami masalah saat masuk? <br />
              <a className="text-primary font-label-md hover:underline" href="#">
                Hubungi Dukungan Sistem
              </a>
            </p>
          </div>
        </div>

        {/* External Links */}
        <div className="mt-6 flex justify-center space-x-6 text-body-sm text-outline">
          <a className="hover:text-on-surface transition-colors" href="#">
            Kebijakan Privasi
          </a>
          <span>•</span>
          <a className="hover:text-on-surface transition-colors" href="#">
            Ketentuan Layanan
          </a>
        </div>
      </main>
    </div>
  );
}
