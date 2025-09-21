// src/App.js (Uppdaterad och förenklad)
import React, { useState, useEffect } from 'react';
import './App.css'; // Kan innehålla App-specifik CSS om du vill
import Header from './Header';
import Home from './Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Importera alla dina sid-komponenter
import Home from './Home.js';
import LekplatsLista from './LekplatsLista.js';
import LekplatsDetalj from './LekplatsDetalj.js';
import NyLekplatsForm from './NyLekplatsForm.js';
import Login from './Login.js';

// Importera den nya Headern
import Header from './Header.js';

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
      {/* Vi visar inte Headern på "splash"-sidan */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/*" element={
          <div className="app-cApp">
            <Header />
            <main className="container"></main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lekplatser" element={<LekplatsLista />} />
              <Route path="/lekplats/:id" element={<LekplatsDetalj user={user} />} />
              <Route path="/ny-lekplats" element={<NyLekplatsForm />} />
              <Route path="/login" element={<Login user={user} />} />
            </Routes>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;