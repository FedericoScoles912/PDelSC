export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch (e) { return String(iso); }
}

export function getInitials(displayName = '') {
  if (!displayName) return '·';
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
