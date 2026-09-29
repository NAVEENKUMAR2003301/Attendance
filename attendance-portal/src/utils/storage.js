import { ref, get, set, update, onValue, child } from "firebase/database";
import { db } from "../firebase";
import { DEFAULT_EMPLOYEES } from "../data/employees";

// ---------- EMPLOYEES ----------

export const seedEmployeesIfEmpty = async () => {
  const snap = await get(ref(db, "employees"));
  if (!snap.exists()) {
    await set(ref(db, "employees"), DEFAULT_EMPLOYEES);
  }
};

export const subscribeEmployees = (callback) => {
  const r = ref(db, "employees");
  return onValue(r, (snap) => {
    const val = snap.val();
    callback(val ? Object.values(val) : []);
  });
};

export const getEmployeeNames = async () => {
  const snap = await get(ref(db, "employees"));
  const val = snap.val();
  return val ? Object.values(val).map((e) => e.name) : [];
};

export const addEmployee = async (name, pin) => {
  const list = await getEmployeeNames();
  if (list.some((n) => n.toLowerCase() === name.toLowerCase())) return;
  const newPin = pin || generatePin();
  const id = Date.now().toString();
  await set(ref(db, `employees/${id}`), { name, pin: newPin });
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
  return Object.values(val).some((e) => e.name === name && e.pin === pin);
};

export const generatePin = () =>
  String(Math.floor(1000 + Math.random() * 9000));

// ---------- ATTENDANCE ----------

export const getTodayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const setRecord = async (dateKey, employee, patch) => {
  await update(ref(db, `attendance/${dateKey}/${employee}`), patch);
};

export const subscribeAttendance = (dateKey, callback) => {
  const r = ref(db, `attendance/${dateKey}`);
  return onValue(r, (snap) => {
    callback(snap.val() || {});
  });
};

export const getRecord = async (dateKey, employee) => {
  const snap = await get(ref(db, `attendance/${dateKey}/${employee}`));
  return snap.val() || { checkIn: null, checkOut: null };
};