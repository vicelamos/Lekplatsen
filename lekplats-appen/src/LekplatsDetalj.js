// src/LekplatsDetalj.js (Helt ny version)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaStar, FaRegStar, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Importera karusellens CSS
import { Carousel } from 'react-responsive-carousel';

import Accordion from './Accordion';
import CheckinForm from './CheckinForm';

// Standardbild om en lekplats saknar bild
const BILD_SAKNAS_URL = "https://firebasestorage.googleapis.com/v0/b/lekplatsen-907fb.firebasestorage.app/o/bild%20saknas.png?alt=media&token=3acbfa69-dea8-456b-bbe2-dd95034f773f";

// Hjälpkomponent för att visa stjärnor
const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);
  return (
    <span className="star-rating">
      {[...Array(totalStars)].map((_, index) => 
        index < filledStars 
          ? <FaStar key={index} className="filled-star" /> 
          : <FaRegStar key={index} className="empty-star" />
      )}
    </span>
  );
};

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
      }

      const incheckningarCollection = collection(db, 'incheckningar');
      const q = query(incheckningarCollection, where("lekplatsId", "==", id), orderBy("timestamp", "desc"));
      
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

  // Skapa en lista med bara de incheckningar som har en bild
  const bilderForKarusell = incheckningar.filter(ic => ic.bildUrl);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lekplats.position.latitude},${lekplats.position.longitude}`;
  
  // Funktion för att göra första bokstaven stor
  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

return (
    <div className="detail-container">
      <img src={lekplats.bildUrl || BILD_SAKNAS_URL} alt={lekplats.namn} className="detail-header-image" />

      <h1 className="detail-title">{lekplats.namn}</h1>

      <div className="info-box">
        {/* De fyra första informationsrutorna (oförändrade) */}
        <div className="info-item">
          <span className="icon"><FaStar /></span>
          <div>
            <StarRating rating={lekplats.snittbetyg} />
            <strong> {lekplats.snittbetyg.toFixed(1)} / 5.0</strong>
          </div>
        </div>
        <div className="info-item">
          <span className="icon"><FaUsers /></span>
          <span>{lekplats.antalIncheckningar} incheckningar</span>
        </div>
        <div className="info-item">
          <span className="icon"><FaMapMarkerAlt /></span>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            {lekplats.adress || "Adress saknas"}
          </a>
        </div>
        <div className="info-item">
          <span className="icon"><FaMapMarkerAlt /></span>
          <span>{lekplats.kommun}</span>
        </div>
        
        {/* --- NY, UPPDATERAD BESKRIVNINGS-DEL --- */}
        {lekplats.beskrivning && (
          <div className="info-item-fullwidth">
            <h3>
              <span className="icon"><FaInfoCircle /></span>
              Beskrivning
            </h3>
            <p>{lekplats.beskrivning}</p>
          </div>
        )}
      </div>
      
      <Accordion title="Utrustning">
        <ul>
          {lekplats.utrustning?.length > 0 
            ? lekplats.utrustning.map(item => <li key={item}>{capitalizeFirstLetter(item)}</li>)
            : <li>Information om utrustning saknas.</li>
          }
        </ul>
      </Accordion>
      <Accordion title="Faciliteter">
        <ul>
          {lekplats.faciliteter?.length > 0
            ? lekplats.faciliteter.map(item => <li key={item}>{capitalizeFirstLetter(item)}</li>)
            : <li>Information om faciliteter saknas.</li>
          }
        </ul>
      </Accordion>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        {user ? (
          showCheckinForm 
            ? <CheckinForm user={user} lekplatsId={id} onCheckinSuccess={() => setShowCheckinForm(false)} />
            // 4. Applicera den nya knapp-stilen
            : <button onClick={() => setShowCheckinForm(true)} className="button-primary">Checka in på denna lekplats</button>
        ) : (
          <p><Link to="/login" className="button-primary">Logga in för att checka in</Link></p>
        )}
      </div>

      {bilderForKarusell.length > 0 && (
        <div className="image-carousel">
          <h2>Bilder från besökare</h2>
          <Carousel showThumbs={false} infiniteLoop useKeyboardArrows autoPlay>
            {bilderForKarusell.map(bild => (
              <div key={bild.id}>
                <img src={bild.bildUrl} alt={`Incheckningsbild från ${bild.userSmeknamn}`} />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <div className="checkin-feed">
        <h2>Senaste incheckningarna</h2>
        {incheckningar.length > 0 ? (
          incheckningar.map(ic => (
            <div key={ic.id} className="checkin-card">
              <div className="checkin-card-header">
                <strong>{ic.userSmeknamn}</strong>
                <span><FaCalendarAlt /> {ic.timestamp?.toDate().toLocaleDateString('sv-SE')}</span>
              </div>
              {/* 6. Visa betyget med stjärnor */}
              <p><StarRating rating={ic.betyg} /> ({ic.betyg}/5)</p>
              <p>{ic.kommentar}</p>
            </div>
          ))
        ) : (
          <p>Det finns inga incheckningar för denna lekplats ännu.</p>
        )}
      </div>
    </div>
  );
}

export default LekplatsDetalj;