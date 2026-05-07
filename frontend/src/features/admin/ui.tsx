import Chip from '@mui/material/Chip';

export const getRoleChip = (type: string) => {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ADMIN: { label: 'Admin', color: 'var(--naftal-error)', bg: 'var(--naftal-error-muted)', border: 'var(--naftal-error)' },
    MANAGER: { label: 'Manager', color: 'var(--naftal-brand)', bg: 'var(--naftal-brand-muted)', border: 'var(--naftal-brand)' },
    WORKER: { label: 'Worker', color: 'var(--naftal-success)', bg: 'var(--naftal-success-muted)', border: 'var(--naftal-success)' },
    AGENT: { label: 'Agent', color: 'var(--naftal-info)', bg: 'var(--naftal-info-muted)', border: 'var(--naftal-info)' },
  };

  const s = map[type] ?? { label: type, color: 'var(--naftal-text-primary)', bg: 'transparent', border: 'var(--naftal-text-primary)' };

  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        backgroundColor: s.bg,
        color: s.color,
        fontWeight: 'bold',
        border: `1px solid ${s.border}`,
        borderRadius: '8px',
        mr: 0.5,
      }}
    />
  );
};
