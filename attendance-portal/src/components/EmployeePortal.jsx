// import React, { useEffect, useState } from "react";
// import {
//   getEmployeeNames,
//   getRecord,
//   setRecord,
//   getTodayKey,
//   verifyPin,
//   subscribeConfig,
//   DEFAULT_CONFIG,
// } from "../utils/storage";
// import {
//   isCheckInWindow,
//   isCheckOutWindow,
//   formatTime,
//   prettyTime,
//   prettyWindow,
// } from "../utils/timeUtils";

// export default function EmployeePortal({ onBack }) {
//   const [employees, setEmployees] = useState([]);
//   const [selected, setSelected] = useState("");
//   const [pin, setPin] = useState("");
//   const [verified, setVerified] = useState(false);
//   const [pinError, setPinError] = useState("");
//   const [record, setLocalRecord] = useState({ checkIn: null, checkOut: null });
//   const [config, setConfig] = useState(DEFAULT_CONFIG);
//   const [loading, setLoading] = useState(false);
//   const [tick, setTick] = useState(0);

//   const todayKey = getTodayKey();

//   useEffect(() => {
//     getEmployeeNames().then(setEmployees).catch(console.error);
//   }, []);

//   // Live config from Firebase
//   useEffect(() => {
//     const unsub = subscribeConfig(setConfig);
//     return () => unsub();
//   }, []);

//   // live clock tick for window re-evaluation
//   useEffect(() => {
//     const id = setInterval(() => setTick((t) => t + 1), 30000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     setVerified(false);
//     setPin("");
//     setPinError("");
//     if (selected) {
//       getRecord(todayKey, selected).then(setLocalRecord).catch(console.error);
//     }
//   }, [selected, todayKey, tick]);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const ok = await verifyPin(selected, pin);
//     setLoading(false);
//     if (ok) {
//       setVerified(true);
//       setPinError("");
//     } else {
//       setPinError("❌ Incorrect PIN. Try again.");
//       setPin("");
//     }
//   };

//   const handleCheckIn = async () => {
//     await setRecord(todayKey, selected, { checkIn: formatTime() });
//     setLocalRecord(await getRecord(todayKey, selected));
//   };

//   const handleCheckOut = async () => {
//     await setRecord(todayKey, selected, { checkOut: formatTime() });
//     setLocalRecord(await getRecord(todayKey, selected));
//   };

//   const canCheckIn = isCheckInWindow(config);
//   const canCheckOut = isCheckOutWindow(config);
//   const now = new Date().toLocaleTimeString("en-IN", { hour12: true });

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
//       <div className="w-full max-w-xl">
//         <button
//           onClick={onBack}
//           className="mb-6 text-cyan-700 hover:text-cyan-900 font-semibold"
//         >
//           ← Back
//         </button>

//         <div className="bg-white/70 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-8">
//           <h1 className="text-3xl font-bold text-cyan-800 mb-1">
//             Employee Portal
//           </h1>
//           <p className="text-cyan-600 mb-6 text-sm">
//             Now: <span className="font-semibold">{now}</span>
//           </p>

//           <label className="block text-cyan-800 font-semibold mb-2">
//             Select Your Name
//           </label>
//           <select
//             value={selected}
//             onChange={(e) => setSelected(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-cyan-300 bg-white/80 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
//           >
//             <option value="">-- Choose Employee --</option>
//             {employees.map((e) => (
//               <option key={e} value={e}>
//                 {e}
//               </option>
//             ))}
//           </select>

//           {selected && !verified && (
//             <form onSubmit={handleVerify} className="mb-4">
//               <label className="block text-cyan-800 font-semibold mb-2">
//                 🔐 Enter Your 4-Digit PIN
//               </label>
//               <div className="flex gap-3">
//                 <input
//                   type="password"
//                   inputMode="numeric"
//                   maxLength={4}
//                   value={pin}
//                   onChange={(e) => {
//                     setPin(e.target.value.replace(/\D/g, ""));
//                     setPinError("");
//                   }}
//                   placeholder="••••"
//                   autoFocus
//                   className="flex-1 px-4 py-3 rounded-xl border border-cyan-300 bg-white/80 text-cyan-900 text-center tracking-[0.5em] text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                 />
//                 <button
//                   type="submit"
//                   disabled={pin.length !== 4 || loading}
//                   className={`px-6 rounded-xl font-bold shadow-lg transition ${
//                     pin.length === 4
//                       ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105"
//                       : "bg-slate-200 text-slate-500 cursor-not-allowed"
//                   }`}
//                 >
//                   {loading ? "..." : "Verify"}
//                 </button>
//               </div>
//               {pinError && (
//                 <p className="text-rose-600 text-sm mt-2 font-semibold">
//                   {pinError}
//                 </p>
//               )}
//             </form>
//           )}

//           {selected && verified && (
//             <>
//               <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl px-4 py-2 mb-4 text-center">
//                 ✅ Identity Verified — {selected}
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div className="bg-cyan-50/80 border border-cyan-200 rounded-2xl p-4 text-center">
//                   <div className="text-xs text-cyan-600 font-semibold uppercase">
//                     Check In
//                   </div>
//                   <div className="text-xl font-bold text-cyan-900 mt-1">
//                     {prettyTime(record.checkIn)}
//                   </div>
//                 </div>
//                 <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-center">
//                   <div className="text-xs text-blue-600 font-semibold uppercase">
//                     Check Out
//                   </div>
//                   <div className="text-xl font-bold text-blue-900 mt-1">
//                     {prettyTime(record.checkOut)}
//                   </div>
//                 </div>
//               </div>

//               {!record.checkIn && (
//                 <button
//                   onClick={handleCheckIn}
//                   disabled={!canCheckIn}
//                   className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
//                     canCheckIn
//                       ? "ripple-btn bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-[1.02] hover:shadow-2xl"
//                       : "bg-slate-200 text-slate-500 cursor-not-allowed"
//                   }`}
//                 >
//                   ✅ Check In
//                 </button>
//               )}

//               {record.checkIn && !record.checkOut && (
//                 <button
//                   onClick={handleCheckOut}
//                   disabled={!canCheckOut}
//                   className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
//                     canCheckOut
//                       ? "ripple-btn bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-[1.02] hover:shadow-2xl"
//                       : "bg-slate-200 text-slate-500 cursor-not-allowed"
//                   }`}
//                 >
//                   🚪 Check Out
//                 </button>
//               )}

//               {record.checkIn && record.checkOut && (
//                 <div className="text-center bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-2xl py-4">
//                   🎉 Day Complete — See you tomorrow!
//                 </div>
//               )}

//               <div className="mt-6 text-xs text-cyan-700 space-y-1">
//                 <p>
//                   • Check-In:{" "}
//                   <b>
//                     {prettyWindow(config.checkInStart, config.checkInEnd)}
//                   </b>
//                 </p>
//                 <p>
//                   • Check-Out:{" "}
//                   <b>
//                     {prettyWindow(config.checkOutStart, config.checkOutEnd)}
//                   </b>
//                 </p>
//                 {!canCheckIn && !record.checkIn && (
//                   <p className="text-rose-600 font-semibold mt-2">
//                     ⚠️ Check-in is only allowed between{" "}
//                     {prettyWindow(config.checkInStart, config.checkInEnd)}.
//                   </p>
//                 )}
//                 {record.checkIn && !record.checkOut && !canCheckOut && (
//                   <p className="text-rose-600 font-semibold mt-2">
//                     ⚠️ Check-out is only allowed between{" "}
//                     {prettyWindow(config.checkOutStart, config.checkOutEnd)}.
//                   </p>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
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

const handleVerify = async (e) => {
  e.preventDefault();
  setLoading(true);
  const ok = await verifyEmpId(selected, pin); // pin = last 4 digits
  setLoading(false);
  if (ok) {
    setVerified(true);
    setPinError("");
  } else {
    setPinError("❌ Incorrect Employee ID. Try again.");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={onBack}
          className="group mb-6 inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-semibold text-sm transition"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">
            ←
          </span>
          Back to Home
        </button>

        {/* Main card */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(8,145,178,0.35)] overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-cyan-100/70 bg-gradient-to-b from-white/40 to-transparent">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-900 tracking-tight flex items-center gap-3">
                  <span className="inline-block w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-cyan-500/30">
                  S
                  </span>
                  Employee Portal
                </h1>
                <p className="text-cyan-700/80 mt-2 text-sm font-medium">
                  {today}
                </p>
              </div>

              {/* Live clock pill */}
              <div className="flex items-center gap-2 bg-white/70 border border-cyan-200/70 rounded-2xl px-4 py-2 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-cyan-900 font-semibold text-sm tabular-nums">
                  {now}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Step 1: Select employee */}
            <div>
              <label className="flex items-center gap-2 text-cyan-900 font-semibold mb-3 text-sm uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Select Your Name
              </label>
              <div className="relative">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full appearance-none px-4 py-4 pr-12 rounded-2xl border-2 border-cyan-200/70 bg-white/80 text-cyan-900 font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all cursor-pointer hover:border-cyan-300"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-cyan-600 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* Step 2: PIN */}
            {selected && !verified && (
              <form onSubmit={handleVerify} className="animate-[fadeIn_0.3s_ease]">
                <label className="flex items-center gap-2 text-cyan-900 font-semibold mb-3 text-sm uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Enter Your 4-Digit PIN
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
                    className="flex-1 px-4 py-4 rounded-2xl border-2 border-cyan-200/70 bg-white/80 text-cyan-900 text-center tracking-[0.7em] text-2xl font-bold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={pin.length !== 4 || loading}
                    className={`px-8 rounded-2xl font-bold shadow-lg transition-all ${
                      pin.length === 4
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-[1.03] hover:shadow-cyan-500/40 shadow-cyan-500/20"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
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
                  <p className="text-rose-600 text-sm mt-3 font-semibold flex items-center gap-2">
                    <span>⚠️</span> {pinError}
                  </p>
                )}
              </form>
            )}

            {/* Step 3: Verified state */}
            {selected && verified && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                {/* Verified badge */}
                <div className="relative flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
                      Identity Verified
                    </div>
                    <div className="text-emerald-900 font-bold">{selected}</div>
                  </div>
                </div>

                {/* Status cards */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* Actions */}
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
                  <div className="text-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl py-5 shadow-lg shadow-emerald-500/30">
                    🎉 Day Complete — See you tomorrow!
                  </div>
                )}

                {/* Time windows info */}
                <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-5">
                  <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-3">
                    ⏰ Attendance Windows
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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

            {/* Empty state */}
            {!selected && (
              <div className="text-center py-6 text-cyan-500/80 text-sm">
                <div className="text-4xl mb-3 opacity-60">^</div>
                Select your name to continue
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-cyan-700/70 mt-6">
          🔒 Your attendance is securely verified with PIN protection
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
          bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/70",
          border: "border-cyan-200",
          text: "text-cyan-900",
          label: "text-cyan-700",
        }
      : {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100/70",
          border: "border-blue-200",
          text: "text-blue-900",
          label: "text-blue-700",
        };

  return (
    <div
      className={`relative rounded-2xl border ${styles.border} ${styles.bg} p-5 transition-all ${
        done ? "shadow-lg shadow-cyan-500/10" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}
        >
          {label}
        </span>
        {done && (
          <span className="ml-auto text-emerald-500 text-sm font-bold">✓</span>
        )}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${styles.text}`}>
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
            : `ripple-btn bg-gradient-to-r ${gradient} text-white shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.99]`
        }`}
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-2xl">{icon}</span>
          {label}
        </span>
      </button>
      {helper && (
        <p className="text-center text-xs text-rose-500 font-semibold mt-2">
          🔒 {helper}
        </p>
      )}
    </div>
  );
}

function WindowRow({ label, value, active }) {
  return (
    <div className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2 border border-cyan-100">
      <span className="text-cyan-700 font-medium text-xs uppercase tracking-wide">
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