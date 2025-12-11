import React from "react";

type HeaderProps = {
  glowColor: string;
  onUserIconClick: () => void;
  user: { name: string; role: string } | null;
};

export default function Header({
  glowColor,
  onUserIconClick,
  user,
}: HeaderProps) {
  return (
    <header
      className="relative flex items-center justify-between px-4 py-3 sm:px-8 w-full overflow-visible"
      style={{
        background:
          "linear-gradient(to bottom, rgba(20,30,40,0.8) 0%, rgba(20,30,40,0) 100%)",
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
        backdropFilter: "blur(1px)",
        zIndex: 10,
        minHeight: "64px",
      }}
    >
      {/* Floating User Icon with Dynamic Glow */}
      <div className="flex flex-col items-center z-20">
        <div className="relative">
          <button
            type="button"
            onClick={onUserIconClick}
            className="focus:outline-none"
            aria-label="User menu"
            style={{ cursor: "pointer" }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: `drop-shadow(0 0 12px ${glowColor})`,
                transition: "filter 0.3s",
              }}
              aria-label="User"
            >
              <circle cx="12" cy="8" r="4" stroke={glowColor} strokeWidth="1.2" />
              <path
                d="M4 20c0-3.333 2.667-6 8-6s8 2.667 8 6"
                stroke={glowColor}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Title with Slim Font and Glow */}
      <h1 className="font-light text-lg sm:text-xl text-cyan-100 z-20 drop-shadow-[0_2px_12px_#00fff7] animate-title tracking-tight">
        Dobrix Rechner
      </h1>
      {/* Spacer to keep layout balanced */}
      <div className="w-8"></div>
    </header>
  );
}