import React from "react";

export default function RoleSelect({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-cyan-800 drop-shadow-sm">
          Attendance Portal
        </h1>
        <p className="mt-3 text-cyan-700 text-lg">Dive in. Mark your presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => onSelect("employee")}
          className="ripple-btn group bg-white/60 backdrop-blur-md border border-cyan-200 rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition">👤</div>
          <h2 className="text-2xl font-bold text-cyan-800">Employee</h2>
          <p className="text-cyan-600 mt-2 text-sm">Check-in & Check-out</p>
        </button>

        <button
          onClick={() => onSelect("admin")}
          className="ripple-btn group bg-white/60 backdrop-blur-md border border-cyan-200 rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition">🛡️</div>
          <h2 className="text-2xl font-bold text-cyan-800">Admin</h2>
          <p className="text-cyan-600 mt-2 text-sm">Password protected</p>
        </button>
      </div>
    </div>
  );
}