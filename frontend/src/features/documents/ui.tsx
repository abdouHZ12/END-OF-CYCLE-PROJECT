import Chip from '@mui/material/Chip';

export const getStatusChip = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <Chip
          label={'En attente'}
          sx={{
            backgroundColor: 'var(--naftal-brand-muted)',
            color: 'var(--naftal-brand)',
            fontWeight: 'bold',
            border: '1px solid var(--naftal-brand)',
            borderRadius: '8px',
          }}
        />
      );
    case 'APPROVED':
      return (
        <Chip
          label={'Approuvé'}
          sx={{
            backgroundColor: 'var(--naftal-success-muted)',
            color: 'var(--naftal-success)',
            fontWeight: 'bold',
            border: '1px solid var(--naftal-success)',
            borderRadius: '8px',
          }}
        />
      );
    case 'REJECTED':
      return (
        <Chip
          label={'Rejeté'}
          sx={{
            backgroundColor: 'var(--naftal-error-muted)',
            color: 'var(--naftal-error)',
            fontWeight: 'bold',
            border: '1px solid var(--naftal-error)',
            borderRadius: '8px',
          }}
        />
      );
    default:
      return <Chip label={status} />;
  }
};

export const gettype = (type: string) => {
  switch (type) {
    case 'MISSION_ORDER':
      return 'Order of Mission';
    case 'ABSENCE_AUTH':
      return 'Autorisation d\'absence';
    case 'EXIT_SLIP':
      return 'Bon de sortie';
    default:
      return type;
  }
};
