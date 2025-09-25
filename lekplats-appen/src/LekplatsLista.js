// src/LekplatsLista.js (Uppdaterad med fallback-bild)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// ---- ÄNDRING 1: Definiera din standardbild som en konstant ----
const BILD_SAKNAS_URL = "https://firebasestorage.googleapis.com/v0/b/lekplatsen-907fb.firebasestorage.app/o/bild%20saknas.png?alt=media&token=3acbfa69-dea8-456b-bbe2-dd95034f773f";

function LekplatsLista() {
  const [lekplatser, setLekplatser] = useState([]);

  useEffect(() => {
    const hamtaLekplatser = async () => {
      const lekplatserCollection = collection(db, 'lekplatser');
      const lekplatsSnapshot = await getDocs(lekplatserCollection);
      const lekplatsLista = lekplatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLekplatser(lekplatsLista);
    };
    hamtaLekplatser();
  }, []);

  return (
    <div>
      <div className="lekplats-grid">
        {lekplatser.map(lekplats => (
          <Link to={`/lekplats/${lekplats.id}`} key={lekplats.id} className="lekplats-kort">
            
            {/* ---- ÄNDRING 2: Använd "ELLER"-logik för bildkällan ---- */}
            <img 
              src={lekplats.bildUrl || BILD_SAKNAS_URL}
              alt={lekplats.namn} 
              className="lekplats-kort-bild" 
            />
            
            <div className="lekplats-kort-info">
              <h3 className="namn">{lekplats.namn}</h3>
              <p className="adress">{lekplats.adress}</p>
            </div>

          </Link>
        ))}
      </div>
    </div>
  );
}

export default LekplatsLista;