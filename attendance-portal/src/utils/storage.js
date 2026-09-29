import { ref, get, set, update, onValue } from "firebase/database";
import { db } from "../firebase";
import { DEFAULT_EMPLOYEES } from "../data/employees";

// ============ EMPLOYEES ============

export const seedEmployeesIfEmpty = async () => {
  const snap = await get(ref(db, "employees"));
  if (snap.exists()) {
    console.log("✅ Employees already exist in Firebase");
    return;
  }
  console.log("🌱 Seeding employees to Firebase...");
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
      if (!val) {
        console.log("⚠️ No employees in Firebase yet");
        callback([]);
        return;
      }
      // Convert object → array with id
      const arr = Object.entries(val).map(([id, data]) => ({
        id,
        name: data.name,
        pin: data.pin,
      }));
      console.log("📋 Employees loaded:", arr.length);
      callback(arr);
    },
    (err) => {
      console.error("❌ subscribeEmployees error:", err);
      callback([]);
    }
  );
};

export const getEmployeeNames = async () => {
  const snap = await get(ref(db, "employees"));
  const val = snap.val();
  if (!val) return [];
  return Object.values(val).map((e) => e.name);
};

export const addEmployee = async (name, pin) => {
  const trimmed = name.trim();
  if (!trimmed) return;

  const snap = await get(ref(db, "employees"));
  const val = snap.val() || {};
  const exists = Object.values(val).some(
    (e) => e.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    console.log("⚠️ Employee already exists:", trimmed);
    return;
  }

  const id = String(Date.now());
  const newPin = pin || generatePin();
  await set(ref(db, `employees/${id}`), { name: trimmed, pin: newPin });
  console.log("✅ Added employee:", trimmed, "PIN:", newPin);
};

export const deleteEmployee = async (id) => {
  await set(ref(db, `employees/${id}`), null);
  console.log("🗑 Deleted employee:", id);
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
      console.error("❌ subscribeAttendance error:", err);
      callback({});
    }
  );
};

export const getRecord = async (dateKey, employee) => {
  const snap = await get(ref(db, `attendance/${dateKey}/${employee}`));
  return snap.val() || { checkIn: null, checkOut: null };
};