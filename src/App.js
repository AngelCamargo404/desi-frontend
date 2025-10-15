// App.js
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import "./App.css"
import { AuthProvider } from './contexts/authContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35',
    },
    secondary: {
      main: '#FFD700',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider> {/* Esto debe envolver todo */}
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;