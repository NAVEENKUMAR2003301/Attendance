import React, { useEffect, useState } from "react";
import WaterBackground from "./components/WaterBackground";
import RoleSelect from "./components/RoleSelect";
import EmployeePortal from "./components/EmployeePortal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { seedEmployeesIfEmpty } from "./utils/storage";

const PAGES = {
  ROLE: "role",
  EMPLOYEE: "employee",
  ADMIN_LOGIN: "adminLogin",
  ADMIN_DASH: "adminDash",
};

export default function App() {
  const [page, setPage] = useState(PAGES.ROLE);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    console.log("🚀 App mounted — attempting to seed employees...");
    seedEmployeesIfEmpty()
      .then(() => {
        console.log("🎉 Seed complete");
        setSeeding(false);
      })
      .catch((err) => {
        console.error("❌ SEED FAILED:", err);
        console.error("👉 Check: databaseURL in firebase.js, DB created, rules set to test mode");
        setSeeding(false);
      });
  }, []);

  if (seeding) {
    return (
      <WaterBackground>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-6xl animate-float">🌊</div>
          <p className="text-cyan-800 font-semibold mt-4">
            Connecting to Firebase...
          </p>
          <p className="text-cyan-600 text-sm mt-2">
            Open browser console (F12) to see logs
          </p>
        </div>
      </WaterBackground>
    );
  }

  const handleRoleSelect = (role) => {
    if (role === "employee") setPage(PAGES.EMPLOYEE);
    else if (role === "admin") setPage(PAGES.ADMIN_LOGIN);
  };

  const goHome = () => setPage(PAGES.ROLE);

  return (
    <WaterBackground>
      {page === PAGES.ROLE && <RoleSelect onSelect={handleRoleSelect} />}
      {page === PAGES.EMPLOYEE && <EmployeePortal onBack={goHome} />}
      {page === PAGES.ADMIN_LOGIN && (
        <AdminLogin onSuccess={() => setPage(PAGES.ADMIN_DASH)} onBack={goHome} />
      )}
      {page === PAGES.ADMIN_DASH && <AdminDashboard onBack={goHome} />}
    </WaterBackground>
  );
}