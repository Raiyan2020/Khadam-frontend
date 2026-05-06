import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '../i18n';

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
    primary: "bg-accent text-accent-fg shadow-lg shadow-brand-500/20 hover:bg-accent-hover",
    secondary: "bg-surface border border-border text-primary hover:bg-glassHigh",
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

export const Switch: React.FC<{ checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }> = ({ checked = false, onChange, disabled }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onChange) onChange(!checked);
      }}
      className={`relative w-10 h-6 flex shrink-0 items-center rounded-full transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${checked !== false ? 'bg-brand-500' : 'bg-surface border border-border'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${checked !== false ? 'end-1' : 'start-1'}`} />
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg ${className}`} />
);

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onFilterClick?: () => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, onSearch, onFilterClick, placeholder, className = '' }) => {
  const { t } = useLanguage();
  return (
    <div className={`relative group ${className}`}>
      <input
        type="text"
        placeholder={placeholder || t('search_placeholder')}
        className="w-full h-11 bg-glass border border-border rounded-[14px] ps-10 pe-10 text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-brand-400 focus:bg-glassHigh focus:ring-1 focus:ring-[var(--focus-ring)] transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) onSearch();
        }}
      />
      <Search className="absolute start-3.5 top-3 text-secondary/70 group-focus-within:text-brand-500 transition-colors" size={18} />
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className="absolute end-3 top-2.5 text-accent-text bg-accent-subtle p-1.5 rounded-md hover:bg-brand-300 transition-colors"
        >
          <Filter size={14} />
        </button>
      )}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'danger' | 'info';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children, variant = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[320px] bg-white dark:bg-zinc-900 border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-6">
          <h3 className={`text-lg font-bold mb-2 ${variant === 'danger' ? 'text-red-500' : 'text-primary'}`}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-secondary leading-relaxed mb-6">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};