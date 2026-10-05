import React, { useState } from "react";
import { exportRangeToExcel } from "../utils/excelUtils";

export default function ExportRangeModal({ employees, allAttendance, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const setQuick = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setFromDate(from.toISOString().slice(0, 10));
    setToDate(to.toISOString().slice(0, 10));
  };

  const setAll = () => {
    const keys = Object.keys(allAttendance || {}).sort();
    if (keys.length === 0) {
      setFromDate(today);
      setToDate(today);
      return;
    }
    setFromDate(keys[0]);
    setToDate(keys[keys.length - 1]);
  };

  const handleExport = () => {
    setError("");
    if (fromDate > toDate) {
      setError("From date must be before To date");
      return;
    }
    setWorking(true);
    try {
      const result = exportRangeToExcel(
        fromDate,
        toDate,
        employees,
        allAttendance
      );
      if (result.rows === 0) {
        setError("No records found in the selected date range");
        setWorking(false);
        return;
      }
      onClose();
    } catch (err) {
      setError("Export failed: " + err.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl p-6 w-full max-w-md overflow-hidden">
        <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400" />

        <div className="flex items-center gap-3 mb-5 mt-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
            📊
          </div>
          <div>
            <h3 className="text-xl font-bold text-cyan-900">Export Attendance</h3>
            <p className="text-xs text-cyan-700/70">
              Choose a date range to export
            </p>
          </div>
        </div>

        {/* Date inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setError(""); }}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setError(""); }}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-sm"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-2">
              Quick Select
            </div>
            <div className="flex flex-wrap gap-2">
              <QuickBtn label="Today" onClick={() => setQuick(1)} />
              <QuickBtn label="7 Days" onClick={() => setQuick(7)} />
              <QuickBtn label="30 Days" onClick={() => setQuick(30)} />
              <QuickBtn label="90 Days" onClick={() => setQuick(90)} />
              <QuickBtn label="All Time" onClick={setAll} />
            </div>
          </div>

          {error && (
            <p className="text-rose-600 text-sm font-semibold flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={working}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={working}
            className="ripple-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition disabled:opacity-60"
          >
            {working ? "Exporting..." : "⬇ Download"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold hover:bg-cyan-100 hover:border-cyan-300 transition"
    >
      {label}
    </button>
  );
}