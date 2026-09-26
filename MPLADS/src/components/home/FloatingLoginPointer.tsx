"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FloatingLoginPointerProps {
  language?: "en" | "hi";
}

export function FloatingLoginPointer({ language = "en" }: FloatingLoginPointerProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isScrolled) return null;

  return (
    <div
      onClick={() => router.push("/login")}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 select-none cursor-pointer group flex flex-col items-center pointer-events-auto"
      style={{
        animation: "canvaFloat 2.6s ease-in-out infinite",
      }}
      title="Click here to login"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@700&display=swap');

        @keyframes canvaFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-1.5deg);
          }
          50% {
            transform: translateY(-5px) rotate(1deg);
          }
        }

        .canva-font {
          font-family: 'Caveat', 'Kalam', cursive, sans-serif;
        }
      `}</style>

      {/* Hand-drawn Canva-style curved arrow pointing up at the button */}
      <div className="flex justify-center -mb-0.5">
        <svg
          width="34"
          height="32"
          viewBox="0 0 38 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-amber-500 group-hover:text-[#133E87] transition-colors drop-shadow-xs"
        >
          {/* Curved hand-drawn shaft */}
          <path
            d="M 12 33 C 20 28, 24 18, 19 6"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrowhead */}
          <path
            d="M 10 13 C 14 9, 17 7, 19 5 C 23 8, 27 12, 29 15"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Hand-drawn text "Click here" only */}
      <div className="flex flex-col items-center">
        <span className="canva-font text-[26px] font-bold text-[#133E87] group-hover:text-amber-600 transition-colors leading-none tracking-wide whitespace-nowrap drop-shadow-2xs">
          {language === "hi" ? "यहाँ क्लिक करें" : "Click here"}
        </span>

        {/* Hand-drawn wavy underline */}
        <svg
          width="82"
          height="10"
          viewBox="0 0 90 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-amber-500/90 group-hover:text-[#133E87] transition-colors -mt-0.5"
        >
          <path
            d="M 3 7 C 22 2, 52 11, 87 5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
