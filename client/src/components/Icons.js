import React from 'react';

// Professional SVG Icons Component
export const PersonalizedIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient1)"/>
    <defs>
      <linearGradient id="gradient1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <path d="M32 20C28.6863 20 26 22.6863 26 26C26 29.3137 28.6863 32 32 32C35.3137 32 38 29.3137 38 26C38 22.6863 35.3137 20 32 20Z" fill="white" opacity="0.9"/>
    <path d="M20 44C20 38.4772 24.4772 34 30 34H34C39.5228 34 44 38.4772 44 44V46C44 47.1046 43.1046 48 42 48H22C20.8954 48 20 47.1046 20 46V44Z" fill="white" opacity="0.9"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.3"/>
    <path d="M32 14L36 22L32 26L28 22L32 14Z" fill="white" opacity="0.7"/>
  </svg>
);

export const AIGuideIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient2)"/>
    <defs>
      <linearGradient id="gradient2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect x="18" y="20" width="28" height="24" rx="4" fill="white" opacity="0.9"/>
    <circle cx="26" cy="30" r="3" fill="#6366f1"/>
    <circle cx="38" cy="30" r="3" fill="#6366f1"/>
    <path d="M24 38C24 36.8954 24.8954 36 26 36H38C39.1046 36 40 36.8954 40 38V40C40 41.1046 39.1046 42 38 42H26C24.8954 42 24 41.1046 24 40V38Z" fill="#6366f1"/>
    <path d="M32 16L28 20H36L32 16Z" fill="white" opacity="0.7"/>
    <path d="M32 48L28 44H36L32 48Z" fill="white" opacity="0.7"/>
    <circle cx="32" cy="32" r="20" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);

export const AccessibilityIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient3)"/>
    <defs>
      <linearGradient id="gradient3" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981"/>
        <stop offset="1" stopColor="#059669"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="24" r="8" fill="white" opacity="0.9"/>
    <path d="M20 40C20 35.5817 23.5817 32 28 32H36C40.4183 32 44 35.5817 44 40V42C44 43.1046 43.1046 44 42 44H22C20.8954 44 20 43.1046 20 42V40Z" fill="white" opacity="0.9"/>
    <path d="M16 48L20 44L24 48L20 52L16 48Z" fill="white" opacity="0.7"/>
    <path d="M40 48L44 44L48 48L44 52L40 48Z" fill="white" opacity="0.7"/>
    <path d="M28 20L32 16L36 20L32 24L28 20Z" fill="white" opacity="0.7"/>
  </svg>
);

export const SustainableIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient4)"/>
    <defs>
      <linearGradient id="gradient4" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981"/>
        <stop offset="1" stopColor="#059669"/>
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="42" rx="12" ry="8" fill="white" opacity="0.3"/>
    <path d="M32 20C32 20 24 28 24 36C24 40.4183 27.5817 44 32 44C36.4183 44 40 40.4183 40 36C40 28 32 20 32 20Z" fill="white" opacity="0.9"/>
    <path d="M28 32L32 28L36 32L32 36L28 32Z" fill="#10b981" opacity="0.8"/>
    <path d="M30 38L32 36L34 38L32 40L30 38Z" fill="#10b981" opacity="0.8"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);

export const RealTimeIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient5)"/>
    <defs>
      <linearGradient id="gradient5" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#2563eb"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="14" stroke="white" strokeWidth="2" opacity="0.9"/>
    <path d="M32 20V32L40 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
    <circle cx="32" cy="32" r="2" fill="white" opacity="0.9"/>
    <path d="M20 20L24 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M44 20L40 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M20 44L24 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M44 44L40 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export const LearningIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient6)"/>
    <defs>
      <linearGradient id="gradient6" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b"/>
        <stop offset="1" stopColor="#ef4444"/>
      </linearGradient>
    </defs>
    <path d="M32 18L20 24V36C20 40.4183 25.3726 44 32 44C38.6274 44 44 40.4183 44 36V24L32 18Z" fill="white" opacity="0.9"/>
    <path d="M32 18L44 24V36C44 40.4183 38.6274 44 32 44" stroke="white" strokeWidth="2" opacity="0.5"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
    <path d="M28 30L30 32L36 26" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChatIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient7)"/>
    <defs>
      <linearGradient id="gradient7" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <path d="M20 24C20 21.7909 21.7909 20 24 20H40C42.2091 20 44 21.7909 44 24V36C44 38.2091 42.2091 40 40 40H30L24 44V40H24C21.7909 40 20 38.2091 20 36V24Z" fill="white" opacity="0.9"/>
    <circle cx="28" cy="30" r="2" fill="#6366f1"/>
    <circle cx="32" cy="30" r="2" fill="#6366f1"/>
    <circle cx="36" cy="30" r="2" fill="#6366f1"/>
  </svg>
);

export const MapIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient8)"/>
    <defs>
      <linearGradient id="gradient8" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <path d="M20 18L28 22L36 18L44 22V42L36 46L28 42L20 46V18Z" stroke="white" strokeWidth="2.5" fill="none" opacity="0.9"/>
    <circle cx="32" cy="32" r="6" fill="white" opacity="0.9"/>
    <path d="M32 26V32L36 36" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CheckIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient9)"/>
    <defs>
      <linearGradient id="gradient9" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981"/>
        <stop offset="1" stopColor="#059669"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="14" fill="white" opacity="0.2"/>
    <path d="M24 32L30 38L40 26" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);

export const LocationIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient10)"/>
    <defs>
      <linearGradient id="gradient10" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b"/>
        <stop offset="1" stopColor="#ef4444"/>
      </linearGradient>
    </defs>
    <path d="M32 18C26.4772 18 22 22.4772 22 28C22 36 32 46 32 46C32 46 42 36 42 28C42 22.4772 37.5228 18 32 18Z" fill="white" opacity="0.9"/>
    <circle cx="32" cy="28" r="6" fill="#f59e0b" opacity="0.8"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);

export const StarIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient11)"/>
    <defs>
      <linearGradient id="gradient11" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b"/>
        <stop offset="1" stopColor="#ef4444"/>
      </linearGradient>
    </defs>
    <path d="M32 16L36.9443 26.2918L48 28.5836L40 36.4164L41.8885 47.7082L32 42L22.1115 47.7082L24 36.4164L16 28.5836L27.0557 26.2918L32 16Z" fill="white" opacity="0.9"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);

export const PlusIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient12)"/>
    <defs>
      <linearGradient id="gradient12" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="14" fill="white" opacity="0.2"/>
    <path d="M32 22V42M22 32H42" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.9"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);

export const CommunityIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="url(#gradient13)"/>
    <defs>
      <linearGradient id="gradient13" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981"/>
        <stop offset="1" stopColor="#059669"/>
      </linearGradient>
    </defs>
    <circle cx="24" cy="28" r="6" fill="white" opacity="0.9"/>
    <circle cx="40" cy="28" r="6" fill="white" opacity="0.9"/>
    <path d="M18 40C18 36.6863 20.6863 34 24 34C27.3137 34 30 36.6863 30 40V42C30 43.1046 29.1046 44 28 44H20C18.8954 44 18 43.1046 18 42V40Z" fill="white" opacity="0.9"/>
    <path d="M34 40C34 36.6863 36.6863 34 40 34C43.3137 34 46 36.6863 46 40V42C46 43.1046 45.1046 44 44 44H36C34.8954 44 34 43.1046 34 42V40Z" fill="white" opacity="0.9"/>
    <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" opacity="0.2"/>
  </svg>
);
