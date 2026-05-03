/**
 * Converts Arabic/Eastern digits to English/Western digits
 * and removes all non-numeric characters.
 */
export const normalizeArabicNumbers = (str: string): string => {
  const arabicDigits: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  // Replace Arabic digits
  let normalized = str.replace(/[٠-٩]/g, (d) => arabicDigits[d] || d);
  
  // Remove non-numeric characters
  return normalized.replace(/\D/g, '');
};
