import React from 'react';
import AppearanceModeToggle from './AppearanceModeToggle';
import ThemeColorPicker from './ThemeColorPicker';

export default function AppearancePanel({
  colorTheme,
  isDarkMode,
  mobile = false,
  setColorTheme,
  setMode,
  t,
}) {
  return (
    <div
      className={
        mobile
          ? 'flex flex-col gap-3 rounded-xl px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-gray-700/50 mx-4 my-2'
          : 'flex flex-col gap-3 rounded-lg px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 my-1'
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-lg">
            {isDarkMode ? 'dark_mode' : 'light_mode'}
          </span>
          <p
            className={
              mobile
                ? 'text-base font-medium text-gray-800 dark:text-gray-200'
                : 'text-sm font-semibold text-gray-700 dark:text-gray-300'
            }
          >
            {t('theme.appearance')}
          </p>
        </div>
        <AppearanceModeToggle isDarkMode={isDarkMode} setMode={setMode} t={t} />
      </div>

      <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 my-1" />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t('theme.primaryColor')}
        </p>
        <ThemeColorPicker
          colorTheme={colorTheme}
          itemSizeClass={mobile ? 'size-8' : 'size-7'}
          selectedTextClass={mobile ? 'text-xs' : 'text-[10px]'}
          setColorTheme={setColorTheme}
          swatchSizeClass={mobile ? 'size-6' : 'size-5'}
          t={t}
          withTitle={!mobile}
        />
      </div>
    </div>
  );
}
