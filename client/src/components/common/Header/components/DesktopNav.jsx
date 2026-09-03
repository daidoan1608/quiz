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
      className="aura-desktop-nav"
    >
      <span
        className="header-nav-pill"
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
              ? '!text-primary dark:!text-white'
              : 'text-gray-600 dark:text-slate-100 hover:text-primary dark:hover:text-white'
          }`}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
