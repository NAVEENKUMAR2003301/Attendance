import { ref, get, set, update, onValue } from "firebase/database";
import { db } from "../firebase";
import { DEFAULT_EMPLOYEES } from "../data/employees";

// ============ DEFAULT CONFIG ============
export const DEFAULT_CONFIG = {
  checkInStart: "09:15",
  checkInEnd: "09:45",
  checkOutStart: "18:15",
  checkOutEnd: "18:45",
};

// ============ CLEANUP ============
export const RETENTION_DAYS = 90;

export const dateKeyDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getExpiredDateKeys = async () => {
  const snap = await get(ref(db, "attendance"));
  const val = snap.val() || {};
  const cutoff = dateKeyDaysAgo(RETENTION_DAYS);
  return Object.keys(val).filter((k) => k < cutoff);
};

export const deleteAttendanceDate = async (dateKey) => {
  await set(ref(db, `attendance/${dateKey}`), null);
  console.log("🗑 Deleted attendance for", dateKey);
};

export const cleanupOldAttendance = async () => {
  const expired = await getExpiredDateKeys();
  if (expired.length === 0) {
    console.log("✅ No expired records to clean");
    return { deleted: 0, dates: [] };
  }
  for (const dateKey of expired) {
    await deleteAttendanceDate(dateKey);
  }
  console.log(`✅ Cleaned ${expired.length} old dates`);
  return { deleted: expired.length, dates: expired };
};

export const previewOldAttendance = async () => getExpiredDateKeys();

export const getAllAttendance = async () => {
  const snap = await get(ref(db, "attendance"));
  return snap.val() || {};
};

// ============ CONFIG ============
export const seedConfigIfEmpty = async () => {
  const snap = await get(ref(db, "config"));
  if (!snap.exists()) {
    await set(ref(db, "config"), DEFAULT_CONFIG);
    console.log("✅ Seeded default config");
  }
};

export const subscribeConfig = (callback) => {
  const r = ref(db, "config");
  return onValue(
    r,
    (snap) => {
      const val = snap.val();
      callback(val ? { ...DEFAULT_CONFIG, ...val } : DEFAULT_CONFIG);
    },
    (err) => {
      console.error("❌ subscribeConfig error:", err);
      callback(DEFAULT_CONFIG);
    }
  );
};

export const getConfig = async () => {
  const snap = await get(ref(db, "config"));
  const val = snap.val();
  return val ? { ...DEFAULT_CONFIG, ...val } : DEFAULT_CONFIG;
};

export const saveConfig = async (config) => {
  await set(ref(db, "config"), config);
  console.log("✅ Config saved:", config);
};

// ============ EMPLOYEES ============
export const seedEmployeesIfEmpty = async () => {
  const snap = await get(ref(db, "employees"));
  if (snap.exists()) return;
  const payload = {};
  DEFAULT_EMPLOYEES.forEach((emp, idx) => {
    const id = String(Date.now() + idx);
    payload[id] = { name: emp.name, empId: emp.empId };
  });
  await set(ref(db, "employees"), payload);
  console.log("✅ Seeded", DEFAULT_EMPLOYEES.length, "employees");
};

export const subscribeEmployees = (callback) => {
  const r = ref(db, "employees");
  return onValue(
    r,
    (snap) => {
      const val = snap.val();
      if (!val) return callback([]);
      const arr = Object.entries(val).map(([id, data]) => ({
        id,
        name: data.name,
        empId: data.empId, // replaces "pin"
      }));
      callback(arr);
    },
    (err) => {
      console.error("❌ subscribeEmployees:", err);
      callback([]);
    }
  );
};

export const getEmployeeNames = async () => {
  const snap = await get(ref(db, "employees"));
  const val = snap.val();
  return val ? Object.values(val).map((e) => e.name) : [];
};

export const addEmployee = async (name, empId) => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const snap = await get(ref(db, "employees"));
  const val = snap.val() || {};
  const exists = Object.values(val).some(
    (e) => e.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return;

  const nextId = empId?.trim() || generateNextEmpId(val);

  const id = String(Date.now());
  await set(ref(db, `employees/${id}`), {
    name: trimmed,
    empId: nextId,
  });
};

// Get next sequential Employee ID like EMP1021
// Get next sequential Employee ID like "1021"
export const generateNextEmpId = (existingVal) => {
  let max = 1000;
  Object.values(existingVal || {}).forEach((e) => {
    if (e.empId && /^\d+$/.test(e.empId)) {
      const n = parseInt(e.empId, 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  return String(max + 1);
};

export const deleteEmployee = async (id) => {
  await set(ref(db, `employees/${id}`), null);
};

export const updateEmployeeEmpId = async (id, newEmpId) => {
  await update(ref(db, `employees/${id}`), { empId: newEmpId });
};

export const verifyEmpId = async (name, enteredDigits) => {
  const snap = await get(ref(db, "employees"));
  const val = snap.val() || {};
  return Object.values(val).some((e) => {
    if (e.name !== name) return false;
    if (!e.empId) return false;
    const last4 = String(e.empId).slice(-4);
    return last4 === String(enteredDigits);
  });
};

export const generatePin = () =>
  String(Math.floor(1000 + Math.random() * 9000));

// ============ ATTENDANCE ============
export const getTodayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const setRecord = async (dateKey, employee, patch) => {
  await update(ref(db, `attendance/${dateKey}/${employee}`), patch);
  console.log("✅ Attendance updated:", dateKey, employee, patch);
};

export const subscribeAttendance = (dateKey, callback) => {
  const r = ref(db, `attendance/${dateKey}`);
  return onValue(
    r,
    (snap) => callback(snap.val() || {}),
    (err) => {
      console.error("❌ subscribeAttendance:", err);
      callback({});
    }
  );
};

export const getRecord = async (dateKey, employee) => {
  const snap = await get(ref(db, `attendance/${dateKey}/${employee}`));
  return snap.val() || { checkIn: null, checkOut: null };
};

// Subscribe to ALL attendance history (for range export)
export const subscribeAllAttendance = (callback) => {
  const r = ref(db, "attendance");
  return onValue(
    r,
    (snap) => callback(snap.val() || {}),
    (err) => {
      console.error("❌ subscribeAllAttendance:", err);
      callback({});
    }
  );
};


// ============ EMPLOYEE REPORT ============

// Returns array of { date, checkIn, checkOut, hours, status } for a range
export const getEmployeeReport = (allAttendance, employeeName, fromDate, toDate) => {
  const rows = [];

  Object.entries(allAttendance || {}).forEach(([dateKey, dayData]) => {
    if (dateKey < fromDate || dateKey > toDate) return;
    const rec = dayData?.[employeeName];
    if (!rec) return;

    const hours = computeHours(rec.checkIn, rec.checkOut);
    rows.push({
      date: dateKey,
      checkIn: rec.checkIn,
      checkOut: rec.checkOut,
      hours,
      status:
        rec.checkIn && rec.checkOut
          ? "Present"
          : rec.checkIn
          ? "Working"
          : "Absent",
    });
  });

  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
};

// Compute hours between two "HH:MM" strings
export const computeHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (mins <= 0) return 0;
  return +(mins / 60).toFixed(2);
};

// Date range helpers
export const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
};

export const getMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
};

export const getLast30DaysRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
};