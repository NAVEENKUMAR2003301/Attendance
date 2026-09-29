import * as XLSX from "xlsx";
import { getEmployees, getAttendance, saveAttendance } from "./storage";

export const exportToExcel = (dateKey) => {
  const employees = getEmployees();
  const attendance = getAttendance();
  const dayData = attendance[dateKey] || {};

  const rows = employees.map((emp) => {
    const rec = dayData[emp] || {};
    return {
      Employee: emp,
      "Check In": rec.checkIn || "",
      "Check Out": rec.checkOut || "",
      Status: rec.checkIn && rec.checkOut ? "Present" : rec.checkIn ? "Working" : "Absent",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, `attendance-${dateKey}.xlsx`);
};

export const importFromExcel = (file, dateKey) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        const attendance = getAttendance();
        if (!attendance[dateKey]) attendance[dateKey] = {};

        rows.forEach((r) => {
          const name = r.Employee || r.employee || r.Name || r.name;
          if (!name) return;
          attendance[dateKey][name] = {
            checkIn: r["Check In"] || r.checkIn || null,
            checkOut: r["Check Out"] || r.checkOut || null,
          };
        });

        saveAttendance(attendance);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });