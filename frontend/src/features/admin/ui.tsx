import Chip from '@mui/material/Chip';

export const getRoleChip = (type: string) => {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ADMIN: { label: 'Admin', color: '#f44336', bg: 'rgba(244,67,54,0.1)', border: '#f44336' },
    MANAGER: { label: 'Manager', color: '#ffa500', bg: 'rgba(255,165,0,0.1)', border: '#ffa500' },
    WORKER: { label: 'Worker', color: '#4caf50', bg: 'rgba(76,175,80,0.1)', border: '#4caf50' },
    AGENT: { label: 'Agent', color: '#7fb3ff', bg: 'rgba(127,179,255,0.1)', border: '#7fb3ff' },
  };

  const s = map[type] ?? { label: type, color: '#fff', bg: 'transparent', border: '#fff' };

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
