// Check-in window: 09:15 – 09:45
// Check-out window: 18:15 – 18:45
export const CHECK_IN_START = 9 * 60 + 15;   // 555
export const CHECK_IN_END = 9 * 60 + 45;     // 585
export const CHECK_OUT_START = 18 * 60 + 15; // 1095
export const CHECK_OUT_END = 18 * 60 + 45;   // 1125

export const nowInMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export const isCheckInWindow = () => {
  const m = nowInMinutes();
  return m >= CHECK_IN_START && m <= CHECK_IN_END;
};

export const isCheckOutWindow = () => {
  const m = nowInMinutes();
  return m >= CHECK_OUT_START && m <= CHECK_OUT_END;
};

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