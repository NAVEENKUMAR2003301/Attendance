import React, { useEffect, useRef, useState } from "react";
import {
  subscribeEmployees,
  subscribeAttendance,
  subscribeAllAttendance,
  subscribeConfig,
  addEmployee,
  deleteEmployee,
  setRecord,
  getTodayKey,
  updateEmployeePin,
  generatePin,
  saveConfig,
  DEFAULT_CONFIG,
} from "../utils/storage";
import { prettyTime } from "../utils/timeUtils";
import { exportToExcel, importFromExcel } from "../utils/excelUtils";
import AddEmployeeModal from "./AddEmployeeModal";
import TimeSettingsModal from "./TimeSettingsModal";
import CleanupModal from "./CleanupModal";
import ExportRangeModal from "./ExportRangeModal";
import EmployeeReportModal from "./EmployeeReportModal";

export default function AdminDashboard({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [date, setDate] = useState(getTodayKey());
  const [attendance, setAttendance] = useState({});
  const [allAttendance, setAllAttendance] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCleanup, setShowCleanup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [reportEmployee, setReportEmployee] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    const u1 = subscribeEmployees(setEmployees);
    const u2 = subscribeConfig(setConfig);
    return () => {
      u1();
      u2();
    };
  }, []);

  useEffect(() => {
    const unsub = subscribeAttendance(date, setAttendance);
    return () => unsub();
  }, [date]);

  useEffect(() => {
    const unsub = subscribeAllAttendance(setAllAttendance);
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const dayData = attendance || {};

  const startEdit = (employee, field) => {
    setEditing({ employee, field });
    setEditValue(dayData[employee]?.[field] || "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { employee, field } = editing;
    await setRecord(date, employee, { [field]: editValue || null });
    setEditing(null);
    showToast(`Updated ${employee}'s ${field}`);
  };

  const handleAddEmployee = async (name, pin) => {
    await addEmployee(name, pin);
    showToast(`Added ${name}`);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await deleteEmployee(id);
    showToast(`Deleted ${name}`);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFromExcel(file, date);
      showToast("Excel imported");
    } catch {
      showToast("Import failed");
    }
    e.target.value = "";
  };

  const handleSaveSettings = async (newConfig) => {
    await saveConfig(newConfig);
    setShowSettings(false);
    showToast("Settings saved");
  };

  // ---------- stats ----------
  const totalEmp = employees.length;
  const presentCount = employees.filter((e) => {
    const r = dayData[e.name];
    return r?.checkIn && r?.checkOut;
  }).length;
  const workingCount = employees.filter((e) => {
    const r = dayData[e.name];
    return r?.checkIn && !r?.checkOut;
  }).length;
  const absentCount = totalEmp - presentCount - workingCount;

  // ---------- filtered list ----------
  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ============ HEADER ============ */}
        <button
          onClick={onBack}
          className="group mb-6 inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-semibold text-sm transition"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">
            ←
          </span>
          Logout
        </button>

        <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(8,145,178,0.35)] overflow-hidden mb-6">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />
          <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/30">
                🛡️
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-900 tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-cyan-700/80 text-sm font-medium">
                  {new Date(date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/70 border border-cyan-200/70 rounded-2xl px-4 py-2 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-cyan-900 font-semibold text-sm">
                Live Sync
              </span>
            </div>
          </div>
        </div>

        {/* ============ STAT CARDS ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Employees" value={totalEmp} icon="👥" color="cyan" />
          <StatCard label="Present" value={presentCount} icon="✅" color="emerald" />
          <StatCard label="Working" value={workingCount} icon="⏳" color="amber" />
          <StatCard label="Absent" value={absentCount} icon="❌" color="rose" />
        </div>

        {/* ============ TOOLBAR ============ */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 border border-cyan-200 rounded-xl px-3 py-2">
              <span className="text-cyan-700 text-sm font-semibold">📅 Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-cyan-900 font-semibold focus:outline-none text-sm"
              />
            </div>

            <div className="flex-1 min-w-[180px] relative">
              <input
                type="text"
                placeholder="🔍 Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-xl border border-cyan-200 bg-white/70 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                🔍
              </span>
            </div>

            <ToolbarButton
              onClick={() => setShowAdd(true)}
              icon="➕"
              label="Add"
              color="from-cyan-500 to-blue-600"
            />
            <ToolbarButton
              onClick={() => setShowSettings(true)}
              icon="⚙️"
              label="Times"
              color="from-amber-500 to-orange-500"
            />
            <ToolbarButton
              onClick={() => fileRef.current?.click()}
              icon="⬆️"
              label="Import"
              color="from-emerald-500 to-teal-600"
            />
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              className="hidden"
            />
            <ToolbarButton
              onClick={() => setShowExport(true)}
              icon="⬇️"
              label="Export"
              color="from-indigo-500 to-purple-600"
            />
            <ToolbarButton
              onClick={() => setShowCleanup(true)}
              icon="🧹"
              label="Clean"
              color="from-rose-500 to-pink-600"
            />
          </div>

          {/* Config summary */}
          <div className="mt-4 pt-4 border-t border-cyan-100 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2 text-cyan-800">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="font-semibold uppercase tracking-wider">
                Check-In
              </span>
              <span className="font-bold tabular-nums">
                {prettyTime(config.checkInStart)} –{" "}
                {prettyTime(config.checkInEnd)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-semibold uppercase tracking-wider">
                Check-Out
              </span>
              <span className="font-bold tabular-nums">
                {prettyTime(config.checkOutStart)} –{" "}
                {prettyTime(config.checkOutEnd)}
              </span>
            </div>
          </div>
        </div>

        {/* ============ TABLE ============ */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                    PIN
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((empObj, i) => {
                  const emp = empObj.name;
                  const rec = dayData[emp] || {};
                  const status =
                    rec.checkIn && rec.checkOut
                      ? "Present"
                      : rec.checkIn
                      ? "Working"
                      : "Absent";
                  const badge =
                    status === "Present"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : status === "Working"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-rose-100 text-rose-700 border-rose-200";

                  return (
                    <tr
                      key={empObj.id || emp}
                      className="border-t border-cyan-100/60 hover:bg-cyan-50/50 transition"
                    >
                      <td className="px-4 py-4 text-cyan-600/80 text-sm tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {emp
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-cyan-900">
                            {emp}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={async () => {
                            const newPin = generatePin();
                            if (
                              window.confirm(
                                `Regenerate PIN for ${emp}? New: ${newPin}`
                              )
                            ) {
                              await updateEmployeePin(empObj.id, newPin);
                              showToast(`New PIN for ${emp}: ${newPin}`);
                            }
                          }}
                          className="group px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-xs font-bold hover:bg-cyan-100 hover:border-cyan-300 transition"
                          title="Click to regenerate"
                        >
                          {empObj.pin}
                          <span className="ml-1.5 opacity-40 group-hover:opacity-100 transition">
                            🔄
                          </span>
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        {editing?.employee === emp &&
                        editing.field === "checkIn" ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="time"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border-2 border-cyan-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
                              autoFocus
                            />
                            <button
                              onClick={saveEdit}
                              className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 font-bold transition"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 font-bold transition"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(emp, "checkIn")}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                              rec.checkIn
                                ? "text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200"
                                : "text-slate-400 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200"
                            }`}
                          >
                            {prettyTime(rec.checkIn)}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {editing?.employee === emp &&
                        editing.field === "checkOut" ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="time"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={saveEdit}
                              className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 font-bold transition"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 font-bold transition"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(emp, "checkOut")}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                              rec.checkOut
                                ? "text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                                : "text-slate-400 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200"
                            }`}
                          >
                            {prettyTime(rec.checkOut)}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge}`}
                        >
                          {status === "Present" && "🟢"}
                          {status === "Working" && "🟡"}
                          {status === "Absent" && "🔴"}
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReportEmployee(emp)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition"
                          >
                            📊 Report
                          </button>
                          <button
                            onClick={() => handleDelete(empObj.id, emp)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-cyan-600">
                      <div className="text-4xl mb-2 opacity-60">🔍</div>
                      <div className="font-semibold">
                        {employees.length === 0
                          ? "No employees yet. Click 'Add' to begin."
                          : "No matching employees found."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-cyan-700/70 mt-6">
          🔴 Live — updates from any device appear here instantly
        </p>
      </div>

      {/* ============ MODALS ============ */}
      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddEmployee}
        />
      )}

      {showSettings && (
        <TimeSettingsModal
          config={config}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}

      {showExport && (
        <ExportRangeModal
          employees={employees}
          allAttendance={allAttendance}
          onClose={() => setShowExport(false)}
        />
      )}

      {reportEmployee && (
        <EmployeeReportModal
          employee={reportEmployee}
          allAttendance={allAttendance}
          onClose={() => setReportEmployee(null)}
        />
      )}

      {showCleanup && (
        <CleanupModal
          onClose={() => setShowCleanup(false)}
          onDone={(count) => {
            showToast(
              count > 0 ? `Deleted ${count} old date(s)` : "Nothing to clean"
            );
          }}
        />
      )}

      {/* ============ TOAST ============ */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.3s_ease]">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center gap-3 font-semibold">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              ✓
            </span>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Sub-components ============ */

function StatCard({ label, value, icon, color }) {
  const palettes = {
    cyan: "from-cyan-500 to-blue-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl hover:-translate-y-0.5 transition-all">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${palettes[color]} flex items-center justify-center text-white text-lg shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-cyan-700/70 font-semibold uppercase tracking-wider">
          {label}
        </div>
        <div className="text-2xl font-bold text-cyan-900 tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`ripple-btn px-4 py-2 rounded-xl bg-gradient-to-r ${color} text-white font-semibold text-sm shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}