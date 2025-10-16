import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Recensement from './Recensement';
import SituationMap from './SituationMap';
import Creances from './Creances';
import RechercheCreance from './RechercheCreance';
import CreanceDetails from './CreanceDetails';
import RechercheCreanceResultats from './RechercheCreanceResultats';
import HomePage from './HomePage';
import Profile from './Profile'; 
import Declaration from './Declaration'; 
import Utilisateurs from './utilisateurs'
import Exoneration from  './Exoneration';
import { useAuth } from './Auth'


export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/home';
  const isProfilePage = location.pathname === '/profile';

  const { authTokens } = useAuth();


  useEffect(() => {
  const storedTokens = localStorage.getItem('authTokens');
  const accessToken = storedTokens ? JSON.parse(storedTokens).accessToken : null;
  if (!accessToken && !isLoginPage) {
    navigate('/login');
  }
}, [navigate, isLoginPage]);

useEffect(() => {
  if (!authTokens) {
    navigate('/login', { replace: true });
  }
}, [authTokens, navigate]);


  // N'affiche Navbar et Sidebar que si l'utilisateur est authentifié et n'est pas sur la page de login ou home
  const showNavbarSidebar = !isLoginPage && !isHomePage;

  return (
    <>
      {showNavbarSidebar && <Navbar />}
      {showNavbarSidebar && <Sidebar />}
      <main className={`pt-16 p-4 ${showNavbarSidebar ? 'ml-60' : ''}`} style={{ overflow: 'visible' }}>
        <Routes>
          <Route path="/" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="recensement" element={<Recensement />} />
          <Route path="situation-map" element={<SituationMap />} />
          <Route path="creances" element={<Creances />} />
          <Route path="/recherche-creance" element={<RechercheCreance />} />
          <Route path="/recherche-creance-resultats" element={<RechercheCreanceResultats />} />
          <Route path="/creance-details/:id" element={<CreanceDetails />} />
          <Route path="/profile" element={<Profile />} /> {/* Ajoutez la route pour le profil */}
          <Route path="/declaration" element={<Declaration />} /> {/* Ajoutez la route pour la déclaration */}
          <Route path="/utilisateurs" element={<Utilisateurs />} />
          <Route path="/exoneration" element={<Exoneration />} />
        </Routes>
      </main>
    </>
  );
}