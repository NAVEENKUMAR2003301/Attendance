import React, { useEffect, useState } from "react";
import WaterBackground from "./components/WaterBackground";
import RoleSelect from "./components/RoleSelect";
import EmployeePortal from "./components/EmployeePortal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import {
  seedEmployeesIfEmpty,
  seedConfigIfEmpty,
  cleanupOldAttendance,
} from "./utils/storage";

const PAGES = {
  ROLE: "role",
  EMPLOYEE: "employee",
  ADMIN_LOGIN: "adminLogin",
  ADMIN_DASH: "adminDash",
};

const LAST_CLEANUP_KEY = "lastCleanup";

export default function App() {
  const [page, setPage] = useState(PAGES.ROLE);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await seedEmployeesIfEmpty();
        await seedConfigIfEmpty();

        const today = new Date().toISOString().slice(0, 10);
        const lastClean = localStorage.getItem(LAST_CLEANUP_KEY);

        if (lastClean !== today) {
          const result = await cleanupOldAttendance();
          localStorage.setItem(LAST_CLEANUP_KEY, today);
          if (result.deleted > 0) {
            console.log(
              `🧹 Auto-cleanup deleted ${result.deleted} old date(s)`
            );
          }
        }

        console.log("🎉 Boot complete");
      } catch (err) {
        console.error("❌ Boot failed:", err);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return (
      <WaterBackground>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-6xl animate-float">🌊</div>
          <p className="text-cyan-800 font-semibold mt-4">
            Connecting to Firebase...
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
        <AdminLogin
          onSuccess={() => setPage(PAGES.ADMIN_DASH)}
          onBack={goHome}
        />
      )}
      {page === PAGES.ADMIN_DASH && <AdminDashboard onBack={goHome} />}
    </WaterBackground>
  );
}