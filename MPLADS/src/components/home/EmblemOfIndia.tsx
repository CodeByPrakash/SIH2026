"use client";

import React from "react";
import Image from "next/image";

export function EmblemOfIndia({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
  fill?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size * 1.55 }}
    >
      <Image
        src="/home/emblem.webp"
        alt="National Emblem of India"
        width={size * 2}
        height={Math.round(size * 3.1)}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
