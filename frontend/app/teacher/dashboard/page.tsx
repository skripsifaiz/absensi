"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "Present" | "Late" | "Absent";
}

interface LeaveRequest {
  type: string;
  dates: string;
  days: number;
  reason: string;
  status: "Approved" | "Pending" | "Rejected";
}

const initialHistory: AttendanceRecord[] = [
  { date: "24 Okt, Sel", checkIn: "07:58 AM", checkOut: "04:15 PM", duration: "8j 17m", status: "Present" },
  { date: "23 Okt, Sen", checkIn: "08:05 AM", checkOut: "04:30 PM", duration: "8j 25m", status: "Late" },
  { date: "20 Okt, Jum", checkIn: "07:55 AM", checkOut: "04:00 PM", duration: "8j 05m", status: "Present" },
];

const initialLeaves: LeaveRequest[] = [
  { type: "Cuti Tahunan", dates: "12 Okt - 14 Okt", days: 3, reason: "Acara pernikahan keluarga", status: "Approved" },
  { type: "Cuti Alasan Penting", dates: "04 Okt", days: 1, reason: "Pemeriksaan kesehatan gigi", status: "Approved" },
];

export default function TeacherDashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [history, setHistory] = useState<AttendanceRecord[]>(initialHistory);
  const [activeTab, setActiveTab] = useState("Presensi Saya");

  // Leave Form States
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaves);
  const [leaveType, setLeaveType] = useState("Cuti Sakit");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check-in timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (checkedIn) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkedIn]);

  const handleCheckIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCheckedIn(true);
    setCheckInTime(timeStr);
    setCheckOutTime(null);
    setSecondsElapsed(0);
  };

  const handleCheckOut = () => {
    if (!confirm("Apakah Anda yakin ingin Keluar (Check Out)?")) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCheckedIn(false);
    setCheckOutTime(timeStr);

    const hrs = Math.floor(secondsElapsed / 3600);
    const mins = Math.floor((secondsElapsed % 3600) / 60);
    const durationStr = `${hrs}j ${mins}m`;

    const todayStr = now.toLocaleDateString([], { month: "short", day: "numeric" }) + ", Hari Ini";
    setHistory((prev) => [
      {
        date: todayStr,
        checkIn: checkInTime || "--:--",
        checkOut: timeStr,
        duration: durationStr,
        status: "Present",
      },
      ...prev,
    ]);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveReason) return;

    const start = new Date(leaveStartDate);
    const end = leaveEndDate ? new Date(leaveEndDate) : start;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const formattedDates = leaveEndDate && leaveEndDate !== leaveStartDate
      ? `${start.toLocaleDateString([], { month: "short", day: "numeric" })} - ${end.toLocaleDateString([], { month: "short", day: "numeric" })}`
      : start.toLocaleDateString([], { month: "short", day: "numeric" });

    const newRequest: LeaveRequest = {
      type: leaveType,
      dates: formattedDates,
      days: diffDays,
      reason: leaveReason,
      status: "Pending",
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setLeaveStartDate("");
    setLeaveEndDate("");
    setLeaveReason("");
    alert("Pengajuan cuti berhasil dikirim!");
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  const formatElapsed = () => {
    const hrs = Math.floor(secondsElapsed / 3600);
    const mins = Math.floor((secondsElapsed % 3600) / 60);
    return `${hrs}j ${mins}m`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Presensi Saya":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Main Action & History Column */}
            <section className="lg:col-span-8 space-y-gutter">
              {/* Check-In Console */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Presensi Harian</h1>
                    <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Selamat pagi, Ibu Sarah</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant">Rabu, 25 Oktober 2023</p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${
                      checkedIn
                        ? "bg-green-100 text-green-800"
                        : checkOutTime
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${checkedIn ? "bg-green-500 animate-pulse" : "bg-error"}`}></span>
                    <span className="text-label-md font-label-md">
                      {checkedIn ? "Sedang Bekerja" : checkOutTime ? "Shift Selesai" : "Belum Masuk"}
                    </span>
                  </div>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden sm:grid grid-cols-2 gap-4 mb-10">
                  <button
                    disabled={checkedIn}
                    onClick={handleCheckIn}
                    className={`flex flex-col items-center justify-center p-8 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                      checkedIn
                        ? "bg-surface-container-high text-outline cursor-not-allowed opacity-60"
                        : "bg-primary text-white hover:bg-on-primary-fixed-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-display-lg mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                    <span className="text-headline-md font-headline-md">Check In</span>
                    <span className="text-body-sm font-body-sm opacity-80 mt-1">Catat kedatangan Anda</span>
                  </button>
                  <button
                    disabled={!checkedIn}
                    onClick={handleCheckOut}
                    className={`flex flex-col items-center justify-center p-8 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                      !checkedIn
                        ? "bg-surface-container-high text-outline cursor-not-allowed opacity-60"
                        : "bg-error text-white hover:bg-on-error-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-display-lg mb-3">logout</span>
                    <span className="text-headline-md font-headline-md">Check Out</span>
                    <span className="text-body-sm font-body-sm mt-1">Akhiri jam kerja Anda</span>
                  </button>
                </div>

                {/* Mobile Button */}
                <div className="flex flex-col items-center justify-center text-center sm:hidden bg-surface-container-low rounded-xl p-6 border border-outline-variant mb-6">
                  <div className="mb-4">
                    {checkedIn ? (
                      <div
                        onClick={handleCheckOut}
                        className="w-32 h-32 rounded-full bg-error flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-4xl mb-1">logout</span>
                        <span className="font-label-md text-label-md font-bold">Check Out</span>
                      </div>
                    ) : (
                      <div
                        onClick={handleCheckIn}
                        className="w-32 h-32 rounded-full bg-primary-container flex flex-col items-center justify-center text-white cursor-pointer check-in-glow active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-4xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>person_check</span>
                        <span className="font-label-md text-label-md font-bold">Check In</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-outline-variant shadow-sm mb-4">
                    <span className="material-symbols-outlined text-sm text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <span className="font-label-md text-label-md text-on-surface">Kampus Terverifikasi: Aula Utama</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <p className="text-label-md font-label-md text-outline">Masuk/Keluar</p>
                      <p className="text-body-md font-body-md text-on-surface">
                        {checkInTime || "-- : --"} / {checkOutTime || "-- : --"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">timer</span>
                    </div>
                    <div>
                      <p className="text-label-md font-label-md text-outline">Total Jam</p>
                      <p className="text-body-md font-body-md text-on-surface">
                        {checkedIn ? formatElapsed() : checkOutTime ? formatElapsed() : "0j 0m"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-tertiary-fixed-variant">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="text-label-md font-label-md text-outline">Status GPS</p>
                      <p className="text-body-md font-body-md text-on-surface flex items-center gap-1">
                        Terverifikasi <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center sm:hidden">
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    Waktu Sekarang: <span className="font-bold">{currentTime || "08:14 AM"}</span>
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Shift dimulai pukul 08:30 AM</p>
                </div>
              </div>

              {/* Mobile Stats & Classes */}
              <div className="block lg:hidden space-y-gutter">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-outline-variant">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-green-700 text-lg">calendar_today</span>
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Status Mingguan</h3>
                    <p className="font-headline-md text-headline-md text-on-surface">98%</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-outline-variant">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Keterlambatan</h3>
                    <p className="font-headline-md text-headline-md text-on-surface">0</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Kelas Hari Ini</h2>
                    <button className="font-label-md text-label-md text-primary font-bold cursor-pointer hover:underline">Lihat Jadwal</button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-background p-4 rounded-xl border border-outline-variant flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                      <div className="flex flex-col items-center justify-center w-12 border-r border-outline-variant pr-4">
                        <span className="font-label-md text-label-md text-on-surface font-bold">09:00</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">AM</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-body-md text-body-md font-bold text-on-surface">Matematika Tingkat Lanjut</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Kelas 10-B • Ruang 302</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                    </div>
                    <div className="bg-background p-4 rounded-xl border border-outline-variant flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                      <div className="flex flex-col items-center justify-center w-12 border-r border-outline-variant pr-4">
                        <span className="font-label-md text-label-md text-on-surface font-bold">11:30</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">AM</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-body-md text-body-md font-bold text-on-surface">Pengantar Kalkulus</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Kelas 11-A • Lab Sains</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h2 className="text-headline-md font-headline-md text-on-surface">Presensi Terbaru</h2>
                  <button className="text-primary font-bold text-label-md hover:underline transition-all cursor-pointer">
                    Lihat Laporan Lengkap
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high">
                      <tr>
                        <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant">TANGGAL</th>
                        <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant">MASUK</th>
                        <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant">KELUAR</th>
                        <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant">DURASI</th>
                        <th className="px-6 py-3 text-label-md font-label-md text-on-surface-variant">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {history.map((record, index) => (
                        <tr key={index} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-6 py-4 text-body-md font-body-md">{record.date}</td>
                          <td className="px-6 py-4 text-body-sm">{record.checkIn}</td>
                          <td className="px-6 py-4 text-body-sm">{record.checkOut}</td>
                          <td className="px-6 py-4 text-body-sm">{record.duration.replace("h", "j").replace("m", "m")}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                record.status === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-850"
                              }`}
                            >
                              {record.status === "Present" ? "Hadir" : "Terlambat"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Desktop Sidebar Summary Column */}
            <aside className="lg:col-span-4 space-y-gutter hidden lg:block">
              {/* Profile Summary Card */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      alt="Foto Sarah Johnson"
                      className="w-16 h-16 rounded-xl object-cover shadow-sm"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB9mbsQNTTGGQks9daAVKb8VjzAiO-TLUMPhc9AURenbN9xgzqaVT1bIqcQGn5arVplzw_VK8VH4bbvCKOQfIEeqACKivCvYDE7Llnm8QG7ymAkOW-gAfAzT2tqu_AjrXmGwyE3CJddIbRh9BNeblrI228Tnokxly7vwBUQfrYAY2L1Z1eGhNga3ktX5dJ1pOl6Cr3w7hd9NUdKwf6zmGBlv7adXNOgotarw22qnP4NjusiYcrZAqi4ZN4Lu3KClCCdLcY2RHiC28"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-surface-container-lowest rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-body-lg font-headline-md text-on-surface">Sarah Johnson</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Kepala Bidang Matematika</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                    <span className="text-body-sm text-on-surface-variant">ID Karyawan</span>
                    <span className="text-label-md font-label-md text-on-surface">T-8821</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                    <span className="text-body-sm text-on-surface-variant">Total Mingguan</span>
                    <span className="text-label-md font-label-md text-on-surface">16j 42m / 40j</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface-variant">Kelas Berikutnya</span>
                    <span className="text-label-md font-label-md text-primary">09:30 AM (Ruang 402)</span>
                  </div>
                </div>
              </div>

              {/* Monthly Overview */}
              <div className="bg-primary-container text-white rounded-xl p-6 relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-label-md font-label-md uppercase tracking-widest opacity-80 mb-4">Ikhtisar Bulanan</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-display-lg font-bold leading-none">98.2%</p>
                      <p className="text-body-sm font-body-sm mt-2">Ketepatan Waktu Presensi</p>
                    </div>
                    <span className="material-symbols-outlined text-display-lg opacity-20">trending_up</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white opacity-5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              </div>

              {/* Map */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                <div className="aspect-video w-full rounded-lg bg-surface-container-high relative overflow-hidden mb-4 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="geofence-tr" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#1a73e8" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <line x1="0" y1="30" x2="300" y2="30" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="70" x2="300" y2="70" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                    <circle cx="50%" cy="50%" r="45" fill="url(#geofence-tr)" stroke="#1a73e8" strokeWidth="1.5" strokeDasharray="4,2" />
                    <circle cx="50%" cy="50%" r="6" fill="#1a73e8" />
                  </svg>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    KAMPUS UTAMA EDU SYNC
                  </div>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant text-center">
                  Geofencing GPS Aktif: <strong>Kampus Utama</strong>
                </p>
              </div>
            </aside>
          </div>
        );

      case "Pengajuan Cuti":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-outline-variant space-y-6">
              <h3 className="text-headline-md font-headline-md text-on-surface">Ajukan Cuti</h3>
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Jenis Cuti</label>
                  <select
                    className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none cursor-pointer"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option>Cuti Sakit</option>
                    <option>Cuti Alasan Penting</option>
                    <option>Cuti Tahunan</option>
                    <option>Cuti Di Luar Tanggungan</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Alasan Cuti</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Jelaskan alasan pengajuan cuti Anda..."
                    className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Kirim Pengajuan Cuti
                </button>
              </form>
            </div>

            {/* History Column */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-outline-variant">
              <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Riwayat Pengajuan Cuti</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                      <th className="p-3">Jenis Cuti</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Durasi</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                    {leaveRequests.map((req, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-3 font-bold">{req.type}</td>
                        <td className="p-3">{req.dates}</td>
                        <td className="p-3">{req.days} Hari</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              req.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : req.status === "Pending"
                                ? "bg-yellow-100 text-yellow-850"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {req.status === "Approved" ? "Disetujui" : req.status === "Pending" ? "Menunggu" : "Ditolak"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "Riwayat Pribadi":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left: General Info & Stats */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-outline-variant">
                <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Detail Profil</h3>
                <div className="flex flex-col items-center text-center space-y-4 mb-6">
                  <img
                    alt="Avatar Sarah Johnson"
                    className="w-24 h-24 rounded-full border-2 border-primary object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8pBPogDgMy0td4jPAI6LhYbWmybv2mOdot8xQz9y3T6IGb2IHstKjbrjqtFopmJI5Mdl9OzFHFexJcUVn4FgbdFxo9Oa8IiAdcFUY7_wV9tBYV7-KB64ptg6LIFpD3zY5Qw2vtlQN0XOLju2MhsIWJhxiFQZ9sNtYHYKdEKqqipj8tvSUYQ2bf4uysqAazbyi4VJ2LHLqLKmXNhHQeOZrGaUovW-woDX7yNs3VBJdBShLm7k2fCIVK6dDTjgovINeLgut2l7jLEs"
                  />
                  <div>
                    <h4 className="text-headline-md font-bold text-on-surface">Sarah Johnson</h4>
                    <p className="text-body-md text-on-surface-variant">Pendidik Utama Matematika</p>
                  </div>
                </div>
                <div className="space-y-3 text-body-md text-on-surface border-t border-surface-variant pt-4">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ID Karyawan:</span>
                    <strong className="font-bold">T-8821</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Departemen:</span>
                    <strong className="font-bold">Matematika & Kalkulus</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Tanggal Bergabung:</span>
                    <span className="text-on-surface">15 Agu, 2021</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Tingkat Akses:</span>
                    <span className="text-on-surface">Guru Senior</span>
                  </div>
                </div>
              </div>

              {/* Class Schedule Card */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant">
                <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Mata Pelajaran Diajar</h3>
                <div className="space-y-3">
                  {[
                    { subject: "Matematika Tingkat Lanjut", grade: "Kelas 10-B", hours: "5 jam/minggu" },
                    { subject: "Pengantar Kalkulus", grade: "Kelas 11-A", hours: "4 jam/minggu" },
                    { subject: "Geometri Aljabar", grade: "Kelas 12-C", hours: "6 jam/minggu" },
                  ].map((sub, i) => (
                    <div key={i} className="p-3 bg-surface-container rounded-lg border border-outline-variant flex justify-between items-center">
                      <div>
                        <p className="font-bold text-body-md text-on-surface">{sub.subject}</p>
                        <p className="text-body-sm text-on-surface-variant">{sub.grade}</p>
                      </div>
                      <span className="text-label-md font-bold text-primary bg-primary-fixed px-2 py-1 rounded">
                        {sub.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Personal Month Map Checklist */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-outline-variant">
              <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Checklist Kehadiran - Oktober 2023</h3>
              <p className="text-body-sm text-on-surface-variant mb-6">Log pelacakan visual harian status presensi Anda.</p>
              
              <div className="grid grid-cols-7 gap-2 text-center text-label-md font-bold text-on-surface-variant mb-2">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                <span className="p-3 bg-surface-container-low rounded-lg opacity-40">30</span>
                {[...Array(31)].map((_, i) => {
                  const dateNum = i + 1;
                  let color = "bg-green-100 text-green-850 border border-green-300";
                  if (dateNum === 9 || dateNum === 18) color = "bg-orange-100 text-orange-850 border border-orange-300";
                  if (dateNum === 12 || dateNum === 13 || dateNum === 14) color = "bg-blue-100 text-blue-800 border border-blue-200";
                  if (dateNum > 25) color = "bg-surface-container text-on-surface-variant";
                  
                  return (
                    <div key={i} className={`p-3 rounded-lg flex flex-col items-center justify-center h-16 ${color}`}>
                      <span className="text-label-md font-bold">{dateNum}</span>
                      <span className="text-[9px] uppercase font-semibold">
                        {dateNum > 25 ? "" : dateNum === 12 || dateNum === 13 || dateNum === 14 ? "Cuti" : dateNum === 9 || dateNum === 18 ? "Telat" : "Hadir"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen pb-20 md:pb-0">
      {/* Top Header Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-margin-desktop h-16 bg-surface-container-lowest border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <img
            alt="Logo Sekolah"
            className="h-8 w-8 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDef2YwIvaKNxGqiZt4oo6w4PN2PsTzcifQp4WYeozvLG-rNOlVG8m3PXama0xdq2RtCahIIUED6OPOkqG9G00kuKr6fwzY6BKHXea4UtNIc6PQISYlBmLAFdJgDSyiZDOb3wDaIW5kK58ypDkIwQQlwK2444UDyt2xOS3drQU-c56NTxNB1YJADH-xrqkUfR5iVLjPZD3zQiTyasMpgFHiHWePbNskYcJ_o5xCNiBCbuyiQRa9nZbqbwkO1n6Vh3xk33XQGC1GCOA"
          />
          <span className="text-headline-md font-headline-md font-bold text-primary">EduSync Academy</span>
        </div>
        <div className="hidden md:flex items-center gap-8 h-full">
          {["Presensi Saya", "Pengajuan Cuti", "Riwayat Pribadi"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full flex items-center px-2 cursor-pointer transition-colors border-b-2 font-bold ${
                activeTab === tab
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:bg-surface-container-low"
              }`}
            >
              {tab === "Presensi Saya" ? "Presensi Saya" : tab === "Leave Requests" ? "Pengajuan Cuti" : tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
            <div className="text-right hidden sm:block">
              <p className="text-label-md font-label-md text-on-surface">Sarah Johnson</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant">T-8821</p>
            </div>
            <img
              alt="Sarah Johnson"
              className="w-10 h-10 rounded-full border border-outline-variant object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8pBPogDgMy0td4jPAI6LhYbWmybv2mOdot8xQz9y3T6IGb2IHstKjbrjqtFopmJI5Mdl9OzFHFexJcUVn4FgbdFxo9Oa8IiAdcFUY7_wV9tBYV7-KB64ptg6LIFpD3zY5Qw2vtlQN0XOLju2MhsIWJhxiFQZ9sNtYHYKdEKqqipj8tvSUYQ2bf4uysqAazbyi4VJ2LHLqLKmXNhHQeOZrGaUovW-woDX7yNs3VBJdBShLm7k2fCIVK6dDTjgovINeLgut2l7jLEs"
            />
          </div>
        </div>
      </nav>

      {/* Side Navigation Shell */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant hidden lg:flex flex-col py-4 z-40 mt-16">
        <div className="px-6 mb-8 pt-4">
          <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Portal Guru</p>
          <p className="text-body-sm font-body-sm text-outline">Departemen Matematika</p>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { name: "Presensi Saya", icon: "person_check" },
            { name: "Pengajuan Cuti", icon: "event_busy" },
            { name: "Riwayat Pribadi", icon: "assignment_ind" },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-4 py-3 rounded-lg font-bold cursor-pointer transition-all text-left ${
                activeTab === tab.name
                  ? "bg-primary-container text-white"
                  : "text-on-surface-variant hover:bg-secondary-container"
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="text-label-md">{tab.name}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-secondary-container rounded-lg transition-all" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="text-label-md">Pusat Bantuan</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container rounded-lg transition-all cursor-pointer text-left font-bold"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-md">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="pt-24 pb-12 px-4 md:px-margin-mobile lg:pl-[288px] lg:pr-margin-desktop max-w-container-max-width mx-auto">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant flex md:hidden justify-around items-center h-16 z-50">
        <button
          onClick={() => setActiveTab("Presensi Saya")}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === "Presensi Saya" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === "Presensi Saya" ? "'FILL' 1" : "'FILL' 0" }}>person_check</span>
          <span className="text-label-md text-[10px] uppercase tracking-wider font-bold">Status</span>
        </button>
        <button
          onClick={() => setActiveTab("Pengajuan Cuti")}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === "Pengajuan Cuti" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined">event_busy</span>
          <span className="text-label-md text-[10px] uppercase tracking-wider font-bold">Cuti</span>
        </button>
        <button
          onClick={() => setActiveTab("Riwayat Pribadi")}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === "Riwayat Pribadi" ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined">assignment_ind</span>
          <span className="text-label-md text-[10px] uppercase tracking-wider font-bold">Riwayat</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 cursor-pointer text-error"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md text-[10px] uppercase tracking-wider font-bold">Keluar</span>
        </button>
      </nav>
    </div>
  );
}
