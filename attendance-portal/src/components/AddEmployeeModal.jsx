import React, { useState } from "react";

export default function AddEmployeeModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      setErr("Name cannot be empty");
      return;
    }
    onAdd(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-cyan-800 mb-4">➕ Add New Employee</h3>

        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
          }}
          placeholder="Employee full name"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-cyan-300 bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        {err && <p className="text-rose-600 text-sm mt-2">{err}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="ripple-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg hover:scale-[1.02] transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}