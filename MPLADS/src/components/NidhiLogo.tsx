"use client";

import React from "react";

interface NidhiLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  showText?: boolean;
  className?: string;
  variant?: "full" | "icon";
}

export const NidhiLogoIcon = ({
  size = 32,
  className = "",
  ...props
}: {
  size?: number | string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Main Shield Gradient */}
        <linearGradient id="nidhiShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Gold Accent Gradient */}
        <linearGradient id="nidhiGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Cyan/AI Glow Gradient */}
        <linearGradient id="nidhiAiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Indian Tricolor Subtle Gradient */}
        <linearGradient id="triSaffron" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="triGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#138808" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Drop Shadow */}
        <filter id="nidhiGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Hexagonal Shield Frame */}
      <path
        d="M50 4 L88 20 V48 C88 71.5 71.8 90.2 50 96 C28.2 90.2 12 71.5 12 48 V20 L50 4 Z"
        fill="url(#nidhiShieldGrad)"
        stroke="url(#nidhiGoldGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        filter="url(#nidhiGlow)"
      />

      {/* Inner Shield Border (Gold Outline Detail) */}
      <path
        d="M50 11 L81 24.5 V48 C81 67.5 67.8 83 50 88 C32.2 83 19 67.5 19 48 V24.5 L50 11 Z"
        fill="none"
        stroke="url(#nidhiGoldGrad)"
        strokeWidth="1.2"
        strokeOpacity="0.6"
        strokeDasharray="4 2"
      />

      {/* Tricolor Security Ribbons */}
      {/* Saffron Arc */}
      <path
        d="M26 32 C33 24 67 24 74 32"
        fill="none"
        stroke="url(#triSaffron)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Green Arc */}
      <path
        d="M30 76 C40 82 60 82 70 76"
        fill="none"
        stroke="url(#triGreen)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* AI Network Orbit Lines */}
      <circle cx="50" cy="50" r="26" fill="none" stroke="url(#nidhiAiGrad)" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />

      {/* Central Rupee & Security Key Symbol */}
      <g opacity="0.95">
        {/* Rupee Symbol Lines */}
        {/* Top Horizontal Bar */}
        <line x1="38" y1="37" x2="62" y2="37" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Middle Horizontal Bar */}
        <line x1="38" y1="45" x2="58" y2="45" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        {/* Vertical stem curving to diagonal tail */}
        <path
          d="M44 37 V52 C44 59 58 59 58 52 C58 45 44 45 44 45 L58 66"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* AI Nodes & Eye of Integrity (Sparkles) */}
      <circle cx="50" cy="24" r="3" fill="#F59E0B" />
      <circle cx="76" cy="50" r="3" fill="#06B6D4" />
      <circle cx="24" cy="50" r="3" fill="#10B981" />
      <circle cx="50" cy="76" r="3" fill="#F59E0B" />

      {/* Connecting Circuit Traces */}
      <line x1="50" y1="27" x2="50" y2="33" stroke="#F59E0B" strokeWidth="1.5" />
      <line x1="73" y1="50" x2="66" y2="50" stroke="#06B6D4" strokeWidth="1.5" />
      <line x1="27" y1="50" x2="34" y2="50" stroke="#10B981" strokeWidth="1.5" />
      <line x1="50" y1="73" x2="50" y2="67" stroke="#F59E0B" strokeWidth="1.5" />
    </svg>
  );
};

export default function NidhiLogo({
  size = 36,
  showText = true,
  className = "",
  variant = "full",
  ...props
}: NidhiLogoProps) {
  if (variant === "icon" || !showText) {
    return <NidhiLogoIcon size={size} className={className} {...props} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <NidhiLogoIcon size={size} />
      <div className="flex flex-col text-left">
        <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base leading-tight uppercase">
          NIDHI-RAKSHAK
        </span>
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
          AI Public Fund Monitor
        </span>
      </div>
    </div>
  );
}
