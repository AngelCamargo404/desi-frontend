import { Box } from '@mui/material';
import logoImage from '../../assets/images/gana-con-desi-logo.jpeg';

const Logo = ({ size = 50, borderWidth = 3, borderColor = '#FFD700' }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        '& img': {
          width: '90%',
          height: '90%',
          objectFit: 'contain',
          borderRadius: '50%'
        }
      }}
    >
      <img 
        src={logoImage}
        alt="Gana Con Desi Logo" 
        onError={(e) => {
          // Fallback si la imagen no carga
          e.target.style.display = 'none';
        }}
      />
    </Box>
  );
};

export default Logo;