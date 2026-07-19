import React from 'react';
import { swatchColorStyle } from 'utils/styleVariables';
import { createThemeColorOptions } from '../constants/themeColorOptions';

export default function ThemeColorPicker({
  colorTheme,
  itemSizeClass = 'size-7',
  swatchSizeClass = 'size-5',
  selectedTextClass = 'text-[10px]',
  setColorTheme,
  t,
  withTitle = true,
}) {
  return (
    <div className="flex items-center justify-between gap-1 mt-1">
      {createThemeColorOptions(t).map((themeOpt) => (
        <button
          key={themeOpt.name}
          onClick={() => setColorTheme(themeOpt.name)}
          title={withTitle ? themeOpt.label : undefined}
          className={`relative flex ${itemSizeClass} items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
            colorTheme === themeOpt.name
              ? 'border-gray-900 dark:border-white scale-105'
              : 'border-transparent'
          }`}
          type="button"
        >
          <span
            className={`aura-theme-swatch ${swatchSizeClass} rounded-full shadow-inner`}
            style={swatchColorStyle(themeOpt.color)}
          />
          {colorTheme === themeOpt.name && (
            <span className={`absolute text-white ${selectedTextClass} font-black leading-none`}>
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
