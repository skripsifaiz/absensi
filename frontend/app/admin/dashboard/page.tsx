"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  name: string;
  empId: string;
  initials: string;
  subject: string;
  checkIn: string;
  checkOut: string;
  status: "Present" | "Late" | "Absent";
  notes: string;
  email: string;
  // Historical data for recapitulation (rekap)
  presentDays: number;
  lateDays: number;
  absentDays: number;
}

const initialTeachers: Teacher[] = [
  {
    name: "John Doe",
    empId: "EMP-001",
    initials: "JD",
    subject: "Matematika",
    checkIn: "07:55 AM",
    checkOut: "--:--",
    status: "Present",
    notes: "Tepat waktu",
    email: "john.doe@edusync.com",
    presentDays: 20,
    lateDays: 1,
    absentDays: 0,
  },
  {
    name: "Sarah Richardson",
    empId: "EMP-014",
    initials: "SR",
    subject: "Sastra Inggris",
    checkIn: "08:15 AM",
    checkOut: "--:--",
    status: "Late",
    notes: "Macet jalan raya",
    email: "sarah.r@edusync.com",
    presentDays: 18,
    lateDays: 3,
    absentDays: 0,
  },
  {
    name: "Michael Kross",
    empId: "EMP-022",
    initials: "MK",
    subject: "Fisika",
    checkIn: "--:--",
    checkOut: "--:--",
    status: "Absent",
    notes: "Tanpa pemberitahuan",
    email: "michael.k@edusync.com",
    presentDays: 15,
    lateDays: 2,
    absentDays: 4,
  },
  {
    name: "Emily Lewis",
    empId: "EMP-009",
    initials: "EL",
    subject: "Sejarah",
    checkIn: "07:45 AM",
    checkOut: "--:--",
    status: "Present",
    notes: "-",
    email: "emily.l@edusync.com",
    presentDays: 21,
    lateDays: 0,
    absentDays: 0,
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);

  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherSubject, setNewTeacherSubject] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");

  // Edit Attendance Modal States
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editStatus, setEditStatus] = useState<"Present" | "Late" | "Absent">("Present");
  const [editNotes, setEditNotes] = useState("");
  
  // Settings States
  const [geoRadius, setGeoRadius] = useState("100");
  const [geoActive, setGeoActive] = useState(true);
  const [shiftStart, setShiftStart] = useState("08:30");
  const [shiftEnd, setShiftEnd] = useState("16:30");

  // Report generation / Rekap States
  const [reportFormat, setReportFormat] = useState("PDF");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const [recapitulating, setRecapitulating] = useState(false);
  const [recapSuccess, setRecapSuccess] = useState(false);

  const filteredTeachers = teachers.filter((t) => {
    const term = searchTerm.toLowerCase();
    const statusMap = t.status === "Present" ? "hadir" : t.status === "Late" ? "terlambat" : "absen";
    return (
      t.name.toLowerCase().includes(term) ||
      t.empId.toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term) ||
      statusMap.includes(term) ||
      t.notes.toLowerCase().includes(term)
    );
  });

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherSubject) return;

    const initials = newTeacherName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    const randomId = `EMP-${String(Math.floor(100 + Math.random() * 900))}`;

    const newTeacher: Teacher = {
      name: newTeacherName,
      subject: newTeacherSubject,
      email: newTeacherEmail || `${newTeacherName.toLowerCase().replace(/\s+/g, ".")}@edusync.com`,
      empId: randomId,
      initials,
      checkIn: "--:--",
      checkOut: "--:--",
      status: "Absent",
      notes: "Baru Ditambahkan",
      presentDays: 0,
      lateDays: 0,
      absentDays: 0,
    };

    setTeachers([newTeacher, ...teachers]);
    setShowAddModal(false);
    setNewTeacherName("");
    setNewTeacherSubject("");
    setNewTeacherEmail("");
  };

  const handleDeleteTeacher = (empId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun guru ini?")) {
      setTeachers(teachers.filter((t) => t.empId !== empId));
    }
  };

  // Open Edit Attendance Modal
  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditCheckIn(teacher.checkIn);
    setEditCheckOut(teacher.checkOut);
    setEditStatus(teacher.status);
    setEditNotes(teacher.notes);
  };

  // Handle Edit Attendance Submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setTeachers(
      teachers.map((t) => {
        if (t.empId === editingTeacher.empId) {
          // Adjust historical counts based on status change
          let diffPresent = 0;
          let diffLate = 0;
          let diffAbsent = 0;

          if (t.status !== editStatus) {
            // Subtract old status count
            if (t.status === "Present") diffPresent--;
            if (t.status === "Late") diffLate--;
            if (t.status === "Absent") diffAbsent--;
            // Add new status count
            if (editStatus === "Present") diffPresent++;
            if (editStatus === "Late") diffLate++;
            if (editStatus === "Absent") diffAbsent++;
          }

          return {
            ...t,
            checkIn: editCheckIn,
            checkOut: editCheckOut,
            status: editStatus,
            notes: editNotes,
            presentDays: Math.max(0, t.presentDays + diffPresent),
            lateDays: Math.max(0, t.lateDays + diffLate),
            absentDays: Math.max(0, t.absentDays + diffAbsent),
          };
        }
        return t;
      })
    );

    setEditingTeacher(null);
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingReport(true);
    setGeneratedSuccess(false);
    setTimeout(() => {
      setGeneratingReport(false);
      setGeneratedSuccess(true);
    }, 1500);
  };

  const handleRecapitulate = () => {
    setRecapitulating(true);
    setRecapSuccess(false);
    setTimeout(() => {
      setRecapitulating(false);
      setRecapSuccess(true);
    }, 1800);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <>
            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Kontrol Presensi Guru</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Pantau, ubah status kehadiran harian, dan verifikasi absensi guru secara langsung.
              </p>
            </div>

            {/* Bento Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Teachers */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-lg">groups</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+2%</span>
                </div>
                <p className="text-on-surface-variant text-label-md font-label-md mb-1">Total Guru</p>
                <h3 className="text-display-lg font-display-lg text-on-surface">{teachers.length}</h3>
              </div>

              {/* Present Today */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-green-600 p-2 bg-green-50 rounded-lg">check_circle</span>
                  <span className="text-xs font-bold text-green-600">
                    {((teachers.filter((t) => t.status === "Present" || t.status === "Late").length / teachers.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-on-surface-variant text-label-md font-label-md mb-1">Hadir Hari Ini</p>
                <h3 className="text-display-lg font-display-lg text-on-surface">
                  {teachers.filter((t) => t.status === "Present" || t.status === "Late").length}
                </h3>
              </div>

              {/* Late */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-orange-600 p-2 bg-orange-50 rounded-lg">schedule</span>
                </div>
                <p className="text-on-surface-variant text-label-md font-label-md mb-1">Terlambat</p>
                <h3 className="text-display-lg font-display-lg text-on-surface">
                  {teachers.filter((t) => t.status === "Late").length}
                </h3>
              </div>

              {/* Absent */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-error p-2 bg-error-container rounded-lg">person_off</span>
                </div>
                <p className="text-on-surface-variant text-label-md font-label-md mb-1">Absen</p>
                <h3 className="text-display-lg font-display-lg text-on-surface">
                  {teachers.filter((t) => t.status === "Absent").length}
                </h3>
              </div>

              {/* Leave Requests */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-purple-600 p-2 bg-purple-50 rounded-lg">event_note</span>
                </div>
                <p className="text-on-surface-variant text-label-md font-label-md mb-1">Pengajuan Cuti</p>
                <h3 className="text-display-lg font-display-lg text-on-surface">2</h3>
              </div>
            </div>

            {/* Attendance Analytics & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-outline-variant">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-headline-md font-headline-md text-on-surface">Tren Kehadiran Harian</h4>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Tinjauan persentase kehadiran guru dalam seminggu</p>
                  </div>
                  <select className="bg-surface-container-low border border-outline-variant rounded-lg text-label-md py-1 px-3 outline-none cursor-pointer">
                    <option>7 Hari Terakhir</option>
                    <option>30 Hari Terakhir</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-4 relative">
                  {[
                    { day: "Sen", height: "85%", active: false },
                    { day: "Sel", height: "92%", active: false },
                    { day: "Rab", height: "87.5%", active: true },
                    { day: "Kam", height: "90%", active: false },
                    { day: "Jum", height: "78%", active: false },
                    { day: "Sab", height: "15%", active: false },
                    { day: "Min", height: "10%", active: false },
                  ].map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center group">
                      <div
                        className={`w-full hover:bg-primary-container transition-all rounded-t-lg ${
                          bar.active ? "bg-primary" : "bg-primary-fixed"
                        }`}
                        style={{ height: bar.height }}
                      ></div>
                      <span
                        className={`mt-2 text-label-md font-label-md ${
                          bar.active ? "text-primary font-bold" : "text-on-surface-variant"
                        }`}
                      >
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl border border-outline-variant flex flex-col justify-between">
                <div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Status Punctuality Sekolah</h4>
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md font-body-md text-on-surface-variant">Rata-rata Tepat Waktu</span>
                      <span className="font-bold text-on-surface">94%</span>
                    </div>
                    <div className="w-full bg-secondary-container h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[94%]"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-body-md font-body-md text-on-surface-variant">Kecepatan Respon Admin</span>
                      <span className="font-bold text-on-surface">2.4 jam</span>
                    </div>
                    <div className="w-full bg-secondary-container h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[70%]"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">
                      Kehadiran hari ini <span className="text-green-600 font-bold">5.2% lebih tinggi</span> dibanding Rabu lalu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Attendance Table with Controls */}
            <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
              <div className="px-8 py-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-headline-md font-headline-md text-on-surface">Kontrol Log Absensi Hari Ini</h4>
                  <p className="text-body-sm text-on-surface-variant mt-1">Gunakan tombol edit di kolom Aksi untuk mengubah status kehadiran guru secara langsung.</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-label-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-label-md bg-surface-container text-on-surface rounded-lg hover:bg-secondary-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    Cetak
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {filteredTeachers.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant italic">
                    Tidak ada data guru yang cocok.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                        <th className="px-8 py-4">Nama Guru</th>
                        <th className="px-6 py-4">Mata Pelajaran</th>
                        <th className="px-6 py-4">Waktu Masuk</th>
                        <th className="px-6 py-4">Waktu Keluar</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Catatan</th>
                        <th className="px-8 py-4 text-center">Aksi / Kontrol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.empId} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  teacher.status === "Present"
                                    ? "bg-primary-fixed text-primary"
                                    : teacher.status === "Late"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-error-container text-error"
                                }`}
                              >
                                {teacher.initials}
                              </div>
                              <div>
                                <p className="text-body-md font-body-md font-bold text-on-surface">{teacher.name}</p>
                                <p className="text-[10px] text-on-surface-variant">{teacher.empId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-body-md font-body-md text-on-surface-variant">{teacher.subject}</td>
                          <td className="px-6 py-4 text-body-md font-body-md text-on-surface">{teacher.checkIn}</td>
                          <td className="px-6 py-4 text-body-md font-body-md text-on-surface-variant">{teacher.checkOut}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full ${
                                teacher.status === "Present"
                                  ? "bg-green-100 text-green-700"
                                  : teacher.status === "Late"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {teacher.status === "Present" ? "Hadir" : teacher.status === "Late" ? "Terlambat" : "Absen"}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-body-sm font-body-sm italic ${
                              teacher.status === "Absent" ? "text-error" : "text-on-surface-variant"
                            }`}
                          >
                            {teacher.notes}
                          </td>
                          <td className="px-8 py-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => openEditModal(teacher)}
                                className="text-primary hover:bg-primary/10 px-2.5 py-1 rounded text-body-sm font-bold flex items-center gap-1 cursor-pointer border border-primary/20"
                                title="Ubah status & waktu kehadiran"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Ubah Presensi
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="px-8 py-4 bg-surface-container-low flex items-center justify-between">
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Menampilkan {filteredTeachers.length} dari {teachers.length} guru
                </p>
                <div className="flex gap-2">
                  <button className="p-2 border border-outline-variant rounded hover:bg-white transition-colors disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="p-2 border border-outline-variant rounded hover:bg-white transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case "Ikhtisar Presensi":
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Ikhtisar Presensi Bulanan</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Detail kalender absensi sekolah dan persentase kehadiran guru.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-outline-variant">
                <h3 className="text-headline-md font-headline-md mb-4 text-on-surface">Oktober 2023</h3>
                <div className="grid grid-cols-7 gap-2 text-center font-bold text-label-md text-on-surface-variant mb-2">
                  <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  <span className="p-4 bg-surface-container-low rounded-lg opacity-40">30</span>
                  {[...Array(31)].map((_, i) => {
                    const dateNum = i + 1;
                    let color = "bg-green-100 text-green-800";
                    if (dateNum === 5 || dateNum === 14) color = "bg-orange-100 text-orange-850";
                    if (dateNum === 10 || dateNum === 22) color = "bg-red-100 text-red-800";
                    if (dateNum > 25) color = "bg-surface-container-low text-on-surface-variant";
                    
                    return (
                      <div key={i} className={`p-4 rounded-lg flex flex-col items-center justify-between h-20 ${color}`}>
                        <span className="text-label-md font-bold">{dateNum}</span>
                        {dateNum <= 25 && (
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-outline-variant space-y-6">
                <h3 className="text-headline-md font-headline-md text-on-surface">Rata-rata Parameter Sekolah</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body-md text-on-surface-variant">Tepat Waktu</span>
                    <span className="text-label-md font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-md text-on-surface-variant">Terlambat</span>
                    <span className="text-label-md font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-md text-on-surface-variant">Absen Tanpa Alasan</span>
                    <span className="text-label-md font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">2%</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                  <h4 className="font-bold text-label-md mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                    Filter Departemen Cepat
                  </h4>
                  <div className="space-y-2">
                    <select className="w-full bg-white border border-outline-variant rounded p-2 text-body-sm outline-none cursor-pointer">
                      <option>Semua Departemen</option>
                      <option>Matematika</option>
                      <option>Fisika / Sains</option>
                      <option>Sejarah</option>
                    </select>
                    <select className="w-full bg-white border border-outline-variant rounded p-2 text-body-sm outline-none cursor-pointer">
                      <option>Semua Shift</option>
                      <option>Pagi (08:30 AM)</option>
                      <option>Siang (12:30 PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Manajemen Guru":
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-headline-lg font-headline-lg text-on-surface">Direktori Guru</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">Kelola akun guru, kredensial masuk, dan tugas departemen.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined">person_add</span>
                Tambah Guru Baru
              </button>
            </div>

            {/* Grid of Teachers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((t) => (
                <div key={t.empId} className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow relative">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-lg">
                        {t.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-body-lg text-on-surface">{t.name}</h3>
                        <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">{t.empId}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-body-sm text-on-surface-variant border-t border-surface-variant pt-4">
                      <div className="flex justify-between">
                        <span>Mata Pelajaran:</span>
                        <strong className="text-on-surface">{t.subject}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-on-surface">{t.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status Hari Ini:</span>
                        <span
                          className={`font-bold ${
                            t.status === "Present"
                              ? "text-green-700"
                              : t.status === "Late"
                              ? "text-orange-700"
                              : "text-red-700"
                          }`}
                        >
                          {t.status === "Present" ? "Hadir" : t.status === "Late" ? "Terlambat" : "Absen"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6 border-t border-surface-variant pt-4">
                    <button
                      onClick={() => handleDeleteTeacher(t.empId)}
                      className="text-error hover:bg-red-50 p-2 rounded transition-colors cursor-pointer"
                      title="Hapus Akun"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for adding teacher */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-outline-variant max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Tambah Guru Baru</h3>
                  <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Nama Lengkap</label>
                      <input
                        className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Sarah Johnson"
                        required
                        type="text"
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Mata Pelajaran / Departemen</label>
                      <input
                        className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Matematika"
                        required
                        type="text"
                        value={newTeacherSubject}
                        onChange={(e) => setNewTeacherSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Alamat Email</label>
                      <input
                        className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="sarah.j@edusync.com"
                        type="email"
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t border-surface-variant">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="border border-outline-variant hover:bg-surface-container-low px-4 py-2 rounded font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded font-bold cursor-pointer"
                      >
                        Simpan Guru
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "Laporan Sistem":
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Merekap Kehadiran Guru</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Lakukan kompilasi/rekapitulasi data kehadiran guru per bulan dan ekspor laporan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Rekapitulasi Data Table (Left 8 Columns) */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-outline-variant overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-surface-container-low">
                  <div>
                    <h3 className="font-bold text-body-lg text-on-surface">Rekap Kehadiran - Periode Oktober 2023</h3>
                    <p className="text-body-sm text-on-surface-variant">Kalkulasi total hari hadir, terlambat, alpa, dan persentase akumulatif.</p>
                  </div>
                  <button
                    onClick={handleRecapitulate}
                    disabled={recapitulating}
                    className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded font-bold text-body-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {recapitulating ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                        Merekap...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">summarize</span>
                        Rekap Ulang
                      </>
                    )}
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Guru</th>
                        <th className="p-4 text-center">Hadir</th>
                        <th className="p-4 text-center">Terlambat</th>
                        <th className="p-4 text-center">Alpa/Absen</th>
                        <th className="p-4 text-center">Rasio</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                      {teachers.map((t) => {
                        const totalDays = t.presentDays + t.lateDays + t.absentDays;
                        const percentage = totalDays > 0 ? ((t.presentDays / totalDays) * 100).toFixed(0) : "0";
                        return (
                          <tr key={t.empId} className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4">
                              <p className="font-bold">{t.name}</p>
                              <p className="text-[10px] text-on-surface-variant">{t.empId}</p>
                            </td>
                            <td className="p-4 text-center font-bold text-green-700 bg-green-50/50">{t.presentDays} hari</td>
                            <td className="p-4 text-center font-bold text-orange-700 bg-orange-50/50">{t.lateDays} hari</td>
                            <td className="p-4 text-center font-bold text-red-700 bg-red-50/50">{t.absentDays} hari</td>
                            <td className="p-4 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${
                                Number(percentage) >= 90 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {percentage}%
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => alert(`Mengunduh slip rekap untuk ${t.name}`)}
                                className="text-primary hover:bg-surface-container-low p-1.5 rounded transition-colors cursor-pointer border border-primary/20"
                                title="Unduh Slip Rekap Individu"
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {recapSuccess && (
                  <div className="m-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span className="text-body-sm font-bold">Rekapitulasi data 100% selesai! Semua persentase kehadiran guru telah diperbarui.</span>
                  </div>
                )}
              </div>

              {/* Export Panel (Right 4 Columns) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-outline-variant space-y-6">
                <h3 className="text-headline-md font-headline-md text-on-surface">Unduh Rekap Laporan</h3>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div>
                    <label className="text-label-md font-label-md block mb-1 text-on-surface-variant">Jenis Rekap Laporan</label>
                    <select className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none">
                      <option>Rekap Bulanan Guru (Lengkap)</option>
                      <option>Rekap Rincian Keterlambatan</option>
                      <option>Rekap Ketidakhadiran (Alpa)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label-md font-label-md block mb-1 text-on-surface-variant">Format File</label>
                    <select
                      className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none cursor-pointer"
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                    >
                      <option value="PDF">PDF Document (.pdf)</option>
                      <option value="CSV">CSV Comma Separated (.csv)</option>
                      <option value="Excel">Microsoft Excel (.xlsx)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={generatingReport}
                    className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {generatingReport ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">download</span>
                        Ekspor Laporan
                      </>
                    )}
                  </button>
                </form>

                {generatedSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded text-body-sm">
                    Unduhan file rekapitulasi <strong>{reportFormat}</strong> telah dimulai.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "Pengaturan Portal":
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Pengaturan Portal</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Konfigurasi parameter geofencing GPS, jam shift kerja, dan toleransi keterlambatan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-outline-variant space-y-8">
                {/* Geofencing Config */}
                <div>
                  <h3 className="text-headline-md font-headline-md mb-4 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pin_drop</span>
                    Parameter Geofencing
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-md font-label-md block mb-1 text-on-surface-variant">Radius Diizinkan (meter)</label>
                      <input
                        type="number"
                        className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                        value={geoRadius}
                        onChange={(e) => setGeoRadius(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={geoActive}
                          onChange={(e) => setGeoActive(e.target.checked)}
                          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-body-md font-bold text-on-surface">Aktifkan Geofencing GPS</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Shift Hours */}
                <div className="border-t border-surface-variant pt-6">
                  <h3 className="text-headline-md font-headline-md mb-4 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    Pengaturan Shift Kerja
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-md font-label-md block mb-1 text-on-surface-variant">Shift Dimulai</label>
                      <input
                        type="time"
                        className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                        value={shiftStart}
                        onChange={(e) => setShiftStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-label-md font-label-md block mb-1 text-on-surface-variant">Shift Berakhir</label>
                      <input
                        type="time"
                        className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                        value={shiftEnd}
                        onChange={(e) => setShiftEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-surface-variant pt-6 flex justify-end">
                  <button
                    onClick={() => alert("Pengaturan berhasil disimpan!")}
                    className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-lg font-bold cursor-pointer"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>
              </div>

              {/* Status Side info */}
              <div className="bg-white p-6 rounded-xl border border-outline-variant space-y-6">
                <h3 className="text-headline-md font-headline-md text-on-surface">Geolokasi Sistem</h3>
                <div className="aspect-video bg-surface-container rounded-lg border border-outline-variant relative overflow-hidden flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="geofence-admin" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#005bbf" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#005bbf" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <line x1="0" y1="40" x2="300" y2="40" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="80" x2="300" y2="80" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="120" y1="0" x2="120" y2="200" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                    <circle cx="50%" cy="50%" r="40" fill="url(#geofence-admin)" stroke="#005bbf" strokeWidth="1.5" strokeDasharray="4,2" />
                    <circle cx="50%" cy="50%" r="5" fill="#005bbf" />
                  </svg>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-on-surface">
                    TITIK TENGAH KAMPUS UTAMA
                  </div>
                </div>
                <div className="space-y-2 text-body-sm text-on-surface-variant">
                  <p><strong>Lat Kampus:</strong> -6.2088° S</p>
                  <p><strong>Long Kampus:</strong> 106.8456° E</p>
                  <p><strong>Akurasi Verifikasi:</strong> ±5 meter</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant flex flex-col py-4 z-40 hidden md:flex">
        <div className="px-6 mb-8 flex items-center gap-3">
          <img
            alt="EduSync Logo"
            className="w-10 h-10 rounded-lg object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDef2YwIvaKNxGqiZt4oo6w4PN2PsTzcifQp4WYeozvLG-rNOlVG8m3PXama0xdq2RtCahIIUED6OPOkqG9G00kuKr6fwzY6BKHXea4UtNIc6PQISYlBmLAFdJgDSyiZDOb3wDaIW5kK58ypDkIwQQlwK2444UDyt2xOS3drQU-c56NTxNB1YJADH-xrqkUfR5iVLjPZD3zQiTyasMpgFHiHWePbNskYcJ_o5xCNiBCbuyiQRa9nZbqbwkO1n6Vh3xk33XQGC1GCOA"
          />
          <div>
            <h1 className="text-headline-md font-headline-md font-extrabold text-primary">EduSync</h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Portal Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {[
            { name: "Dashboard", icon: "dashboard" },
            { name: "Ikhtisar Presensi", icon: "calendar_month" },
            { name: "Manajemen Guru", icon: "group" },
            { name: "Laporan Sistem", icon: "description" },
            { name: "Pengaturan Portal", icon: "settings" },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all cursor-pointer text-left ${
                activeTab === tab.name
                  ? "bg-primary-container text-white font-bold scale-[0.98]"
                  : "text-on-surface-variant hover:bg-secondary-container"
              }`}
            >
              <span className="material-symbols-outlined mr-3">{tab.icon}</span>
              <span className="text-label-md font-label-md">
                {tab.name === "Dashboard" ? "Kontrol Presensi" : tab.name === "Laporan Sistem" ? "Rekap Presensi" : tab.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-2 space-y-1">
          <button
            onClick={() => setActiveTab("Laporan Sistem")}
            className="w-full mb-4 px-4 py-3 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined">file_download</span>
            Rekap Laporan
          </button>
          <a
            className="flex items-center px-4 py-2 text-on-surface-variant hover:bg-secondary-container rounded-lg transition-all"
            href="#"
          >
            <span className="material-symbols-outlined mr-3">help</span>
            <span className="text-label-md font-label-md">Pusat Bantuan</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-on-surface-variant hover:bg-secondary-container rounded-lg transition-all cursor-pointer text-left"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="text-label-md font-label-md">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8 z-50">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 border border-outline-variant">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-md font-body-md w-full ml-2 outline-none"
            placeholder="Cari guru, laporan..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
            <div className="text-right">
              <p className="text-label-md font-label-md text-on-surface">Akun Admin</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Super Administrator</p>
            </div>
            <img
              alt="Avatar profil pengguna"
              className="w-10 h-10 rounded-full border border-primary/20 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA84ckLodOZ-7O_YKyAyeMLDzp73AKwFtTK1QTGVvRPZvtIxoYu_VkjnuTm3ZgzzjgxLajEB8P35w6aZkI3wLBz1gEaljCz0Vaj4Xy7yDNKyOA2VmIHimTyFFycQOEh1kOt5JrTsQM372L0b-x8hbO-ppjoc26rD0dnN-_7jCbRYUkN2tgcH-hwGTpPd3YVKWNHtQ4ywL7oTgirWXx_2ikxH3tRv3HEwHFucbPoXZ6-TOjweYn1RjjyTz7Dj13Qtwi1qI-r58poDzQ"
            />
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 pb-12 px-8 md:ml-64 min-h-screen">
        <div className="max-w-[1440px] mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Edit Attendance Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-outline-variant max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Ubah Presensi Hari Ini</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Nama Guru</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded p-3 text-body-md outline-none cursor-not-allowed text-on-surface-variant font-bold"
                  type="text"
                  readOnly
                  value={editingTeacher.name}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Jam Masuk</label>
                  <input
                    className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                    type="text"
                    required
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Jam Keluar</label>
                  <input
                    className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                    type="text"
                    required
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Status Kehadiran</label>
                <select
                  className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none cursor-pointer"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                >
                  <option value="Present">Hadir</option>
                  <option value="Late">Terlambat</option>
                  <option value="Absent">Absen</option>
                </select>
              </div>
              <div>
                <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Catatan</label>
                <input
                  className="w-full bg-white border border-outline-variant rounded p-3 text-body-md outline-none"
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-surface-variant">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="border border-outline-variant hover:bg-surface-container-low px-4 py-2 rounded font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
