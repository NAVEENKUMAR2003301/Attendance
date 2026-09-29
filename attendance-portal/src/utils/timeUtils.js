// Convert "HH:MM" → minutes since midnight
export const toMinutes = (hhmm) => {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const nowInMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export const isWithin = (now, start, end) =>
  now >= toMinutes(start) && now <= toMinutes(end);

export const isCheckInWindow = (config) =>
  isWithin(nowInMinutes(), config.checkInStart, config.checkInEnd);

export const isCheckOutWindow = (config) =>
  isWithin(nowInMinutes(), config.checkOutStart, config.checkOutEnd);

export const formatTime = (date = new Date()) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

export const prettyTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const prettyWindow = (start, end) =>
  `${prettyTime(start)} – ${prettyTime(end)}`;