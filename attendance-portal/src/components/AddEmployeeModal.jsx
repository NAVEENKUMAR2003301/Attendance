import React, { useState } from "react";

export default function AddEmployeeModal({ onClose, onAdd, existingEmployees }) {
  const [mode, setMode] = useState("single");
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);

  const [bulkText, setBulkText] = useState("");
  const [autoId, setAutoId] = useState(true);
  const [bulkResult, setBulkResult] = useState(null);

  // Suggest next ID based on existing employees
  const suggestNextId = () => {
  let max = 1000;
  (existingEmployees || []).forEach((e) => {
    if (e.empId && /^\d+$/.test(e.empId)) {
      const n = parseInt(e.empId, 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  return String(max + 1);
};

  const handleAddSingle = async () => {
    if (!name.trim()) {
      setErr("Name cannot be empty");
      return;
    }
    setWorking(true);
    try {
      await onAdd(name.trim(), empId.trim() || suggestNextId());
      onClose();
    } catch (e) {
      setErr("Failed: " + e.message);
    } finally {
      setWorking(false);
    }
  };

  const parseBulkInput = (text) => {
    const raw = text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set();
    const unique = [];
    for (const n of raw) {
      const key = n.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(n);
      }
    }
    return unique;
  };

  const previewCount = parseBulkInput(bulkText).length;

  const handleAddBulk = async () => {
    const names = parseBulkInput(bulkText);
    if (names.length === 0) {
      setErr("Please enter at least one name");
      return;
    }
    setWorking(true);
    setErr("");
    const added = [];
    const skipped = [];
    let counter = 1000;
(existingEmployees || []).forEach((e) => {
  if (e.empId && /^\d+$/.test(e.empId)) {
    const n = parseInt(e.empId, 10);
    if (!isNaN(n) && n > counter) counter = n;
  }
});
    try {
      for (const n of names) {
        try {
          let idToUse;
          if (autoId) {
  counter += 1;
  idToUse = String(counter);
}
          await onAdd(n, idToUse);
          added.push(n);
        } catch (e) {
          skipped.push(n);
        }
      }
      setBulkResult({ added: added.length, skipped: skipped.length });
      setBulkText("");
      if (skipped.length === 0) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (e) {
      setErr("Failed: " + e.message);
    } finally {
      setWorking(false);
    }
  };

  const handleDownloadBulkTemplate = () => {
    const csv = "Employee Name\nGanesh\nHarsha\nK Naveen\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden my-4">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-cyan-500/30">
              👤
            </div>
            <div>
              <h3 className="text-xl font-bold text-cyan-900">
                Add Employee{previewCount > 1 && mode === "bulk" ? "s" : ""}
              </h3>
              <p className="text-xs text-cyan-700/70 font-medium">
                {mode === "single"
                  ? "Add one employee at a time"
                  : "Paste or type multiple names"}
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

        <div className="px-6 pb-4">
          <div className="flex gap-2 p-1 bg-cyan-50 border border-cyan-100 rounded-2xl">
            <TabBtn
              active={mode === "single"}
              onClick={() => { setMode("single"); setErr(""); setBulkResult(null); }}
              icon="👤"
              label="Single"
            />
            <TabBtn
              active={mode === "bulk"}
              onClick={() => { setMode("bulk"); setErr(""); }}
              icon="👥"
              label="Bulk Add"
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          {mode === "single" && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                    Employee Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErr(""); }}
                    placeholder="e.g. Ganesh Kumar"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                    Employee ID (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                      placeholder={`Auto: ${suggestNextId()}`}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-mono tracking-wider focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setEmpId(suggestNextId())}
                      className="px-4 rounded-xl bg-cyan-100 text-cyan-800 font-semibold text-sm hover:bg-cyan-200 transition"
                    >
                      🎲 Auto
                    </button>
                  </div>
                  <p className="text-[11px] text-cyan-600 mt-1.5">
                    💡 Employee will enter the <b>last 4 digits</b> to check in
                  </p>
                </div>

                {err && (
                  <p className="text-rose-600 text-sm font-semibold flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    ⚠️ {err}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={working}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSingle}
                  disabled={working}
                  className="ripple-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition disabled:opacity-60"
                >
                  {working ? "Adding..." : "➕ Add Employee"}
                </button>
              </div>
            </>
          )}

          {mode === "bulk" && (
            <>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider">
                      Employee Names
                    </label>
                    <button
                      onClick={handleDownloadBulkTemplate}
                      className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-800 hover:underline"
                    >
                      ⬇ Download template
                    </button>
                  </div>
                  <textarea
                    value={bulkText}
                    onChange={(e) => { setBulkText(e.target.value); setErr(""); setBulkResult(null); }}
                    placeholder={`Enter one name per line, or separate with commas:\n\nGanesh\nHarsha\nK Naveen\n\nor\n\nGanesh, Harsha, K Naveen`}
                    rows={9}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-cyan-600">
                      Separated by <b>newline</b> or <b>comma</b>
                    </span>
                    <span
                      className={`font-bold ${
                        previewCount > 0 ? "text-emerald-600" : "text-cyan-500/70"
                      }`}
                    >
                      {previewCount} name{previewCount !== 1 ? "s" : ""} detected
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 hover:bg-cyan-100/70 transition">
                  <input
                    type="checkbox"
                    checked={autoId}
                    onChange={(e) => setAutoId(e.target.checked)}
                    className="w-4 h-4 accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-cyan-900">
                      Auto-generate Employee IDs
                    </div>
                    <div className="text-xs text-cyan-700/80">
                      Each gets sequential ID like EMP1021, EMP1022, ...
                    </div>
                  </div>
                </label>

                {err && (
                  <p className="text-rose-600 text-sm font-semibold flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    ⚠️ {err}
                  </p>
                )}

                {bulkResult && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <div className="text-sm font-bold text-emerald-800 mb-1">
                      ✅ Added {bulkResult.added} employee
                      {bulkResult.added !== 1 ? "s" : ""}
                    </div>
                    {bulkResult.skipped > 0 && (
                      <div className="text-xs text-amber-700">
                        ⚠️ Skipped {bulkResult.skipped} (already exist)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={working}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBulk}
                  disabled={working || previewCount === 0}
                  className="ripple-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {working
                    ? "Adding..."
                    : `➕ Add ${previewCount > 0 ? previewCount : ""} Employee${
                        previewCount !== 1 ? "s" : ""
                      }`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
        active
          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
          : "text-cyan-700 hover:bg-white/60"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}