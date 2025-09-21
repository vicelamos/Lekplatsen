// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'; // Importera Outlet!
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Importera alla dina sid-komponenter
import Home from './Home.js';
import LekplatsLista from './LekplatsLista.js';
import LekplatsDetalj from './LekplatsDetalj.js';
import NyLekplatsForm from './NyLekplatsForm.js';
import Login from './Login.js';

// Importera din Header
import Header from './Header.js';

// 1. Vi skapar en Layout-komponent.
// Denna komponent renderar Headern och sedan "platsen" där barn-rutterna ska visas.
const AppLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Outlet /> {/* <Outlet /> är platshållaren för barn-rutterna */}
      </main>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      {/* 2. Din huvud-Routes-komponent */}
      <Routes>
        {/* Rutt 1: Startsidan (Splash-sidan) har ingen Header */}
        <Route path="/" element={<Home />} />

        {/* Rutt 2: En "Layout Route" som använder AppLayout.
            Alla rutter inuti denna kommer att renderas i <Outlet />-platsen. */}
        <Route element={<AppLayout />}>
          <Route path="/lekplatser" element={<LekplatsLista />} />
          <Route path="/lekplats/:id" element={<LekplatsDetalj user={user} />} />
          <Route path="/ny-lekplats" element={<NyLekplatsForm />} />
          <Route path="/login" element={<Login user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;