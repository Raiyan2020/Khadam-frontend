
export interface Country {
  name: string;
  code: string;
  flag: string;
  id: string;
}

export const countries: Country[] = [
  { id: 'KW', name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { id: 'SA', name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { id: 'AE', name: 'UAE', code: '+971', flag: '🇦🇪' },
  { id: 'QA', name: 'Qatar', code: '+974', flag: '🇶🇦' },
  { id: 'BH', name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { id: 'OM', name: 'Oman', code: '+968', flag: '🇴🇲' },
  { id: 'EG', name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { id: 'JO', name: 'Jordan', code: '+962', flag: '🇯🇴' },
  { id: 'LB', name: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { id: 'IQ', name: 'Iraq', code: '+964', flag: '🇮🇶' },
];

export const defaultCountry = countries[0]; // Kuwait
