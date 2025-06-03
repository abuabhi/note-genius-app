
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { allRoutes } from '@/routes/routeConfig';

export const AppRoutes = () => {
  return (
    <Routes>
      {allRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
