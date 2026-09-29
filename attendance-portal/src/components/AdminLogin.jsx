import React, { useState } from "react";
import { ADMIN_PASSWORD } from "../data/employees";

export default function AdminLogin({ onSuccess, onBack }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError("Incorrect password");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPwd("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className={`bg-white/70 backdrop-blur-md border border-cyan-200 rounded-3xl shadow-2xl p-8 w-full max-w-md ${
          shake ? "animate-shake" : ""
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className="text-cyan-700 hover:text-cyan-900 font-semibold mb-4"
        >
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🔒</div>
          <h2 className="text-2xl font-bold text-cyan-800">Admin Access</h2>
          <p className="text-cyan-600 text-sm mt-1">Enter password to continue</p>
        </div>

        <input
          type="password"
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setError("");
          }}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-cyan-300 bg-white/80 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        {error && (
          <p className="text-rose-600 text-sm mt-2 font-semibold">{error}</p>
        )}

        <button
          type="submit"
          className="ripple-btn w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg hover:scale-[1.02] transition"
        >
          Unlock Dashboard
        </button>

        <p className="text-xs text-center text-cyan-500 mt-4"></p>
      </form>
    </div>
  );
}