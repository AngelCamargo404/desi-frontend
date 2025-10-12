import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
// import CompraTickets from '../pages/CompraTickets/CompraTickets';
// import OtraPagina from '../pages/OtraPagina/OtraPagina';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* <Route path="/comprar" element={<CompraTickets />} />
      <Route path="/otra-pagina" element={<OtraPagina />} /> */}
    </Routes>
  );
};

export default AppRoutes;