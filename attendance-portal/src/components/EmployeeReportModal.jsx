import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getEmployeeReport,
  getWeekRange,
  getMonthRange,
  getLast30DaysRange,
} from "../utils/storage";
import { prettyTime } from "../utils/timeUtils";

const COLORS = {
  Present: "#10b981",
  Working: "#f59e0b",
  Absent: "#f43f5e",
};

export default function EmployeeReportModal({
  employee,
  allAttendance,
  onClose,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const month = getMonthRange();

  const [fromDate, setFromDate] = useState(month.from);
  const [toDate, setToDate] = useState(today);
  const [activePreset, setActivePreset] = useState("month");

  const applyPreset = (preset) => {
    setActivePreset(preset);
    if (preset === "week") {
      const r = getWeekRange();
      setFromDate(r.from);
      setToDate(r.to);
    } else if (preset === "month") {
      const r = getMonthRange();
      setFromDate(r.from);
      setToDate(r.to);
    } else if (preset === "last30") {
      const r = getLast30DaysRange();
      setFromDate(r.from);
      setToDate(r.to);
    } else if (preset === "all") {
      const keys = Object.keys(allAttendance || {}).sort();
      if (keys.length > 0) {
        setFromDate(keys[0]);
        setToDate(keys[keys.length - 1]);
      }
    }
  };

  const report = useMemo(
    () => getEmployeeReport(allAttendance, employee, fromDate, toDate),
    [allAttendance, employee, fromDate, toDate]
  );

  // Summary stats
  const totalDays = report.length;
  const presentDays = report.filter((r) => r.status === "Present").length;
  const workingDays = report.filter((r) => r.status === "Working").length;
  const totalHours = report.reduce((s, r) => s + r.hours, 0);
  const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

  // Pie data
  const pieData = [
    { name: "Present", value: presentDays },
    { name: "Working", value: workingDays },
    { name: "Absent", value: totalDays - presentDays - workingDays },
  ].filter((d) => d.value > 0);

  // Bar chart data (short date label)
  const barData = report.map((r) => ({
    date: r.date.slice(5), // MM-DD
    hours: r.hours,
    fullDate: r.date,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden my-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-cyan-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
              {employee
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-900">{employee}</h2>
              <p className="text-xs text-cyan-700/70 font-medium">
                Attendance Report
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

        {/* Filters */}
        <div className="px-6 py-4 bg-cyan-50/60 border-b border-cyan-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-cyan-200 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-cyan-700 uppercase">
                From
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setActivePreset("");
                }}
                className="bg-transparent text-cyan-900 font-semibold text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-cyan-200 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-cyan-700 uppercase">
                To
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setActivePreset("");
                }}
                className="bg-transparent text-cyan-900 font-semibold text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 ml-auto">
              {[
                { k: "week", l: "This Week" },
                { k: "month", l: "This Month" },
                { k: "last30", l: "Last 30 Days" },
                { k: "all", l: "All Time" },
              ].map((p) => (
                <button
                  key={p.k}
                  onClick={() => applyPreset(p.k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activePreset === p.k
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                      : "bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                  }`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label="Total Days" value={totalDays} icon="📅" color="cyan" />
            <MiniStat
              label="Present"
              value={presentDays}
              icon="✅"
              color="emerald"
            />
            <MiniStat
              label="Absent"
              value={totalDays - presentDays - workingDays}
              icon="❌"
              color="rose"
            />
            <MiniStat
              label="Avg Hours"
              value={avgHours}
              icon="⏱️"
              color="amber"
            />
          </div>

          {report.length === 0 ? (
            <div className="text-center py-16 text-cyan-600">
              <div className="text-5xl mb-3 opacity-50">📭</div>
              <p className="font-semibold">
                No attendance records in this date range
              </p>
              <p className="text-xs mt-1 text-cyan-500">
                Try a different range or preset above
              </p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="bg-white/70 rounded-2xl border border-cyan-100 p-4">
                <h3 className="text-sm font-bold text-cyan-900 uppercase tracking-wider mb-3">
                  📊 Daily Working Hours
                </h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                      <XAxis
                        dataKey="date"
                        stroke="#0e7490"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#0e7490"
                        fontSize={11}
                        tickLine={false}
                        label={{
                          value: "hours",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 11,
                          fill: "#0e7490",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #67e8f9",
                          borderRadius: "10px",
                          fontSize: 12,
                        }}
                        formatter={(value, name, props) => [
                          `${value} hrs`,
                          props.payload.fullDate,
                        ]}
                      />
                      <Bar
                        dataKey="hours"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie + Table */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/70 rounded-2xl border border-cyan-100 p-4 md:col-span-1">
                  <h3 className="text-sm font-bold text-cyan-900 uppercase tracking-wider mb-3">
                    🥧 Status Split
                  </h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#fff",
                            border: "1px solid #67e8f9",
                            borderRadius: "10px",
                            fontSize: 12,
                          }}
                        />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Day table */}
                <div className="bg-white/70 rounded-2xl border border-cyan-100 p-4 md:col-span-2">
                  <h3 className="text-sm font-bold text-cyan-900 uppercase tracking-wider mb-3">
                    📋 Day-wise Details
                  </h3>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-cyan-100">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-cyan-50">
                        <tr className="text-xs text-cyan-800 uppercase">
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">In</th>
                          <th className="px-3 py-2 text-left">Out</th>
                          <th className="px-3 py-2 text-right">Hrs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.map((r) => (
                          <tr
                            key={r.date}
                            className="border-t border-cyan-100/60 hover:bg-cyan-50/50"
                          >
                            <td className="px-3 py-2 font-mono text-xs text-cyan-800">
                              {r.date}
                            </td>
                            <td className="px-3 py-2 text-xs text-cyan-700">
                              {prettyTime(r.checkIn)}
                            </td>
                            <td className="px-3 py-2 text-xs text-cyan-700">
                              {prettyTime(r.checkOut)}
                            </td>
                            <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-cyan-900">
                              {r.hours}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-100 flex justify-end bg-cyan-50/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon, color }) {
  const palettes = {
    cyan: "from-cyan-500 to-blue-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className="bg-white border border-cyan-100 rounded-2xl p-3 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${palettes[color]} flex items-center justify-center text-white text-lg shadow`}
      >
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-cyan-700/70 font-semibold uppercase tracking-wider">
          {label}
        </div>
        <div className="text-lg font-bold text-cyan-900 tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}