import Chip from '@mui/material/Chip';

export const getStatusChip = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <Chip
          label={'En attente'}
          sx={{
            backgroundColor: 'rgba(255, 165, 0, 0.1)',
            color: 'orange',
            fontWeight: 'bold',
            border: '1px solid #ffa500',
            borderRadius: '8px',
          }}
        />
      );
    case 'APPROVED':
      return (
        <Chip
          label={'Approuvé'}
          sx={{
            backgroundColor: 'rgba(0, 128, 0, 0.1)',
            color: '#4caf50',
            fontWeight: 'bold',
            border: '1px solid #4caf50',
            borderRadius: '8px',
          }}
        />
      );
    case 'REJECTED':
      return (
        <Chip
          label={'Rejeté'}
          sx={{
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            color: '#f44336',
            fontWeight: 'bold',
            border: '1px solid #f44336',
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
