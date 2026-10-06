import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getEmployeeNames,
  getRecord,
  setRecord,
  getTodayKey,
  verifyEmpId,
  subscribeConfig,
  DEFAULT_CONFIG,
} from "../utils/storage";
import {
  isCheckInWindow,
  isCheckOutWindow,
  formatTime,
  prettyTime,
  prettyWindow,
} from "../utils/timeUtils";

export default function EmployeePortal({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const [record, setLocalRecord] = useState({ checkIn: null, checkOut: null });
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const wrapperRef = useRef(null);

  const todayKey = getTodayKey();

  useEffect(() => {
    getEmployeeNames().then(setEmployees).catch(console.error);
  }, []);

  useEffect(() => {
    const unsub = subscribeConfig(setConfig);
    return () => unsub();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setVerified(false);
    setPin("");
    setPinError("");
    if (selected) {
      getRecord(todayKey, selected).then(setLocalRecord).catch(console.error);
    }
  }, [selected, todayKey, tick]);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase().trim();
    return employees.filter((e) => e.toLowerCase().includes(q));
  }, [employees, search]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectEmployee = (name) => {
    setSelected(name);
    setSearch(name);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelected("");
    setSearch("");
    setVerified(false);
    setPin("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyEmpId(selected, pin);
    setLoading(false);
    if (ok) {
      setVerified(true);
      setPinError("");
    } else {
      setPinError("Incorrect Employee ID. Try again.");
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

  const canCheckIn = isCheckInWindow(config);
  const canCheckOut = isCheckOutWindow(config);
  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Progress: 0 = not started, 1 = selected, 2 = verified, 3 = checked-in, 4 = completed
  const step = !selected ? 0 : !verified ? 1 : !record.checkIn ? 2 : !record.checkOut ? 3 : 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Back */}
        <button
          onClick={onBack}
          className="group mb-6 inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-semibold text-sm transition"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">
            ←
          </span>
          Back to Home
        </button>

        {/* Card */}
        <div className="relative bg-white/75 backdrop-blur-2xl border border-white/70 rounded-[2.25rem] shadow-[0_30px_80px_-20px_rgba(8,145,178,0.45)] overflow-hidden">
          {/* Accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-cyan-500/40">
                    S
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-cyan-900 tracking-tight">
                    Employee Portal
                  </h1>
                  <p className="text-cyan-700/70 text-sm font-medium mt-0.5">
                    {today}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/80 border border-cyan-200/70 rounded-2xl px-3.5 py-2 shadow-sm">
                <span className="text-cyan-500 text-sm">🕒</span>
                <span className="text-cyan-900 font-bold text-sm tabular-nums">
                  {now}
                </span>
              </div>
            </div>

            {/* Step indicator */}
            <div className="mt-6 flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                    step > i
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                      : "bg-cyan-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-100 to-transparent" />

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* ---------- STEP 1: SEARCH ---------- */}
            <div>
              <label className="flex items-center gap-2 text-cyan-900 font-bold mb-3 text-xs uppercase tracking-[0.15em]">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-colors ${
                    selected
                      ? "bg-emerald-500 text-white"
                      : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {selected ? "✓" : "1"}
                </span>
                Select Your Name
              </label>

              <div ref={wrapperRef} className="relative">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none">
                    🔍
                  </span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowDropdown(true);
                      if (selected && e.target.value !== selected) {
                        setSelected("");
                        setVerified(false);
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Start typing your name..."
                    autoComplete="off"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-cyan-100 bg-white/90 text-cyan-900 font-medium placeholder:text-cyan-400/70 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 focus:bg-white transition-all hover:border-cyan-200 shadow-sm"
                  />
                  {search && (
                    <button
                      onClick={handleClearSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cyan-50 hover:bg-rose-50 hover:text-rose-600 text-cyan-600 flex items-center justify-center text-xs font-bold transition"
                      aria-label="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl border border-cyan-100 rounded-2xl shadow-[0_20px_50px_-15px_rgba(8,145,178,0.4)] max-h-72 overflow-y-auto overflow-hidden">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-4 py-8 text-center text-cyan-600 text-sm">
                        <div className="text-3xl mb-2 opacity-60">🔍</div>
                        <div className="font-semibold">
                          No employee found
                        </div>
                        <div className="text-xs text-cyan-500 mt-1">
                          Try a different name
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2.5 text-[10px] font-bold text-cyan-600 uppercase tracking-wider border-b border-cyan-100/80 sticky top-0 bg-white/95 backdrop-blur z-10">
                          {filteredEmployees.length} result
                          {filteredEmployees.length !== 1 ? "s" : ""}
                        </div>
                        {filteredEmployees.map((name, idx) => {
                          const isSelected = name === selected;
                          return (
                            <button
                              key={name}
                              onClick={() => handleSelectEmployee(name)}
                              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-cyan-50 to-blue-50"
                                  : "hover:bg-cyan-50/60"
                              } ${
                                idx !== filteredEmployees.length - 1
                                  ? "border-b border-cyan-50"
                                  : ""
                              }`}
                            >
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-[11px] shadow-sm flex-shrink-0">
                                {name
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <span className="font-semibold text-cyan-900 text-sm">
                                {name}
                              </span>
                              {isSelected && (
                                <span className="ml-auto w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Selected chip */}
              {selected && !showDropdown && (
                <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                    {selected}
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="ml-1 w-5 h-5 rounded-full bg-white hover:bg-rose-100 hover:text-rose-600 text-slate-500 text-[10px] font-bold transition"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* ---------- STEP 2: EMPLOYEE ID ---------- */}
            {selected && !verified && (
              <form onSubmit={handleVerify} className="space-y-3 animate-[fadeIn_0.3s_ease]">
                <label className="flex items-center gap-2 text-cyan-900 font-bold mb-1 text-xs uppercase tracking-[0.15em]">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[11px] font-extrabold">
                    2
                  </span>
                  Enter Your Employee ID
                </label>

                <div className="flex gap-2.5">
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
                    className={`flex-1 px-4 py-4 rounded-2xl border-2 bg-white/90 text-cyan-900 text-center tracking-[0.6em] text-2xl font-extrabold focus:outline-none focus:ring-4 transition-all placeholder:tracking-normal placeholder:text-cyan-300 placeholder:font-normal ${
                      pinError
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15 bg-rose-50/50"
                        : "border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500/15"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={pin.length !== 4 || loading}
                    className={`px-7 rounded-2xl font-bold shadow-lg transition-all ${
                      pin.length === 4
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.98]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <span className="inline-block animate-spin">⏳</span>
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>

                {pinError && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl px-3.5 py-2.5 animate-[fadeIn_0.2s_ease]">
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      !
                    </span>
                    {pinError}
                  </div>
                )}

                <p className="text-[11px] text-cyan-600/80 pt-1">
                  💡 Enter the <b>last 4 digits</b> of your Employee ID
                </p>
              </form>
            )}

            {/* ---------- STEP 3: VERIFIED ---------- */}
            {selected && verified && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                {/* Verified badge */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-cyan-50 to-emerald-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/40">
                        ✓
                      </div>
                      <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-[0.15em]">
                        Verified Identity
                      </div>
                      <div className="text-emerald-900 font-bold text-lg truncate">
                        {selected}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status cards */}
                <div className="grid grid-cols-2 gap-3">
                  <StatusCard
                    icon="🌅"
                    label="Check In"
                    time={prettyTime(record.checkIn)}
                    color="cyan"
                    done={!!record.checkIn}
                  />
                  <StatusCard
                    icon="🌇"
                    label="Check Out"
                    time={prettyTime(record.checkOut)}
                    color="blue"
                    done={!!record.checkOut}
                  />
                </div>

                {/* Action */}
                {!record.checkIn && (
                  <ActionButton
                    onClick={handleCheckIn}
                    disabled={!canCheckIn}
                    gradient="from-cyan-500 to-blue-600"
                    icon="✅"
                    label="Check In Now"
                    helper={
                      canCheckIn
                        ? null
                        : `Opens at ${prettyTime(config.checkInStart)}`
                    }
                  />
                )}

                {record.checkIn && !record.checkOut && (
                  <ActionButton
                    onClick={handleCheckOut}
                    disabled={!canCheckOut}
                    gradient="from-blue-500 to-indigo-600"
                    icon="🚪"
                    label="Check Out Now"
                    helper={
                      canCheckOut
                        ? null
                        : `Opens at ${prettyTime(config.checkOutStart)}`
                    }
                  />
                )}

                {record.checkIn && record.checkOut && (
                  <div className="relative overflow-hidden text-center bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold rounded-2xl py-5 shadow-xl shadow-emerald-500/30">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                    </div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="text-2xl">🎉</span>
                      <span>Day Complete — See you tomorrow!</span>
                    </div>
                  </div>
                )}

                {/* Windows */}
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-5">
                  <div className="text-[10px] font-bold text-cyan-800 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Attendance Windows
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <WindowRow
                      label="Check-In"
                      value={prettyWindow(
                        config.checkInStart,
                        config.checkInEnd
                      )}
                      active={canCheckIn}
                    />
                    <WindowRow
                      label="Check-Out"
                      value={prettyWindow(
                        config.checkOutStart,
                        config.checkOutEnd
                      )}
                      active={canCheckOut}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------- EMPTY ---------- */}
            {!selected && (
              <div className="text-center py-8 text-cyan-600/70">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-2xl mb-3">
                  ^
                </div>
                <p className="text-sm font-semibold">
                  Start typing to search for your name
                </p>
                <p className="text-xs text-cyan-500/70 mt-1">
                  {employees.length} employees available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-cyan-700/70 mt-6 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          Securely verified with Employee ID
        </p>
      </div>
    </div>
  );
}

/* ============ Sub-components ============ */

function StatusCard({ icon, label, time, color, done }) {
  const styles =
    color === "cyan"
      ? {
          bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/60",
          border: "border-cyan-200/80",
          text: "text-cyan-900",
          label: "text-cyan-700",
        }
      : {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100/60",
          border: "border-blue-200/80",
          text: "text-blue-900",
          label: "text-blue-700",
        };

  return (
    <div
      className={`relative rounded-2xl border ${styles.border} ${styles.bg} p-4 transition-all ${
        done ? "shadow-lg shadow-cyan-500/15" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.12em] ${styles.label}`}
        >
          {label}
        </span>
        {done && (
          <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
            ✓
          </span>
        )}
      </div>
      <div
        className={`text-xl font-extrabold tabular-nums ${styles.text} leading-none`}
      >
        {time}
      </div>
    </div>
  );
}

function ActionButton({ onClick, disabled, gradient, icon, label, helper }) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide transition-all ${
          disabled
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-dashed border-slate-200"
            : `ripple-btn bg-gradient-to-r ${gradient} text-white shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.99]`
        }`}
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-2xl">{icon}</span>
          {label}
        </span>
      </button>
      {helper && (
        <p className="text-center text-xs text-rose-500 font-semibold mt-2 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          {helper}
        </p>
      )}
    </div>
  );
}

function WindowRow({ label, value, active }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-all ${
        active
          ? "bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200"
          : "bg-white/80 border-cyan-100"
      }`}
    >
      <span className="text-cyan-700 font-semibold text-[10px] uppercase tracking-[0.12em]">
        {label}
      </span>
      <span
        className={`font-bold text-xs tabular-nums flex items-center gap-1.5 ${
          active ? "text-emerald-700" : "text-cyan-800"
        }`}
      >
        {active && (
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        )}
        {value}
      </span>
    </div>
  );
}