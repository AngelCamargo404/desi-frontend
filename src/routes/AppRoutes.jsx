// AppRoutes.js
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import CompraTickets from '../pages/CompraTickets/CompraTickets';
import Login from '../pages/Login/Login';
import AdminCreateRaffle from '../pages/Admin/AdminCreateRaffle';
import AdminRafflesList from '../pages/Admin/AdminRafflesList';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRaffleTickets from '../pages/Admin/AdminRaffleTickets';
import CreateUser from '../pages/Admin/CreateUser';
import AdminWinnersList from '../pages/Admin/AdminWinnersList';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/comprar" element={<CompraTickets />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas - Solo administradores */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminCreateRaffle />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/create-raffle" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminCreateRaffle />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/raffles" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminRafflesList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/raffles/:id/tickets"
        element={
          <ProtectedRoute requireAdmin>
            <AdminRaffleTickets />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/winners" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminWinnersList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/create-user" 
        element={
          <ProtectedRoute requireAdmin>
            <CreateUser />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;