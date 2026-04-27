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
