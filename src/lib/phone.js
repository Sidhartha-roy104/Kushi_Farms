/**
 * Strip all non-digits and take the LAST 10 digits.
 */
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function isValidPhone(raw) {
  return /^[0-9]{10}$/.test(normalizePhone(raw));
}
