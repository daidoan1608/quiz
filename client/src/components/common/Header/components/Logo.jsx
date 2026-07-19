import React from 'react';
import LogoMark from './LogoMark';

export default function Logo({ onClick }) {
  return (
    <button
      className="flex items-center cursor-pointer"
      onClick={onClick}
      type="button"
    >
      <LogoMark />
    </button>
  );
}
