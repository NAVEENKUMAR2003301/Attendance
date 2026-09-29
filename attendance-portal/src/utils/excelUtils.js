import * as XLSX from "xlsx";
import { setRecord } from "./storage";
import { prettyTime } from "./timeUtils";

// Format "2026-09-29" → "29-Sep-2026"
const prettyDate = (dateKey) => {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d}-${months[Number(m) - 1]}-${y}`;
};

export const exportToExcel = (dateKey, employees, attendance) => {
  const dayData = attendance || {};

  const rows = employees.map((empObj) => {
    const emp = empObj.name;
    const rec = dayData[emp] || {};
    return {
      Date: dateKey,
      "Date (Pretty)": prettyDate(dateKey),
      Employee: emp,
      PIN: empObj.pin || "",
      "Check In": prettyTime(rec.checkIn),
      "Check Out": prettyTime(rec.checkOut),
      Status:
        rec.checkIn && rec.checkOut
          ? "Present"
          : rec.checkIn
          ? "Working"
          : "Absent",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, `attendance-${dateKey}.xlsx`);
};

export const exportHistoryBackup = (allAttendance) => {
  const rows = [];
  Object.entries(allAttendance || {}).forEach(([dateKey, dayData]) => {
    Object.entries(dayData || {}).forEach(([emp, rec]) => {
      if (!rec.checkIn && !rec.checkOut) return;
      rows.push({
        Date: dateKey,
        "Date (Pretty)": prettyDate(dateKey),
        Employee: emp,
        "Check In": prettyTime(rec.checkIn),
        "Check Out": prettyTime(rec.checkOut),
        Status:
          rec.checkIn && rec.checkOut
            ? "Present"
            : rec.checkIn
            ? "Working"
            : "Absent",
      });
    });
  });

  rows.sort((a, b) => a.Date.localeCompare(b.Date));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Backup");
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `attendance-backup-${stamp}.xlsx`);
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

          const parseTime = (val) => {
            if (!val) return null;
            const s = String(val).trim();
            const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (match12) {
              let h = Number(match12[1]);
              const m = match12[2];
              const ampm = match12[3].toUpperCase();
              if (ampm === "PM" && h !== 12) h += 12;
              if (ampm === "AM" && h === 12) h = 0;
              return `${String(h).padStart(2, "0")}:${m}`;
            }
            const match24 = s.match(/^(\d{1,2}):(\d{2})/);
            if (match24) {
              return `${String(match24[1]).padStart(2, "0")}:${match24[2]}`;
            }
            return null;
          };

          const rowDate = r.Date || r.date || dateKey;

          await setRecord(rowDate, name, {
            checkIn: parseTime(r["Check In"] || r.checkIn),
            checkOut: parseTime(r["Check Out"] || r.checkOut),
          });
        }
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });