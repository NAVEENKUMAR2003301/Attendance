import React, { useState } from "react";
import WaterBackground from "./components/WaterBackground";
import RoleSelect from "./components/RoleSelect";
import EmployeePortal from "./components/EmployeePortal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

const PAGES = {
  ROLE: "role",
  EMPLOYEE: "employee",
  ADMIN_LOGIN: "adminLogin",
  ADMIN_DASH: "adminDash",
};

export default function App() {
  const [page, setPage] = useState(PAGES.ROLE);

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