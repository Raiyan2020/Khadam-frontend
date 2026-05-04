
import React, { useState, useEffect } from 'react';
import { countries, Country, defaultCountry } from '../lib/countries';
import { normalizeArabicNumbers } from '../lib/numbers';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string; // The full number with country code, e.g., +96512345678
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, placeholder, className }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value.startsWith('+')) {
      const match = countries.find(c => value.startsWith(c.code));
      return match || defaultCountry;
    }
    return defaultCountry;
  });

  const [localNumber, setLocalNumber] = useState(() => {
    if (value.startsWith(selectedCountry.code)) {
      return value.slice(selectedCountry.code.length);
    }
    return '';
  });

  const [isOpen, setIsOpen] = useState(false);

  // Update local state if prop value changes externally
  useEffect(() => {
    if (value) {
      const match = countries.find(c => value.startsWith(c.code));
      if (match) {
        setSelectedCountry(match);
        const numberPart = value.slice(match.code.length);
        if (numberPart !== localNumber) {
          setLocalNumber(numberPart);
        }
      }
    } else if (value === '') {
      setLocalNumber('');
    }
  }, [value, selectedCountry.code]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = normalizeArabicNumbers(e.target.value);
    const cleaned = rawValue.replace(/\D/g, ''); // Remove non-digits

    // Total length check: code length + number length <= 13
    const maxNumberLength = 13 - selectedCountry.code.length;
    const limited = cleaned.slice(0, maxNumberLength);

    setLocalNumber(limited);
    onChange(`${selectedCountry.code}${limited}`);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);

    // Re-validate length with new country code
    const maxNumberLength = 13 - country.code.length;
    const limited = localNumber.slice(0, maxNumberLength);
    setLocalNumber(limited);
    onChange(`${country.code}${limited}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 flex items-center gap-2 px-3 bg-glass border border-border rounded-xl text-primary hover:border-brand-500/50 transition-all min-w-[90px] justify-between"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium" dir="ltr">{selectedCountry.code}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-y-auto bg-white border border-border rounded-xl shadow-xl z-50 p-1 no-scrollbar animate-in fade-in zoom-in-95 duration-200">
            {countries.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${selectedCountry.id === country.id ? 'bg-brand-500/10 text-brand-500' : 'text-primary hover:bg-glass'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                </div>
                <span className="text-xs text-secondary font-mono" dir="ltr">{country.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Number Input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="h-12 flex-1 min-w-0 px-4 bg-glass border border-border rounded-xl text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none text-sm font-medium"
        dir="ltr"
      />
    </div>
  );
};
