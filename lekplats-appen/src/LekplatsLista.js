// src/LekplatsLista.js (Uppdaterad)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

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
      {/* Grid-behållaren */}
      <div className="lekplats-grid">
        {lekplatser.map(lekplats => (
          // Hela kortet är en länk
          <Link to={`/lekplats/${lekplats.id}`} key={lekplats.id} className="lekplats-kort">
            {/* Vi behöver en bild här. Vi kan använda incheckningsbilder senare. */}
            <img 
              src="https://via.placeholder.com/300x200?text=Lekplats" // Platshållarbild
              alt={lekplats.namn} 
              className="lekplats-kort-bild" 
            />
            <div className="lekplats-kort-info">
              <h3>{lekplats.namn}</h3>
              <p>{lekplats.kommun}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default LekplatsLista;