import React from "react";

export default function AppearanceModeToggle({ isDarkMode, setMode, t, lightClassName, darkClassName }) {
  return (
    <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg">
      <button
        onClick={() => setMode("light")}
        className={lightClassName}
      >
        {t("theme.light")}
      </button>
      <button
        onClick={() => setMode("dark")}
        className={darkClassName}
      >
        {t("theme.dark")}
      </button>
    </div>
  );
}
