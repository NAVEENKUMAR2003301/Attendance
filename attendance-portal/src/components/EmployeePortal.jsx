import React, { useEffect, useState } from "react";
import { getEmployees, getRecord, setRecord, getTodayKey } from "../utils/storage";
import {
  isCheckInWindow,
  isCheckOutWindow,
  formatTime,
  prettyTime,
} from "../utils/timeUtils";

export default function EmployeePortal({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [record, setLocalRecord] = useState({ checkIn: null, checkOut: null });
  const [tick, setTick] = useState(0);

  const todayKey = getTodayKey();

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selected) setLocalRecord(getRecord(todayKey, selected));
  }, [selected, tick, todayKey]);

  const handleCheckIn = () => {
    if (!selected) return;
    const updated = setRecord(todayKey, selected, { checkIn: formatTime() });
    setLocalRecord(updated);
  };

  const handleCheckOut = () => {
    if (!selected) return;
    const updated = setRecord(todayKey, selected, { checkOut: formatTime() });
    setLocalRecord(updated);
  };

  const canCheckIn = isCheckInWindow();
  const canCheckOut = isCheckOutWindow();
  const now = new Date().toLocaleTimeString("en-IN", { hour12: true });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <button
          onClick={onBack}
          className="mb-6 text-cyan-700 hover:text-cyan-900 font-semibold"
        >
          ← Back
        </button>

        <div className="bg-white/70 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-cyan-800 mb-1">Employee Portal</h1>
          <p className="text-cyan-600 mb-6 text-sm">
            Now: <span className="font-semibold">{now}</span>
          </p>

          <label className="block text-cyan-800 font-semibold mb-2">
            Select Your Name
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-cyan-300 bg-white/80 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-6"
          >
            <option value="">-- Choose Employee --</option>
            {employees.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          {selected && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-cyan-50/80 border border-cyan-200 rounded-2xl p-4 text-center">
                  <div className="text-xs text-cyan-600 font-semibold uppercase">
                    Check In
                  </div>
                  <div className="text-xl font-bold text-cyan-900 mt-1">
                    {prettyTime(record.checkIn)}
                  </div>
                </div>
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-semibold uppercase">
                    Check Out
                  </div>
                  <div className="text-xl font-bold text-blue-900 mt-1">
                    {prettyTime(record.checkOut)}
                  </div>
                </div>
              </div>

              {!record.checkIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                    canCheckIn
                      ? "ripple-btn bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-[1.02] hover:shadow-2xl"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  ✅ Check In
                </button>
              )}

              {record.checkIn && !record.checkOut && (
                <button
                  onClick={handleCheckOut}
                  disabled={!canCheckOut}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                    canCheckOut
                      ? "ripple-btn bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-[1.02] hover:shadow-2xl"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  🚪 Check Out
                </button>
              )}

              {record.checkIn && record.checkOut && (
                <div className="text-center bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-2xl py-4">
                  🎉 Day Complete — See you tomorrow!
                </div>
              )}

              <div className="mt-6 text-xs text-cyan-700 space-y-1">
                <p>• Check-In window: <b>09:15 AM – 09:45 AM</b></p>
                <p>• Check-Out window: <b>06:15 PM – 06:45 PM</b></p>
                {!canCheckIn && !record.checkIn && (
                  <p className="text-rose-600 font-semibold mt-2">
                    ⚠️ Check-in is only allowed between 9:15–9:45 AM.
                  </p>
                )}
                {record.checkIn && !record.checkOut && !canCheckOut && (
                  <p className="text-rose-600 font-semibold mt-2">
                    ⚠️ Check-out is only allowed between 6:15–6:45 PM.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}