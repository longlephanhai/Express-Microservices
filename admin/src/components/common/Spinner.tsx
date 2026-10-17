import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color, className = '' }) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 36,
  };
  const dimension = sizeMap[size];

  return (
    <svg
      className={`animate-spin ${className}`}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color || 'currentColor'}
        strokeWidth="3"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 14.2386 2.73587 16.3053 3.97892 17.9737"
        stroke={color || 'currentColor'}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
