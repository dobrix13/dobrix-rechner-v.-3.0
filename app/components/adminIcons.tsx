import React from "react";

export function OrganizationIcon({ className = "" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={className} aria-label="Organization">
      <rect x="3" y="8" width="18" height="10" rx="2" stroke="#fff" strokeWidth="1.5" />
      <rect x="7" y="4" width="10" height="4" rx="1" stroke="#fff" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="2" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function RestaurantIcon({ className = "" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={className} aria-label="Restaurant">
      {/* Table */}
      <rect x="7" y="11" width="10" height="3" rx="1" stroke="#fff" strokeWidth="1.5" fill="none" />
      {/* Left chair */}
      <rect x="3.5" y="13.5" width="3" height="6" rx="0.7" stroke="#fff" strokeWidth="1.2" fill="none" />
      {/* Right chair */}
      <rect x="17.5" y="13.5" width="3" height="6" rx="0.7" stroke="#fff" strokeWidth="1.2" fill="none" />
      {/* Table legs */}
      <rect x="9" y="14" width="1" height="4" rx="0.3" stroke="#fff" strokeWidth="1" fill="none" />
      <rect x="14" y="14" width="1" height="4" rx="0.3" stroke="#fff" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function UserIcon({ className = "" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={className} aria-label="User">
      <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.5" />
      <path d="M4 20c0-3.333 2.667-6 8-6s8 2.667 8 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AbrechnungIcon({ className = "" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={className} aria-label="Abrechnung">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="#fff" strokeWidth="1.5" />
      <path d="M9 12h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 15h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
