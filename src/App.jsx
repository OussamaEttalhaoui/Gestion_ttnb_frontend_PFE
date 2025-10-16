import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './pages/Auth';


function App() {
  return (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
  );
}

function AppContent() {
  const { authTokens } = useAuth();
  const isAuthenticated = !!authTokens;

  return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
  );
}

export default App;





