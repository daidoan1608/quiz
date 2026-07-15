import React from "react";

export default function AppearanceModeToggle({ isDarkMode, setMode, t }) {
  const nextMode = isDarkMode ? "light" : "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDarkMode}
      aria-label={t("theme.appearance")}
      title={isDarkMode ? t("theme.dark") : t("theme.light")}
      onClick={() => setMode(nextMode)}
      className={`relative flex h-8 w-16 items-center rounded-full border p-1 transition-all duration-300 ${
        isDarkMode
          ? "border-indigo-400/50 bg-indigo-500/20"
          : "border-amber-300/70 bg-amber-100"
      }`}
    >
      <span
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-300 ${
          isDarkMode ? "translate-x-8 text-indigo-600" : "translate-x-0 text-amber-500"
        }`}
      >
        <span className="material-symbols-outlined text-[15px]">
          {isDarkMode ? "dark_mode" : "light_mode"}
        </span>
      </span>
    </button>
  );
}
