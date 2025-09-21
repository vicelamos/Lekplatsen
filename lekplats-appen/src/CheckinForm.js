// src/CheckinForm.js (Uppdaterad fil)
import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 1. Ta emot 'onCheckinSuccess' som en prop här
function CheckinForm({ user, lekplatsId, onCheckinSuccess }) {
  const [betyg, setBetyg] = useState(3);
  const [kommentar, setKommentar] = useState('');
  const [bild, setBild] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBildChange = (e) => {
    if (e.target.files[0]) {
      setBild(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let bildUrl = '';

    // Ladda upp bilden om en fil har valts
    if (bild) {
      const storage = getStorage();
      const bildRef = ref(storage, `incheckningar/${user.uid}/${Date.now()}_${bild.name}`);
      const uploadResult = await uploadBytes(bildRef, bild);
      bildUrl = await getDownloadURL(uploadResult.ref);
    }

    // Skapa incheckningsdokumentet i Firestore
    await addDoc(collection(db, 'incheckningar'), {
      lekplatsId: lekplatsId,
      userId: user.uid,
      userSmeknamn: user.email.split('@')[0], // Enkel version av smeknamn
      timestamp: serverTimestamp(),
      betyg: Number(betyg),
      kommentar: kommentar,
      bildUrl: bildUrl, // Kan vara tom sträng
    });

    // Återställ formuläret
    setBetyg(3);
    setKommentar('');
    setBild(null);
    setLoading(false);
    
    // 2. Anropa funktionen för att dölja formuläret istället för att ladda om sidan
    onCheckinSuccess(); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Checka in!</h3>
      <label>Betyg (1-5):</label>
      <input type="number" min="1" max="5" value={betyg} onChange={(e) => setBetyg(e.target.value)} required />
      
      <label>Kommentar:</label>
      <textarea value={kommentar} onChange={(e) => setKommentar(e.target.value)} />
      
      <label>Ladda upp bild:</label>
      <input type="file" onChange={handleBildChange} />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sparar...' : 'Skicka incheckning'}
      </button>
    </form>
  );
}

export default CheckinForm;