import { DEFAULT_EMPLOYEES } from "../data/employees";

const EMP_KEY = "employees";
const ATT_KEY = "attendance";

export const getEmployees = () => {
  const raw = localStorage.getItem(EMP_KEY);
  if (!raw) {
    localStorage.setItem(EMP_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EMPLOYEES;
  }
};

export const addEmployee = (name) => {
  const list = getEmployees();
  const trimmed = name.trim();
  if (!trimmed) return list;
  if (list.some((e) => e.toLowerCase() === trimmed.toLowerCase())) return list;
  const updated = [...list, trimmed];
  localStorage.setItem(EMP_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteEmployee = (name) => {
  const updated = getEmployees().filter((e) => e !== name);
  localStorage.setItem(EMP_KEY, JSON.stringify(updated));
  return updated;
};

export const getAttendance = () => {
  try {
    return JSON.parse(localStorage.getItem(ATT_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveAttendance = (data) => {
  localStorage.setItem(ATT_KEY, JSON.stringify(data));
};

export const getTodayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getRecord = (dateKey, employee) => {
  const all = getAttendance();
  return all[dateKey]?.[employee] || { checkIn: null, checkOut: null };
};

export const setRecord = (dateKey, employee, patch) => {
  const all = getAttendance();
  if (!all[dateKey]) all[dateKey] = {};
  all[dateKey][employee] = { ...(all[dateKey][employee] || {}), ...patch };
  saveAttendance(all);
  return all[dateKey][employee];
};