import React from 'react';

export default function LogoMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="35 18 130 88"
      className="h-20 md:h-24 w-auto"
      role="img"
      aria-label="QuizVNUA Logo"
    >
      <defs>
        <linearGradient
          id="logoLightGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--aura-primary-hover, #00f2fe)" />
          <stop offset="100%" stopColor="var(--aura-primary, #0072ff)" />
        </linearGradient>
        <linearGradient id="logoDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--aura-primary, #7209b7)" />
          <stop offset="100%" stopColor="var(--aura-primary-hover, #111827)" />
        </linearGradient>
        <linearGradient
          id="logoTechGrad"
          x1="120"
          y1="0"
          x2="220"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--aura-primary, #00c6ff)" />
          <stop offset="100%" stopColor="var(--aura-primary-hover, #7209b7)" />
        </linearGradient>
      </defs>

      <g transform="translate(21, 7)">
        <path
          d="M 79 54 A 22 22 0 1 0 76 81 L 84 90 L 99 78"
          fill="none"
          stroke="url(#logoTechGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
        <g transform="rotate(-10, 60, 65)">
          <polygon
            points="48,41 48,47 60,51 60,41"
            fill="url(#logoDarkGrad)"
            stroke="url(#logoDarkGrad)"
            strokeWidth="0.8"
            strokeLinejoin="miter"
          />
          <polygon
            points="60,41 60,51 72,47 72,41"
            fill="url(#logoLightGrad)"
            stroke="url(#logoLightGrad)"
            strokeWidth="0.8"
            strokeLinejoin="miter"
          />
          <polygon
            points="60,22 36,34 60,34"
            fill="url(#logoDarkGrad)"
            opacity="0.75"
            stroke="url(#logoDarkGrad)"
            strokeWidth="0.5"
            strokeLinejoin="miter"
          />
          <polygon
            points="36,34 60,46 60,34"
            fill="url(#logoDarkGrad)"
            opacity="0.88"
            stroke="url(#logoDarkGrad)"
            strokeWidth="0.5"
            strokeLinejoin="miter"
          />
          <polygon
            points="60,46 84,34 60,34"
            fill="url(#logoLightGrad)"
            opacity="0.95"
            stroke="url(#logoLightGrad)"
            strokeWidth="0.5"
            strokeLinejoin="miter"
          />
          <polygon
            points="84,34 60,22 60,34"
            fill="url(#logoLightGrad)"
            opacity="0.85"
            stroke="url(#logoLightGrad)"
            strokeWidth="0.5"
            strokeLinejoin="miter"
          />
          <path
            d="M 36 34 L 28 48 L 28 60"
            fill="none"
            stroke="url(#logoDarkGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
          <circle cx="28" cy="60" r="2.5" fill="url(#logoDarkGrad)" />
        </g>
        <text
          x="81"
          y="73"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize="21"
          fontWeight="500"
          letterSpacing="-0.03em"
          fill="var(--aura-text, currentColor)"
        >
          uiz
        </text>
        <text
          x="101"
          y="88"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="600"
          letterSpacing="-0.03em"
          fill="url(#logoTechGrad)"
        >
          NUA
        </text>
      </g>
    </svg>
  );
}
