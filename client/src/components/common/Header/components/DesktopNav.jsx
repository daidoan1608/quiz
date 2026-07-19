import React from 'react';
import { headerNavPillStyle } from 'utils/styleVariables';

export default function DesktopNav({
  activePill,
  isActive,
  navItemRefs,
  navItems,
  navRef,
  navigate,
}) {
  return (
    <nav
      ref={navRef}
      className="relative hidden md:flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-gradient-to-r from-white/80 via-blue-50/70 to-indigo-50/70 p-1.5 shadow-lg shadow-blue-900/5 ring-1 ring-white/80 backdrop-blur-md dark:border-blue-300/35 dark:from-slate-800/95 dark:via-blue-950/70 dark:to-indigo-950/70 dark:shadow-black/30 dark:ring-blue-200/15"
    >
      <span
        className="header-nav-pill pointer-events-none absolute top-1.5 h-[calc(100%-12px)] overflow-hidden rounded-full border border-white/80 bg-white/48 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_-10px_18px_rgba(37,99,235,0.10),0_10px_24px_rgba(37,99,235,0.16)] ring-1 ring-blue-400/25 backdrop-blur-md transition-all duration-300 ease-out dark:border-blue-200/35 dark:bg-blue-400/22 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.20),inset_0_-10px_18px_rgba(96,165,250,0.14),0_10px_24px_rgba(37,99,235,0.22)] dark:ring-blue-200/35"
        style={headerNavPillStyle(activePill)}
      />
      {navItems.map((item) => (
        <a
          key={item.link}
          ref={(node) => {
            navItemRefs.current[item.link] = node;
          }}
          href={item.link}
          onClick={(event) => {
            event.preventDefault();
            navigate(item.link);
          }}
          className={`relative z-10 inline-flex w-32 justify-center !no-underline px-6 py-2.5 text-base font-bold rounded-full transition-colors duration-300 ${
            isActive(item.link)
              ? '!text-blue-700 dark:!text-white'
              : 'text-gray-600 dark:text-slate-100 hover:text-blue-600 dark:hover:text-white'
          }`}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
