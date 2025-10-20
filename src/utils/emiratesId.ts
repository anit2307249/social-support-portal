export function formatEmiratesId(value: string) {
  let digits = value.replace(/\D/g, '');

  if (digits.length > 15) digits = digits.slice(0, 15);

  // Apply dashes: 784-YYYY-NNNNNNN-N
  if (digits.length > 3 && digits.length <= 7) {
    digits = digits.replace(/^(\d{3})(\d+)/, '$1-$2');
  } else if (digits.length > 7 && digits.length <= 14) {
    digits = digits.replace(/^(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
  } else if (digits.length > 14) {
    digits = digits.replace(/^(\d{3})(\d{4})(\d{7})(\d+)/, '$1-$2-$3-$4');
  }

  return digits;
}

export const isValidEmiratesId = (id: string): boolean => {
  // Remove all non-digit characters
  const digits = id.replace(/\D/g, '');

  // Must be exactly 15 digits
  if (digits.length !== 15) return false;

  // Must start with 784
  if (!digits.startsWith('784')) return false;

  return true;
};