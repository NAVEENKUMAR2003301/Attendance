import React from "react";

export default function WaterBackground({ children }) {
  const bubbles = Array.from({ length: 14 }).map((_, i) => {
    const size = 20 + Math.random() * 60;
    const left = Math.random() * 100;
    const delay = Math.random() * 6;
    const duration = 6 + Math.random() * 6;
    return { size, left, delay, duration, key: i };
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-sky-100 via-cyan-100 to-blue-200">
      <div className="pointer-events-none absolute inset-0 z-0">
        {bubbles.map((b) => (
          <span
            key={b.key}
            className="absolute rounded-full bg-white/40 backdrop-blur-sm border border-white/50"
            style={{
              width: b.size,
              height: b.size,
              left: `${b.left}%`,
              bottom: "-100px",
              animation: `float ${b.duration}s ease-in-out ${b.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">{children}</div>

      <div className="pointer-events-none absolute bottom-0 left-0 w-full z-0">
        <svg viewBox="0 0 1440 200" className="w-full h-32 md:h-40">
          <path
            fill="#0891b2"
            fillOpacity="0.4"
            d="M0,100 C240,160 480,40 720,90 C960,140 1200,60 1440,110 L1440,200 L0,200 Z"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0,100 C240,160 480,40 720,90 C960,140 1200,60 1440,110 L1440,200 L0,200 Z;
                M0,120 C240,60 480,140 720,80 C960,20 1200,120 1440,80 L1440,200 L0,200 Z;
                M0,100 C240,160 480,40 720,90 C960,140 1200,60 1440,110 L1440,200 L0,200 Z
              "
            />
          </path>
          <path
            fill="#0e7490"
            fillOpacity="0.5"
            d="M0,140 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,200 L0,200 Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,140 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,200 L0,200 Z;
                M0,120 C240,160 480,80 720,140 C960,180 1200,80 1440,140 L1440,200 L0,200 Z;
                M0,140 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,200 L0,200 Z
              "
            />
          </path>
        </svg>
      </div>
    </div>
  );
}