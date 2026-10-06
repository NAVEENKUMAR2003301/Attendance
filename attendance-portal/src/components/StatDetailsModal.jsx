import React from "react";
import { prettyTime } from "../utils/timeUtils";

export default function StatDetailsModal({
  type, // "Present" | "Working" | "Absent"
  employees,
  dayData,
  date,
  onClose,
}) {
  // Filter employees by status
  const filtered = employees.filter((empObj) => {
    const rec = dayData[empObj.name] || {};
    if (type === "Present") return rec.checkIn && rec.checkOut;
    if (type === "Working") return rec.checkIn && !rec.checkOut;
    if (type === "Absent") return !rec.checkIn;
    return false;
  });

  const meta = {
    Present: {
      icon: "✅",
      gradient: "from-emerald-500 to-teal-600",
      accent: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      pill: "bg-emerald-100 text-emerald-800",
      desc: "Checked in and out fully",
    },
    Working: {
      icon: "⏳",
      gradient: "from-amber-500 to-orange-500",
      accent: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      pill: "bg-amber-100 text-amber-800",
      desc: "Checked in, not yet out",
    },
    Absent: {
      icon: "❌",
      gradient: "from-rose-500 to-pink-600",
      accent: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      pill: "bg-rose-100 text-rose-800",
      desc: "No check-in recorded",
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Accent bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />

        {/* Header */}
        <div className="px-6 py-5 border-b border-cyan-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}
            >
              {meta.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-900">
                {type} Employees
              </h2>
              <p className="text-xs text-cyan-700/70 font-medium">
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {meta.desc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Count strip */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-50/60 to-transparent border-b border-cyan-100">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${meta.pill}`}
            >
              {filtered.length} {filtered.length === 1 ? "employee" : "employees"}
            </span>
            <span className="text-xs text-cyan-700">
              out of {employees.length} total
            </span>
          </div>
        </div>

        {/* List */}
        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-cyan-600">
              <div className="text-5xl mb-3 opacity-50">{meta.icon}</div>
              <div className="font-semibold">No {type.toLowerCase()} employees</div>
              <div className="text-xs text-cyan-500 mt-1">
                for the selected date
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((empObj, i) => {
                const rec = dayData[empObj.name] || {};
                const initials = empObj.name
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={empObj.id || empObj.name}
                    className={`flex items-center gap-3 bg-white/70 border border-cyan-100 rounded-2xl px-4 py-3 hover:border-cyan-300 hover:shadow-md transition-all`}
                  >
                    <span className="text-xs font-bold text-cyan-500/70 w-6 text-center tabular-nums">
                      {i + 1}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-cyan-900 truncate">
                        {empObj.name}
                      </div>
                      <div className="text-xs text-cyan-600/80 font-mono">
                        ID: {empObj.empId || "—"}
                      </div>
                    </div>
                    <div className="text-right text-xs flex-shrink-0">
                      {type === "Present" && (
                        <>
                          <div className="text-emerald-700 font-semibold">
                            {prettyTime(rec.checkIn)}
                          </div>
                          <div className="text-emerald-600/70">
                            → {prettyTime(rec.checkOut)}
                          </div>
                        </>
                      )}
                      {type === "Working" && (
                        <>
                          <div className="text-amber-700 font-semibold">
                            {prettyTime(rec.checkIn)}
                          </div>
                          <div className="text-amber-600/70">still in</div>
                        </>
                      )}
                      {type === "Absent" && (
                        <div className="text-rose-500 font-semibold">—</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-100 bg-cyan-50/40 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${meta.gradient} text-white font-semibold shadow-lg hover:scale-[1.02] transition`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}