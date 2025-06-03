
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { allRoutes } from '@/routes/routeConfig';
import QuizHistoryPage from "@/pages/QuizHistoryPage";
import { FeatureProtectedRoute } from '@/components/routes/FeatureProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {allRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      <Route
        path="/quiz/history"
        element={
          <FeatureProtectedRoute featureKey="quiz_taking">
            <QuizHistoryPage />
          </FeatureProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
