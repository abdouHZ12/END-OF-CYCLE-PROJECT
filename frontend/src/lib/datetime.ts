export function getDate(time?: string | null): string {
  if (!time) return 'N/A';
  return time.split('T')[0].replace(/-/g, '/');
}

export function getFullDate(time?: string | null): string {
  if (!time) return 'N/A';
  const [datePart, timePart] = time.split('T');
  const [hour, minute] = (timePart ?? '').split(':');
  return `${datePart.replace(/-/g, '/')} ${hour}:${minute}`;
}

const ALGERIA_TZ = 'Africa/Algiers';

const asDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function formatAlgeriaDateTime(value?: string | Date | null): string {
  const d = asDate(value);
  if (!d) return 'N/A';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ALGERIA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  return `${map.year}/${map.month}/${map.day} ${map.hour}:${map.minute}`;
}

// Formats an instant (UTC in DB) into Algeria local date YYYY/MM/DD for display.
export function formatAlgeriaDate(value?: string | Date | null): string {
  const d = asDate(value);
  if (!d) return 'N/A';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ALGERIA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);

  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  return `${map.year}/${map.month}/${map.day}`;
}

export function formatAlgeriaTime(value?: string | Date | null): string {
  const d = asDate(value);
  if (!d) return 'N/A';
  return new Intl.DateTimeFormat('fr-DZ', {
    timeZone: ALGERIA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
