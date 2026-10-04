/**
 * Parse API date/time values from the Java backend.
 * Supports ISO-8601 strings, epoch millis, and Jackson's default LocalDateTime array:
 * [year, month (1–12), day, hour, minute, second?, nano?]
 */
export function parseApiDateTime(value) {
  if (value == null || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const normalized = trimmed.includes(' ') && !trimmed.includes('T') ? trimmed.replace(' ', 'T') : trimmed;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const y = value[0];
    const mo = value[1];
    const day = value[2];
    const h = value[3] ?? 0;
    const min = value[4] ?? 0;
    const s = value[5] ?? 0;
    const nano = value[6] ?? 0;
    if ([y, mo, day].some((n) => typeof n !== 'number' || !Number.isFinite(n))) return null;
    const ms = Math.floor(Number(nano) / 1e6);
    const d = new Date(y, mo - 1, day, h, min, s, ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/** Locale-aware display; returns empty string if value cannot be parsed. */
export function formatApiDateTime(value, locales, options) {
  const d = parseApiDateTime(value);
  if (!d) return '';
  return d.toLocaleString(locales, options);
}
