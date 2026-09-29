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
    payload[id] = { name: emp.name, pin: emp.pin };
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
        pin: data.pin,
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

export const addEmployee = async (name, pin) => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const snap = await get(ref(db, "employees"));
  const val = snap.val() || {};
  const exists = Object.values(val).some(
    (e) => e.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return;
  const id = String(Date.now());
  await set(ref(db, `employees/${id}`), {
    name: trimmed,
    pin: pin || generatePin(),
  });
};

export const deleteEmployee = async (id) => {
  await set(ref(db, `employees/${id}`), null);
};

export const updateEmployeePin = async (id, newPin) => {
  await update(ref(db, `employees/${id}`), { pin: newPin });
};

export const verifyPin = async (name, pin) => {
  const snap = await get(ref(db, "employees"));
  const val = snap.val() || {};
  return Object.values(val).some(
    (e) => e.name === name && String(e.pin) === String(pin)
  );
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