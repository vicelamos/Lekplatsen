// src/NyLekplatsForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc, GeoPoint } from 'firebase/firestore';

function NyLekplatsForm() {
  const navigate = useNavigate();

  // State för all textdata i formuläret
  const [textData, setTextData] = useState({
    namn: '',
    adress: '',
    kommun: 'Borås',
    beskrivning: '',
    latitud: '',
    longitud: '',
  });

  // NYTT: State för att hålla ALLA möjliga val vi hämtar från databasen
  const [allaAlternativ, setAllaAlternativ] = useState({ utrustning: [], faciliteter: [] });

  // NYTT: State för att hålla de val ANVÄNDAREN har gjort (listor med textsträngar)
  const [valdaAlternativ, setValdaAlternativ] = useState({ utrustning: [], faciliteter: [] });

  // NYTT: Hämta konfigurationen när komponenten laddas
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

  // Funktion för textfälten (oförändrad)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTextData(prevState => ({ ...prevState, [name]: value }));
  };

  // NY, smartare funktion för checkboxes
  const handleCheckboxChange = (e) => {
    const { name, checked, dataset } = e.target;
    const { category } = dataset; // "utrustning" eller "faciliteter"

    // Om ikryssad, lägg till i listan. Om urkryssad, ta bort från listan.
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPlayground = {
        ...textData,
        utrustning: valdaAlternativ.utrustning, // Spara den nya arrayen
        faciliteter: valdaAlternativ.faciliteter, // Spara den nya arrayen
        position: new GeoPoint(parseFloat(textData.latitud), parseFloat(textData.longitud)),
        status: 'publicerad',
        snittbetyg: 0,
        antalIncheckningar: 0,
      };
      delete newPlayground.latitud;
      delete newPlayground.longitud;

      const docRef = await addDoc(collection(db, 'lekplatser'), newPlayground);
      navigate(`/lekplats/${docRef.id}`);
    } catch (error) {
      console.error("Fel vid sparande av dokument: ", error);
      alert("Något gick fel, kunde inte spara lekplatsen.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: '600px', margin: '0 auto', textAlign: 'left'}}>
      <h2>Lägg till ny lekplats</h2>
      
      {/* Textfälten är i princip oförändrade */}
      <label>Namn:</label>
      <input type="text" name="namn" value={textData.namn} onChange={handleChange} required />
      {/* ... andra textfält som adress, beskrivning etc. ... */}
      <label>Latitud:</label>
      <input type="number" step="any" name="latitud" value={textData.latitud} onChange={handleChange} required />
      <label>Longitud:</label>
      <input type="number" step="any" name="longitud" value={textData.longitud} onChange={handleChange} required />

      {/* ---- NYTT: Dynamiskt genererade checkboxes ---- */}
      <h3>Utrustning</h3>
      {allaAlternativ.utrustning.map(item => (
        <div key={item}>
          <input 
            type="checkbox" 
            name={item}
            data-category="utrustning"
            checked={valdaAlternativ.utrustning.includes(item)}
            onChange={handleCheckboxChange}
          />
          <label>{item.charAt(0).toUpperCase() + item.slice(1)}</label> {/* Gör första bokstaven stor */}
        </div>
      ))}

      <h3>Faciliteter</h3>
      {allaAlternativ.faciliteter.map(item => (
        <div key={item}>
          <input 
            type="checkbox" 
            name={item}
            data-category="faciliteter"
            checked={valdaAlternativ.faciliteter.includes(item)}
            onChange={handleCheckboxChange}
          />
          <label>{item.charAt(0).toUpperCase() + item.slice(1)}</label>
        </div>
      ))}

      <button type="submit">Spara lekplats</button>
    </form>
  );
}

export default NyLekplatsForm;