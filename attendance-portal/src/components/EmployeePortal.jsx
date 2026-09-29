import React, { useEffect, useState } from "react";
import {
  getEmployeeNames,
  getRecord,
  setRecord,
  getTodayKey,
  verifyPin,
} from "../utils/storage";
import {
  isCheckInWindow,
  isCheckOutWindow,
  formatTime,
  prettyTime,
} from "../utils/timeUtils";

export default function EmployeePortal({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const [record, setLocalRecord] = useState({ checkIn: null, checkOut: null });
  const [loading, setLoading] = useState(false);

  const todayKey = getTodayKey();

  useEffect(() => {
    getEmployeeNames().then(setEmployees).catch(console.error);
  }, []);

  useEffect(() => {
    setVerified(false);
    setPin("");
    setPinError("");
    if (selected) {
      getRecord(todayKey, selected).then(setLocalRecord).catch(console.error);
    }
  }, [selected, todayKey]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyPin(selected, pin);
    setLoading(false);
    if (ok) {
      setVerified(true);
      setPinError("");
    } else {
      setPinError("❌ Incorrect PIN. Try again.");
      setPin("");
    }
  };

  const handleCheckIn = async () => {
    await setRecord(todayKey, selected, { checkIn: formatTime() });
    setLocalRecord(await getRecord(todayKey, selected));
  };

  const handleCheckOut = async () => {
    await setRecord(todayKey, selected, { checkOut: formatTime() });
    setLocalRecord(await getRecord(todayKey, selected));
  };

  const canCheckIn = isCheckInWindow();
  const canCheckOut = isCheckOutWindow();
  const now = new Date().toLocaleTimeString("en-IN", { hour12: true });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <button onClick={onBack} className="mb-6 text-cyan-700 hover:text-cyan-900 font-semibold">
          ← Back
        </button>

        <div className="bg-white/70 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-cyan-800 mb-1">Employee Portal</h1>
          <p className="text-cyan-600 mb-6 text-sm">
            Now: <span className="font-semibold">{now}</span>
          </p>

          <label className="block text-cyan-800 font-semibold mb-2">Select Your Name</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-cyan-300 bg-white/80 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          >
            <option value="">-- Choose Employee --</option>
            {employees.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {selected && !verified && (
            <form onSubmit={handleVerify} className="mb-4">
              <label className="block text-cyan-800 font-semibold mb-2">
                🔐 Enter Your 4-Digit PIN
              </label>
              <div className="flex gap-3">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setPinError("");
                  }}
                  placeholder="••••"
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-xl border border-cyan-300 bg-white/80 text-cyan-900 text-center tracking-[0.5em] text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={pin.length !== 4 || loading}
                  className={`px-6 rounded-xl font-bold shadow-lg transition ${
                    pin.length === 4
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? "..." : "Verify"}
                </button>
              </div>
              {pinError && <p className="text-rose-600 text-sm mt-2 font-semibold">{pinError}</p>}
            </form>
          )}

          {selected && verified && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl px-4 py-2 mb-4 text-center">
                ✅ Identity Verified — {selected}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-cyan-50/80 border border-cyan-200 rounded-2xl p-4 text-center">
                  <div className="text-xs text-cyan-600 font-semibold uppercase">Check In</div>
                  <div className="text-xl font-bold text-cyan-900 mt-1">{prettyTime(record.checkIn)}</div>
                </div>
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-center">
                  <div className="text-xs text-blue-600 font-semibold uppercase">Check Out</div>
                  <div className="text-xl font-bold text-blue-900 mt-1">{prettyTime(record.checkOut)}</div>
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
                <p>• Check-In: <b>09:15 AM – 09:45 AM</b></p>
                <p>• Check-Out: <b>06:15 PM – 06:45 PM</b></p>
                {!canCheckIn && !record.checkIn && (
                  <p className="text-rose-600 font-semibold mt-2">⚠️ Check-in only 9:15–9:45 AM.</p>
                )}
                {record.checkIn && !record.checkOut && !canCheckOut && (
                  <p className="text-rose-600 font-semibold mt-2">⚠️ Check-out only 6:15–6:45 PM.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}