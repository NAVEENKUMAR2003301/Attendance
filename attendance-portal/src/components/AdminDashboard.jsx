import React, { useEffect, useRef, useState } from "react";
import {
  getEmployees,
  addEmployee,
  deleteEmployee,
  getAttendance,
  getTodayKey,
  setRecord,
} from "../utils/storage";
import { prettyTime } from "../utils/timeUtils";
import { exportToExcel, importFromExcel } from "../utils/excelUtils";
import AddEmployeeModal from "./AddEmployeeModal";

export default function AdminDashboard({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(getTodayKey());
  const [attendance, setAttendance] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [toast, setToast] = useState("");
  const fileRef = useRef();

  const refresh = () => {
    setEmployees(getEmployees());
    setAttendance(getAttendance());
  };

  useEffect(() => {
    refresh();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const dayData = attendance[date] || {};

  const startEdit = (employee, field) => {
    setEditing({ employee, field });
    setEditValue(dayData[employee]?.[field] || "");
  };

  const saveEdit = () => {
    if (!editing) return;
    const { employee, field } = editing;
    const updated = setRecord(date, employee, { [field]: editValue || null });
    setAttendance((a) => ({
      ...a,
      [date]: { ...(a[date] || {}), [employee]: updated },
    }));
    setEditing(null);
    showToast(`Updated ${employee}'s ${field}`);
  };

  const handleAddEmployee = (name) => {
    const updated = addEmployee(name);
    setEmployees(updated);
    showToast(`Added ${name}`);
  };

  const handleDelete = (name) => {
    if (!window.confirm(`Delete ${name}? Their attendance history remains.`)) return;
    const updated = deleteEmployee(name);
    setEmployees(updated);
    showToast(`Deleted ${name}`);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFromExcel(file, date);
      refresh();
      showToast("Excel imported successfully");
    } catch {
      showToast("Import failed");
    }
    e.target.value = "";
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-cyan-700 hover:text-cyan-900 font-semibold"
          >
            ← Logout
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-800 text-center flex-1">
            🛡️ Admin Dashboard
          </h1>
          <div className="w-16" />
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-cyan-200 rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-cyan-800 font-semibold text-sm">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-cyan-300 bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="ripple-btn px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow hover:scale-105 transition"
          >
            ➕ Add Employee
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:scale-105 transition"
          >
            ⬆️ Import Excel
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
          />

          <button
            onClick={() => exportToExcel(date)}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold shadow hover:scale-105 transition"
          >
            ⬇️ Export Excel
          </button>

          <div className="ml-auto text-sm text-cyan-700">
            Total: <b>{employees.length}</b>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-cyan-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-sm font-semibold">Employee</th>
                  <th className="px-4 py-3 text-sm font-semibold">Check In</th>
                  <th className="px-4 py-3 text-sm font-semibold">Check Out</th>
                  <th className="px-4 py-3 text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => {
                  const rec = dayData[emp] || {};
                  const status =
                    rec.checkIn && rec.checkOut
                      ? "Present"
                      : rec.checkIn
                      ? "Working"
                      : "Absent";
                  const badge =
                    status === "Present"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : status === "Working"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-rose-100 text-rose-800 border-rose-300";

                  return (
                    <tr
                      key={emp}
                      className={`border-t border-cyan-100 hover:bg-cyan-50/60 transition ${
                        i % 2 ? "bg-white/40" : "bg-white/20"
                      }`}
                    >
                      <td className="px-4 py-3 text-cyan-700 text-sm">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-cyan-900">{emp}</td>

                      <td className="px-4 py-3">
                        {editing?.employee === emp && editing.field === "checkIn" ? (
                          <div className="flex gap-1">
                            <input
                              type="time"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border border-cyan-300 rounded text-sm"
                            />
                            <button onClick={saveEdit} className="text-emerald-600 font-bold">
                              ✔
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="text-rose-600 font-bold"
                            >
                              ✖
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(emp, "checkIn")}
                            className="text-cyan-700 hover:text-cyan-900 hover:underline text-sm"
                          >
                            {prettyTime(rec.checkIn)}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editing?.employee === emp && editing.field === "checkOut" ? (
                          <div className="flex gap-1">
                            <input
                              type="time"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border border-cyan-300 rounded text-sm"
                            />
                            <button onClick={saveEdit} className="text-emerald-600 font-bold">
                              ✔
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="text-rose-600 font-bold"
                            >
                              ✖
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(emp, "checkOut")}
                            className="text-cyan-700 hover:text-cyan-900 hover:underline text-sm"
                          >
                            {prettyTime(rec.checkOut)}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${badge}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(emp)}
                          className="text-rose-600 hover:text-rose-800 text-sm font-semibold"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-cyan-600">
                      No employees yet. Click "Add Employee" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-cyan-600 mt-4">
          💡 Tip: Click any time value to edit it manually (no time restriction for admin).
        </p>
      </div>

      {showAdd && (
        <AddEmployeeModal onClose={() => setShowAdd(false)} onAdd={handleAddEmployee} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-800 text-white px-6 py-3 rounded-xl shadow-2xl animate-float">
          {toast}
        </div>
      )}
    </div>
  );
}