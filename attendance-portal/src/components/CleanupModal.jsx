import React, { useEffect, useState } from "react";
import {
  previewOldAttendance,
  cleanupOldAttendance,
  getAllAttendance,
  RETENTION_DAYS,
} from "../utils/storage";
import { exportHistoryBackup } from "../utils/excelUtils";

export default function CleanupModal({ onClose, onDone }) {
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    previewOldAttendance()
      .then(setExpired)
      .finally(() => setLoading(false));
  }, []);

  const handleBackupAndDelete = async () => {
    setWorking(true);
    try {
      const all = await getAllAttendance();
      exportHistoryBackup(all);
      const result = await cleanupOldAttendance();
      onDone(result.deleted);
    } catch (err) {
      alert("Cleanup failed: " + err.message);
    } finally {
      setWorking(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Permanently delete ${expired.length} old date(s)? This cannot be undone.`
      )
    )
      return;
    setWorking(true);
    try {
      const result = await cleanupOldAttendance();
      onDone(result.deleted);
    } catch (err) {
      alert("Cleanup failed: " + err.message);
    } finally {
      setWorking(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-cyan-800 mb-4">
          🧹 Clean Old Attendance
        </h3>

        <p className="text-sm text-cyan-700 mb-4">
          Records older than <b>{RETENTION_DAYS} days</b> (~3 months) will be
          removed from Firebase.
        </p>

        {loading ? (
          <div className="text-center py-6 text-cyan-600">Loading...</div>
        ) : expired.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm font-semibold text-center">
            ✅ Nothing to clean — all records are within the last{" "}
            {RETENTION_DAYS} days.
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <div className="text-amber-900 font-semibold text-sm mb-2">
                ⚠️ {expired.length} old date(s) will be deleted:
              </div>
              <div className="max-h-32 overflow-y-auto text-xs text-amber-800 font-mono bg-white/60 rounded-lg p-2">
                {expired.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
            </div>

            <p className="text-xs text-cyan-600 mb-4">
              💡 Recommended: click <b>Download Backup & Delete</b> to save
              these records as an Excel file first.
            </p>
          </>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {expired.length > 0 && (
            <>
              <button
                onClick={handleBackupAndDelete}
                disabled={working}
                className="ripple-btn w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
              >
                {working ? "Working..." : "📥 Download Backup & Delete"}
              </button>
              <button
                onClick={handleDelete}
                disabled={working}
                className="w-full py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition disabled:opacity-60"
              >
                🗑 Delete Without Backup
              </button>
            </>
          )}
          <button
            onClick={onClose}
            disabled={working}
            className="w-full py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}