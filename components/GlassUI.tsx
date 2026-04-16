import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-glass backdrop-blur-xl border border-border shadow-sm rounded-[18px] p-4 ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-200' : ''}`}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const baseStyle = "h-[44px] rounded-[14px] font-medium text-sm flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-6 focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]";
  
  const variants = {
    // Primary: Brand 500 background, Dark text for contrast
    primary: "bg-accent text-accent-fg shadow-lg shadow-brand-500/20 hover:bg-accent-hover",
    // Secondary: Surface background, Primary text
    secondary: "bg-surface border border-border text-primary hover:bg-glassHigh",
    // Glass: Glass background
    glass: "bg-glass border border-border text-primary hover:bg-glassHigh"
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'accent' | 'green' | 'red' | 'neutral' }> = ({ children, color = 'neutral' }) => {
  const colors = {
    // Accent: Brand 200 bg, Brand 900 text
    accent: "bg-accent-subtle text-accent-text border-brand-300 dark:border-brand-700",
    green: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    neutral: "bg-glassHigh text-secondary border-border"
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Avatar: React.FC<{ src: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };
  return (
    <img src={src} alt={alt} className={`${sizes[size]} rounded-full object-cover border border-border ${className}`} />
  );
};