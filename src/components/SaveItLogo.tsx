import React from "react";

interface SaveItLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: "light" | "dark" | "white";
}

export default function SaveItLogo({
  className = "w-8 h-8",
  showText = false,
  textClassName = "text-xl font-bold font-sans",
  variant = "dark",
}: SaveItLogoProps) {
  // Hex colors matching the user picture (dark charcoal navy and rich purple)
  const navyColor = variant === "white" ? "#ffffff" : "#1d243d";
  const purpleColor = variant === "white" ? "#ffffff" : "#5c2cc5";
  const textNavyClass = variant === "white" ? "text-white" : "text-[#1d243d]";
  const textPurpleClass = variant === "white" ? "text-white/90" : "text-[#5c2cc5]";

  return (
    <div className="flex items-center gap-2 select-none shrink-0" id="saveit-logo-container">
      {/* S SVG Monogram Logo Design - rotationally symmetric */}
      <svg
        id="saveit-logo-svg-element"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        referrerPolicy="no-referrer"
        style={{
          marginRight: "-7px",
          marginBottom: "-1px",
          marginTop: "-3px",
          marginLeft: "2px",
          paddingBottom: "-3px",
          paddingTop: "-8px",
          paddingRight: "-6px",
          paddingLeft: "-3px",
        }}
      >
        {/* Top Half of the Symmetric S Monogram */}
        <path
          d="M 80,104 C 52,104 36,88 36,61 C 36,34 56,18 96,18 L 134,18 L 116,43 C 116,43 108,34 94,34 C 80,34 70,44 70,59 C 70,74 82,82 100,90 Z"
          fill={navyColor}
        />
        {/* Bottom Half of the Symmetric S Monogram (rotated mathematically 180 degrees about the center point [100, 100]) */}
        <path
          d="M 80,104 C 52,104 36,88 36,61 C 36,34 56,18 96,18 L 134,18 L 116,43 C 116,43 108,34 94,34 C 80,34 70,44 70,59 C 70,74 82,82 100,90 Z"
          fill={purpleColor}
          transform="rotate(180 100 100)"
        />
      </svg>

      {showText && (
        <div className={`flex items-baseline tracking-tight ${textClassName}`} id="saveit-text-wrapper">
          <span className={`${textNavyClass} font-extrabold`} id="saveit-logo-text-save">save</span>
          <span className={`${textPurpleClass} font-extrabold`} id="saveit-logo-text-it">it</span>
        </div>
      )}
    </div>
  );
}
