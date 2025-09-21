// src/App.js (Korrekt version med inline-bakgrund)

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Importera alla dina sid-komponenter
import Home from './Home.js';
import LekplatsLista from './LekplatsLista.js';
import LekplatsDetalj from './LekplatsDetalj.js';
import NyLekplatsForm from './NyLekplatsForm.js';
import Login from './Login.js';

// Importera din Header
import Header from './Header.js';

// Vi definierar vår Layout-komponent
const AppLayout = ({ user }) => { // Ta emot user-propen här
  
  // Skapa ett JavaScript-objekt för våra stilar
  const layoutStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/background-pattern.jpg)`,
    backgroundRepeat: 'repeat',
  };

  return (
    // Applicera stil-objektet direkt på div:en med "style"-attributet
    <div className="app-container" style={layoutStyle}>
      <Header />
      <main>
        {/* Skicka vidare user-propen till Outlet's kontext, om nödvändigt i framtiden */}
        <Outlet context={{ user }} />
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
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Skicka med user-propen till AppLayout */}
        <Route element={<AppLayout user={user} />}>
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