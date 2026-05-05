
import React, { useState, useEffect } from 'react';
import { useCountryCodes, ApiCountry } from '../lib/useCountryCodes';
import { normalizeArabicNumbers } from '../lib/numbers';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n';

/**
 * Extracts the local phone number (without country code prefix).
 * e.g. splitPhone("+96512345678") → { phoneCode: "+965", phone: "12345678" }
 * For the numeric country id, use the onCountryChange callback.
 */
export const splitPhone = (fullPhone: string): { phoneCode: string; phone: string } => {
  // Sort by length descending to match longest prefix first
  const knownCodes = ['+965', '+966', '+971', '+974', '+973', '+968', '+963', '+961', '+962', '+964', '+218', '+216', '+212', '+20'];
  const match = knownCodes.sort((a, b) => b.length - a.length).find(c => fullPhone.startsWith(c));
  if (match) return { phoneCode: match, phone: fullPhone.slice(match.length) };
  return { phoneCode: '+965', phone: fullPhone };
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called whenever the selected country changes. Use country.id for numeric country_id. */
  onCountryChange?: (country: ApiCountry) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onCountryChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const { data: apiCountries, isLoading } = useCountryCodes();
  const { dir } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<ApiCountry | null>(null);
  const [localNumber, setLocalNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const findByPhone = (phone: string, list: ApiCountry[]): ApiCountry => {
    const sorted = [...list].sort((a, b) => b.phone_code.length - a.phone_code.length);
    return sorted.find(c => phone.startsWith(c.phone_code)) ?? list[0];
  };

  // Initialize once API countries load
  useEffect(() => {
    if (!apiCountries?.length) return;
    const country = findByPhone(value, apiCountries);
    setSelectedCountry(country);
    setLocalNumber(value.startsWith(country.phone_code) ? value.slice(country.phone_code.length) : '');
    onCountryChange?.(country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCountries]);

  // Sync when value changes externally (e.g. pre-fill from profile)
  useEffect(() => {
    if (!apiCountries?.length || !value) return;
    const country = findByPhone(value, apiCountries);
    if (country.id !== selectedCountry?.id) {
      setSelectedCountry(country);
      onCountryChange?.(country);
    }
    const newLocal = value.startsWith(country.phone_code) ? value.slice(country.phone_code.length) : value;
    setLocalNumber(newLocal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCountry) return;
    const cleaned = normalizeArabicNumbers(e.target.value).replace(/\D/g, '');
    const maxLen = selectedCountry.country_code === 'KW' ? 8 : 11;
    const limited = cleaned.slice(0, maxLen);
    setLocalNumber(limited);
    onChange(`${selectedCountry.phone_code}${limited}`);
  };

  const handleCountrySelect = (country: ApiCountry) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const maxLen = 13 - country.phone_code.length;
    const limited = localNumber.slice(0, maxLen);
    setLocalNumber(limited);
    onChange(`${country.phone_code}${limited}`);
    onCountryChange?.(country);
  };

  if (isLoading || !selectedCountry) {
    return (
      <div className={`flex gap-2 ${className ?? ''}`}>
        <div className="h-12 w-[90px] bg-glass border border-border rounded-xl animate-pulse" />
        <div className="h-12 flex-1 min-w-0 bg-glass border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      {/* Country Selector */}
      {/* Number Input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        maxLength={selectedCountry?.country_code === 'KW' ? 8 : 11}
        disabled={disabled}
        className={`h-12 flex-1 min-w-0 px-4 bg-glass border border-border rounded-xl text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none text-sm font-medium ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        dir="ltr"
      />
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`h-12 flex items-center gap-1.5 px-3 bg-glass border border-border rounded-xl text-primary transition-all min-w-[90px] justify-between ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-brand-500/50'}`}
        >
          <img
            src={selectedCountry.image}
            alt={selectedCountry.country_code}
            className="w-5 h-4 object-contain rounded-sm flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-sm font-medium" dir="ltr">{selectedCountry.phone_code}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-56 max-h-64 overflow-y-auto bg-white border border-border rounded-xl shadow-xl z-50 p-1 no-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
            {apiCountries!.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${selectedCountry.id === country.id ? 'bg-brand-500/10 text-brand-500' : 'text-primary hover:bg-glass'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={country.image}
                    alt={country.country_code}
                    className="w-6 h-4 object-contain rounded-sm flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="font-medium">{country.name}</span>
                </div>
                <span className="text-xs text-secondary font-mono" dir="ltr">{country.phone_code}</span>
              </button>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};
