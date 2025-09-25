// src/CheckinForm.js

import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaStar } from 'react-icons/fa'; // Importera stjärn-ikonen

function CheckinForm({ user, lekplatsId, onCheckinSuccess }) {
  const [betyg, setBetyg] = useState(0);
  const [hoverBetyg, setHoverBetyg] = useState(0); // För hovringseffekt på stjärnor
  const [kommentar, setKommentar] = useState('');
  const [bild, setBild] = useState(null);
  const [bildNamn, setBildNamn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBildChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBild(file);
      setBildNamn(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (betyg === 0) {
      alert("Vänligen välj ett betyg genom att klicka på en stjärna.");
      return;
    }
    setLoading(true);

    let bildUrl = '';
    if (bild) {
      const storage = getStorage();
      const bildRef = ref(storage, `incheckningar/${user.uid}/${Date.now()}_${bild.name}`);
      const uploadResult = await uploadBytes(bildRef, bild);
      bildUrl = await getDownloadURL(uploadResult.ref);
    }

    await addDoc(collection(db, 'incheckningar'), {
      lekplatsId: lekplatsId,
      userId: user.uid,
      userSmeknamn: user.email.split('@')[0],
      timestamp: serverTimestamp(),
      betyg: Number(betyg),
      kommentar: kommentar,
      bildUrl: bildUrl,
    });

    setLoading(false);
    onCheckinSuccess(); 
  };

   return (
    // Den vita rutan runt formuläret
    <div className="checkin-form-container">
      <form onSubmit={handleSubmit}>
        {/* Rubriken */}
        <h3>Checka in!</h3>
        
        <div className="form-group">
          {/* 1. Texten "Betyg:" är nu borttagen */}
          <div className="star-rating-input">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar 
                  key={ratingValue}
                  className={ratingValue <= (hoverBetyg || betyg) ? 'filled' : ''}
                  onClick={() => setBetyg(ratingValue)}
                  onMouseEnter={() => setHoverBetyg(ratingValue)}
                  onMouseLeave={() => setHoverBetyg(0)}
                />
              );
            })}
          </div>
        </div>
        
        <div className="form-group">
          {/* 2. "Kommentar:" är vänsterställd som standard */}
          <label>Kommentar:</label>
          <textarea value={kommentar} onChange={(e) => setKommentar(e.target.value)} />
        </div>

        <div className="form-group">
          {/* 3. Texten "Ladda upp bild:" är nu borttagen */}
          <div>
            {/* 4. Knappen har bytt namn till "Ladda upp bild" och är grön */}
            <label htmlFor="file-upload" className="input-file-label">
              Ladda upp bild
            </label>
            <input id="file-upload" className="input-file-hidden" type="file" onChange={handleBildChange} accept="image/*" />
            <span>{bildNamn || "Ingen fil har valts"}</span>
          </div>
        </div>
        
        <div className="form-action-center">
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Sparar...' : 'Skicka incheckning'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckinForm;