// src/NyLekplatsForm.js (Komplett och slutgiltig version)

import React, { useState, useCallback, useEffect } from 'react'; // Lägg till useEffect
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc, GeoPoint } from 'firebase/firestore'; // Lägg till doc, getDoc
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';

// Kartans inställningar
const libraries = ["places"];
const mapContainerStyle = {
  height: "400px",
  width: "100%",
  borderRadius: "15px",
};
const center = { // Start-position för kartan (centrala Borås)
  lat: 57.72103,
  lng: 12.9401,
};

function NyLekplatsForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namn: '',
    adress: '',
    kommun: 'Borås',
    beskrivning: '',
  });
  const [bild, setBild] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // States för dynamiska checkboxes
  const [allaAlternativ, setAllaAlternativ] = useState({ utrustning: [], faciliteter: [] });
  const [valdaAlternativ, setValdaAlternativ] = useState({ utrustning: [], faciliteter: [] });

  // Ladda Google Maps-skriptet
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Hämta konfigurationen för checkboxes när komponenten laddas
  useEffect(() => {
    const hamtaKonfiguration = async () => {
      const docRef = doc(db, "konfiguration", "alternativ");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAllaAlternativ(docSnap.data());
      } else {
        console.log("Kunde inte hitta konfigurationsdokument!");
      }
    };
    hamtaKonfiguration();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleBildChange = (e) => {
    if (e.target.files[0]) {
      setBild(e.target.files[0]);
    }
  };

  // Funktion för de dynamiska checkboxarna
  const handleCheckboxChange = (e) => {
    const { name, checked, dataset } = e.target;
    const { category } = dataset;
    if (checked) {
      setValdaAlternativ(prevState => ({
        ...prevState,
        [category]: [...prevState[category], name]
      }));
    } else {
      setValdaAlternativ(prevState => ({
        ...prevState,
        [category]: prevState[category].filter(item => item !== name)
      }));
    }
  };

  const onMapClick = useCallback((e) => {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marker) {
      alert("Välj en position på kartan!");
      return;
    }
    setLoading(true);

    let bildUrl = '';
    if (bild) {
      try {
        const storage = getStorage();
        const bildRef = ref(storage, `lekplats_bilder/${Date.now()}_${bild.name}`);
        const uploadResult = await uploadBytes(bildRef, bild);
        bildUrl = await getDownloadURL(uploadResult.ref);
      } catch (error) {
        console.error("Fel vid bilduppladdning: ", error);
        alert("Något gick fel med bilduppladdningen.");
        setLoading(false);
        return;
      }
    }

    try {
      const newPlayground = {
        ...formData,
        bildUrl: bildUrl,
        position: new GeoPoint(marker.lat, marker.lng),
        status: 'publicerad',
        snittbetyg: 0,
        antalIncheckningar: 0,
        utrustning: valdaAlternativ.utrustning, // Spara den valda utrustningen
        faciliteter: valdaAlternativ.faciliteter, // Spara de valda faciliteterna
      };

      const docRef = await addDoc(collection(db, 'lekplatser'), newPlayground);
      navigate(`/lekplats/${docRef.id}`);
    } catch (error) {
      console.error("Fel vid sparande av dokument: ", error);
      alert("Något gick fel, kunde inte spara lekplatsen.");
      setLoading(false);
    }
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Lägg till ny lekplats</h2>
      
      <div className="form-group">
        <label>Namn:</label>
        <input type="text" name="namn" value={formData.namn} onChange={handleTextChange} required />
      </div>
      
      <div className="form-group">
        <label>Huvudbild för lekplatsen:</label>
        <input type="file" onChange={handleBildChange} accept="image/*" />
      </div>

      <div className="form-group">
        <label>Välj position på kartan:</label>
        <GoogleMap
          id="map"
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          onClick={onMapClick}
        >
          {marker && <MarkerF position={{ lat: marker.lat, lng: marker.lng }} />}
        </GoogleMap>
        {marker && <p>Position vald: Lat: {marker.lat.toFixed(4)}, Lng: {marker.lng.toFixed(4)}</p>}
      </div>

      <div className="form-group">
        <label>Adress (frivilligt):</label>
        <input type="text" name="adress" value={formData.adress} onChange={handleTextChange} />
      </div>

      <div className="form-group">
        <label>Beskrivning (frivilligt):</label>
        <textarea name="beskrivning" value={formData.beskrivning} onChange={handleTextChange} />
      </div>
      
      {/* Återinförda dynamiska checkboxes */}
 <div className="fieldset">
        <h3>Utrustning</h3>
        <div className="checkbox-container">
          {allaAlternativ.utrustning.map(item => (
            <div key={item} className="checkbox-group">
              {/* ... din input och label är oförändrade ... */}
              <input 
                type="checkbox" 
                name={item}
                id={`utrustning-${item}`}
                data-category="utrustning"
                checked={valdaAlternativ.utrustning.includes(item)}
                onChange={handleCheckboxChange}
              />
              <label htmlFor={`utrustning-${item}`}>{item.charAt(0).toUpperCase() + item.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>

<div className="fieldset">
        <h3>Faciliteter</h3>
        <div className="checkbox-container">
          {allaAlternativ.faciliteter.map(item => (
            <div key={item} className="checkbox-group">
              {/* ... din input och label är oförändrade ... */}
              <input 
                type="checkbox" 
                name={item}
                id={`faciliteter-${item}`}
                data-category="faciliteter"
                checked={valdaAlternativ.faciliteter.includes(item)}
                onChange={handleCheckboxChange}
              />
              <label htmlFor={`faciliteter-${item}`}>{item.charAt(0).toUpperCase() + item.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading}>{loading ? "Sparar..." : "Spara lekplats"}</button>
    </form>
  );
}

export default NyLekplatsForm;