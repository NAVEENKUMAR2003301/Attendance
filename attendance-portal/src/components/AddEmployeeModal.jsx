import React, { useMemo, useState } from "react";

export default function AddEmployeeModal({
  onClose,
  onAdd,
  existingEmployees,
}) {
  const [mode, setMode] = useState("single");
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [poc, setPoc] = useState("");
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);

  const [bulkText, setBulkText] = useState("");
  const [autoId, setAutoId] = useState(true);
  const [bulkResult, setBulkResult] = useState(null);

  // ---------- Existing POCs (from current employees) ----------
  const existingPocs = useMemo(() => {
    const s = new Set();
    (existingEmployees || []).forEach((e) => {
      const p = (e.poc || "").trim();
      if (p) s.add(p);
    });
    return Array.from(s).sort();
  }, [existingEmployees]);

  // ---------- helpers ----------
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

  // ---------- single ----------
  const handleAddSingle = async () => {
    if (!name.trim()) {
      setErr("Name cannot be empty");
      return;
    }
    setWorking(true);
    try {
      await onAdd(name.trim(), empId.trim() || suggestNextId(), poc.trim());
      onClose();
    } catch (e) {
      setErr("Failed: " + e.message);
    } finally {
      setWorking(false);
    }
  };

  // ---------- bulk parse ----------
  // Supported:
  //   Ganesh
  //   Ganesh, 1021
  //   Ganesh, 1021, Ramesh      ← name, id, poc
  //   Ganesh, , Ramesh           ← name, (auto id), poc
  //   Ganesh|1021|Ramesh
  const parseBulkInput = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const result = [];
    const seen = new Set();

    for (const line of lines) {
      let n = "";
      let id = "";
      let p = "";

      if (line.includes(",") || line.includes("|")) {
        const parts = line.split(/[,|]/).map((s) => s.trim());
        n = parts[0] || "";
        id = parts[1] || "";
        p = parts[2] || "";
      } else {
        n = line;
      }

      if (!n) continue;
      const key = n.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      result.push({ name: n, empId: id, poc: p });
    }

    return result;
  };

  const parsedBulk = parseBulkInput(bulkText);
  const previewCount = parsedBulk.length;
  const withCustomId = parsedBulk.filter((p) => p.empId).length;
  const withPoc = parsedBulk.filter((p) => p.poc).length;

  const handleAddBulk = async () => {
    if (parsedBulk.length === 0) {
      setErr("Please enter at least one name");
      return;
    }

    if (!autoId) {
      const missingId = parsedBulk.find((p) => !p.empId);
      if (missingId) {
        setErr(
          `Missing ID for "${missingId.name}". Add an ID or enable auto-generate.`
        );
        return;
      }
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
      for (const row of parsedBulk) {
        try {
          let idToUse = row.empId?.trim();
          if (!idToUse) {
            if (!autoId) throw new Error("No ID");
            counter += 1;
            idToUse = String(counter);
          }
          await onAdd(row.name, idToUse, row.poc || "");
          added.push({ name: row.name, empId: idToUse, poc: row.poc });
        } catch (e) {
          skipped.push(row.name);
        }
      }
      setBulkResult({
        added: added.length,
        skipped: skipped.length,
      });
      setBulkText("");
      if (skipped.length === 0) {
        setTimeout(() => onClose(), 1800);
      }
    } catch (e) {
      setErr("Failed: " + e.message);
    } finally {
      setWorking(false);
    }
  };

  const handleDownloadBulkTemplate = () => {
    const csv =
      "Employee Name, Employee ID, POC\nGanesh, 1021, Ramesh\nHarsha, 1022, Ramesh\nK Naveen, 1023, Suresh\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee-bulk-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden my-4">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

        {/* Header */}
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
                  : "Paste names with optional ID and POC"}
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

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 p-1 bg-cyan-50 border border-cyan-100 rounded-2xl">
            <TabBtn
              active={mode === "single"}
              onClick={() => {
                setMode("single");
                setErr("");
                setBulkResult(null);
              }}
              icon="👤"
              label="Single"
            />
            <TabBtn
              active={mode === "bulk"}
              onClick={() => {
                setMode("bulk");
                setErr("");
              }}
              icon="👥"
              label="Bulk Add"
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
          {/* ---------- SINGLE ---------- */}
          {mode === "single" && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                    Employee Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErr("");
                    }}
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
                      onChange={(e) =>
                        setEmpId(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder={`Auto: ${suggestNextId()}`}
                      inputMode="numeric"
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
                    💡 Employee enters their ID to check in
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1.5">
                    POC (Point of Contact)
                  </label>
                  <PocInput
                    value={poc}
                    onChange={setPoc}
                    existingPocs={existingPocs}
                  />
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

          {/* ---------- BULK ---------- */}
          {mode === "bulk" && (
            <>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-cyan-800 uppercase tracking-wider">
                      Employee Data
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
                    onChange={(e) => {
                      setBulkText(e.target.value);
                      setErr("");
                      setBulkResult(null);
                    }}
                    placeholder={`Format per line:\nName, ID, POC\n\nExamples:\nGanesh, 1021, Ramesh\nHarsha, , Ramesh\nK Naveen\nM Yuva Kumar, 1024`}
                    rows={9}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none text-sm leading-relaxed font-mono"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-cyan-600">
                      <b>Name, ID, POC</b> — ID/POC optional
                    </span>
                    <span
                      className={`font-bold ${
                        previewCount > 0
                          ? "text-emerald-600"
                          : "text-cyan-500/70"
                      }`}
                    >
                      {previewCount} name{previewCount !== 1 ? "s" : ""}
                      {withCustomId > 0 && (
                        <span className="text-cyan-600">
                          {" "}
                          · {withCustomId} with ID
                        </span>
                      )}
                      {withPoc > 0 && (
                        <span className="text-cyan-600">
                          {" "}
                          · {withPoc} with POC
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Live preview */}
                {previewCount > 0 && (
                  <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-2">
                      Preview
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {parsedBulk.slice(0, 20).map((p, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 items-center text-xs bg-white/70 rounded-lg px-2 py-1"
                        >
                          <span className="col-span-5 font-medium text-cyan-900 truncate">
                            {p.name}
                          </span>
                          <span
                            className={`col-span-3 font-mono font-bold text-right ${
                              p.empId ? "text-cyan-700" : "text-slate-400"
                            }`}
                          >
                            {p.empId || (autoId ? "auto" : "—")}
                          </span>
                          <span
                            className={`col-span-4 font-medium text-right truncate ${
                              p.poc ? "text-cyan-700" : "text-slate-400"
                            }`}
                          >
                            {p.poc || "—"}
                          </span>
                        </div>
                      ))}
                      {previewCount > 20 && (
                        <div className="text-[11px] text-cyan-600 text-center py-1">
                          +{previewCount - 20} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 hover:bg-cyan-100/70 transition">
                  <input
                    type="checkbox"
                    checked={autoId}
                    onChange={(e) => setAutoId(e.target.checked)}
                    className="w-4 h-4 accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-cyan-900">
                      Auto-generate IDs for rows without one
                    </div>
                    <div className="text-xs text-cyan-700/80">
                      Sequential numbers continuing from last employee
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

/* ============ Sub-components ============ */

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

function PocInput({ value, onChange, existingPocs }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = existingPocs.filter(
    (p) =>
      !value ||
      p.toLowerCase().includes(value.toLowerCase()) ||
      value.toLowerCase() === p.toLowerCase()
  );

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Type or pick a POC name"
        className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 bg-white text-cyan-900 font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl border border-cyan-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onChange(p);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-cyan-800 hover:bg-cyan-50 transition border-b border-cyan-50 last:border-b-0"
            >
              👤 {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}