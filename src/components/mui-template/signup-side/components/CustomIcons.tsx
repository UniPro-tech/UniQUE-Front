import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

export function SitemarkIcon() {
  return (
    <SvgIcon sx={{ height: 28, width: 120, mr: 2 }}>
      <svg
        width={120}
        height={28}
        viewBox="0 0 120 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle mark */}
        <circle cx="20" cy="14" r="12" fill="#00D3AB" />
        {/* Stylized 'y' mark inside circle */}
        <path
          d="M14 11 L18 16 L22 9"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wordmark: yomunity (simplified rectangles to avoid font embedding) */}
        <g transform="translate(42,6)">
          <rect x="0" y="0" width="6" height="16" rx="1" fill="#4876EE" />
          <rect x="10" y="0" width="22" height="6" rx="1" fill="#4876EE" />
          <rect x="10" y="10" width="22" height="6" rx="1" fill="#4876EE" />
          <rect x="36" y="0" width="6" height="16" rx="1" fill="#4876EE" />
          <rect x="44" y="0" width="6" height="16" rx="1" fill="#4876EE" />
        </g>
      </svg>
    </SvgIcon>
  );
}

export function GoogleIcon() {
  return (
    <SvgIcon>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.1164 10.64 11.5491 11.4836 10.6982 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z"
          fill="#4285F4"
        />
        <path
          d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.6982 12.0509C9.98545 12.5309 9.07636 12.8218 8 12.8218C5.92 12.8218 4.15273 11.4182 3.52 9.52727H0.858182V11.5927C2.17455 14.2036 4.87273 16 8 16Z"
          fill="#34A853"
        />
        <path
          d="M3.52 9.52C3.36 9.04 3.26545 8.53091 3.26545 8C3.26545 7.46909 3.36 6.96 3.52 6.48V4.41455H0.858182C0.312727 5.49091 0 6.70545 0 8C0 9.29455 0.312727 10.5091 0.858182 11.5855L2.93091 9.97091L3.52 9.52Z"
          fill="#FBBC05"
        />
        <path
          d="M8 3.18545C9.17818 3.18545 10.2255 3.59273 11.0618 4.37818L13.3527 2.08727C11.9636 0.792727 10.16 0 8 0C4.87273 0 2.17455 1.79636 0.858182 4.41455L3.52 6.48C4.15273 4.58909 5.92 3.18545 8 3.18545Z"
          fill="#EA4335"
        />
      </svg>
    </SvgIcon>
  );
}
