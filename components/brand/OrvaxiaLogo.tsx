import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  vertical?: boolean;
}

export function OrvaxiaLogo({
  className = '',
  size = 40,
  showText = true,
  textColor = 'text-brand-navy',
  vertical = false,
}: LogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        vertical ? 'flex-col text-center' : 'flex-row'
      } ${className}`}
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Bru slate to lavender */}
            <linearGradient id="leafGrad1" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#606C8D" />
              <stop offset="100%" stopColor="#A99AB3" />
            </linearGradient>
            {/* Lavender to dusty peach */}
            <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A99AB3" />
              <stop offset="100%" stopColor="#D0A9A0" />
            </linearGradient>
            {/* Pastel yellow to bru slate accent */}
            <linearGradient id="leafGrad3" x1="100%" y1="80%" x2="0%" y2="20%">
              <stop offset="0%" stopColor="#D0A9A0" />
              <stop offset="100%" stopColor="#606C8D" />
            </linearGradient>
          </defs>

          {/* Dynamic flowing spiral loops representing Orbis & Axiom */}
          <path
            d="M60 12 C78 12, 104 35, 96 66 C88 95, 60 108, 44 95 C32 85, 34 68, 48 58 C62 48, 80 56, 78 72"
            stroke="url(#leafGrad1)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M60 108 C42 108, 16 85, 24 54 C32 25, 60 12, 76 25 C88 35, 86 52, 72 62 C58 72, 40 64, 42 48"
            stroke="url(#leafGrad2)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Center 4-point inspiration star (Pastel Yellow / Hope & Truth) */}
          <path
            d="M60 46 C60 55, 55 60, 46 60 C55 60, 60 65, 60 74 C60 65, 65 60, 74 60 C65 60, 60 55, 60 46 Z"
            fill="#FDF5AE"
            stroke="#D0A9A0"
            strokeWidth="1"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-serif tracking-[0.22em] font-bold text-lg md:text-xl leading-none ${textColor}`}
          >
            ORVAXIA
          </span>
          <span className="text-[10px] tracking-[0.38em] uppercase text-brand-slate font-medium mt-1">
            COMPANY
          </span>
        </div>
      )}
    </div>
  );
}
