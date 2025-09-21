// src/LekplatsDetalj.js (fullständig och uppdaterad fil)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; 
import CheckinForm from './CheckinForm';

function LekplatsDetalj({ user }) {
  const { id } = useParams(); 
  const [lekplats, setLekplats] = useState(null);
  const [incheckningar, setIncheckningar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckinForm, setShowCheckinForm] = useState(false);

  useEffect(() => {
    const hamtaAllData = async () => {
      setLoading(true);
      
      const lekplatsDocRef = doc(db, 'lekplatser', id);
      const docSnap = await getDoc(lekplatsDocRef);

      if (docSnap.exists()) {
        setLekplats(docSnap.data());
      } else {
        console.log("Ingen sådan lekplats hittades!");
      }

      const incheckningarCollection = collection(db, 'incheckningar');
      const q = query(incheckningarCollection, where("lekplatsId", "==", id));
      
      const querySnapshot = await getDocs(q);
      const incheckningsLista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setIncheckningar(incheckningsLista);
      setLoading(false);
    };

    hamtaAllData();
  }, [id]);

  if (loading) {
    return <p>Laddar information om lekplatsen...</p>;
  }

  if (!lekplats) {
    return <p>Kunde inte hitta lekplatsen.</p>;
  }

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div>
      <h2>{lekplats.namn}</h2>
      <p><strong>Adress:</strong> {lekplats.adress}</p>
      <p><strong>Kommun:</strong> {lekplats.kommun}</p>
      <p><em>{lekplats.beskrivning}</em></p>
      
      {/* ---- UPPDATERAD LOGIK FÖR ATT HANTERA BÅDA DATATYPERNA ---- */}
      <h3>Utrustning</h3>
      <ul>
        {lekplats.utrustning && (
          Array.isArray(lekplats.utrustning)
            // NYA FORMATET: Om det är en array, mappa den direkt
            ? lekplats.utrustning.map(item => <li key={item}>{capitalizeFirstLetter(item)}</li>)
            // GAMLA FORMATET: Om det är ett objekt, filtrera och mappa nycklarna
            : Object.keys(lekplats.utrustning)
                .filter(key => lekplats.utrustning[key] === true)
                .map(key => <li key={key}>{capitalizeFirstLetter(key)}</li>)
        )}
      </ul>

      <h3>Faciliteter</h3>
      <ul>
        {lekplats.faciliteter && (
          Array.isArray(lekplats.faciliteter)
            // NYA FORMATET
            ? lekplats.faciliteter.map(item => <li key={item}>{capitalizeFirstLetter(item)}</li>)
            // GAMLA FORMATET
            : Object.keys(lekplats.faciliteter)
                .filter(key => lekplats.faciliteter[key] === true)
                .map(key => <li key={key}>{capitalizeFirstLetter(key)}</li>)
        )}
      </ul>
      {/* ----------------------------------------------------------------- */}

      <hr />

      {user ? (
        <div>
          {showCheckinForm ? (
            <CheckinForm 
              user={user} 
              lekplatsId={id} 
              onCheckinSuccess={() => setShowCheckinForm(false)} 
            />
          ) : (
            <button onClick={() => setShowCheckinForm(true)}>
              Checka in på denna lekplats
            </button>
          )}
        </div>
      ) : (
        <p>
          <Link to="/login">Logga in</Link> för att checka in!
        </p>
      )}

      <h3>Bilder från besökare</h3>
      <div className="bild-galleri">
        {incheckningar.map(incheckning => (
          incheckning.bildUrl && (
            <img 
              key={incheckning.id} 
              src={incheckning.bildUrl} 
              alt={`Incheckningsbild från ${incheckning.userSmeknamn}`}
              style={{ width: '200px', height: 'auto', margin: '5px' }}
            />
          )
        ))}
      </div>
    </div>
  );
}

export default LekplatsDetalj;