import React, { useEffect, useState } from "react";

export default function TimeSettingsModal({ config, onClose, onSave }) {
  const [local, setLocal] = useState(config);

  useEffect(() => setLocal(config), [config]);

  const update = (key, value) => setLocal((c) => ({ ...c, [key]: value }));

  const handleSave = () => {
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMin(local.checkInStart) >= toMin(local.checkInEnd)) {
      alert("Check-In start must be before end");
      return;
    }
    if (toMin(local.checkOutStart) >= toMin(local.checkOutEnd)) {
      alert("Check-Out start must be before end");
      return;
    }
    onSave(local);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-cyan-800 mb-5">
          ⚙️ Attendance Time Settings
        </h3>

        <div className="space-y-4">
          {/* Check-In */}
          <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-4">
            <div className="text-xs uppercase font-semibold text-cyan-700 mb-2">
              ✅ Check-In Window
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-sm font-semibold text-cyan-900 w-14">
                Start
              </label>
              <input
                type="time"
                value={local.checkInStart}
                onChange={(e) => update("checkInStart", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-cyan-300 bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <label className="text-sm font-semibold text-cyan-900 w-14">
                End
              </label>
              <input
                type="time"
                value={local.checkInEnd}
                onChange={(e) => update("checkInEnd", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-cyan-300 bg-white text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Check-Out */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
            <div className="text-xs uppercase font-semibold text-blue-700 mb-2">
              🚪 Check-Out Window
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-sm font-semibold text-blue-900 w-14">
                Start
              </label>
              <input
                type="time"
                value={local.checkOutStart}
                onChange={(e) => update("checkOutStart", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-blue-300 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-semibold text-blue-900 w-14">
                End
              </label>
              <input
                type="time"
                value={local.checkOutEnd}
                onChange={(e) => update("checkOutEnd", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-blue-300 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-cyan-600 mt-4">
          💡 Employees can only check-in/out within these windows. Admin can
          always edit attendance manually.
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="ripple-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg hover:scale-[1.02] transition"
          >
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}