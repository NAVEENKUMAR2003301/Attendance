import * as XLSX from "xlsx";
import { setRecord } from "./storage";

export const exportToExcel = (dateKey, employees, attendance) => {
  const dayData = attendance || {};
  const rows = employees.map((empObj) => {
    const emp = empObj.name;
    const rec = dayData[emp] || {};
    return {
      Employee: emp,
      PIN: empObj.pin || "",
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
    reader.onload = async (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        for (const r of rows) {
          const name = r.Employee || r.employee || r.Name || r.name;
          if (!name) continue;
          await setRecord(dateKey, name, {
            checkIn: r["Check In"] || r.checkIn || null,
            checkOut: r["Check Out"] || r.checkOut || null,
          });
        }
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });