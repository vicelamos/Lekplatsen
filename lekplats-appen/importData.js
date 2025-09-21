// importData.js

const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');

// ---- Konfiguration ----
// Hämta din service account key
const serviceAccount = require('./serviceAccountKey.json');
// Sökvägen till din CSV-fil
const csvFilePath = './boras_lekplatser.csv';
// Namnet på samlingen i Firestore du vill fylla på
const collectionName = 'lekplatser';
// ---------------------

// Initiera Firebase Admin med dina uppgifter
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionRef = db.collection(collectionName);

// Läs CSV-filen
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', async (row) => {
    try {
      // ---- Omvandla data från CSV-raden till rätt format ----
      const playgroundData = {
        namn: row.namn || '',
        adress: row.adress || '',
        kommun: row.kommun || '',
        beskrivning: row.beskrivning || '',

        // Skapa ett GeoPoint-objekt för positionen
        position: new admin.firestore.GeoPoint(
          parseFloat(row.latitud),
          parseFloat(row.longitud)
        ),

        // Omvandla "JA"/"NEJ" till true/false för utrustning
        utrustning: {
          gungor: row.gungor === 'JA',
          rutschkana: row.rutschkana === 'JA',
          hinderbana: row.hinderbana === 'JA',
          sandlada: row.sandlada === 'JA'
        },

        // Omvandla "JA"/"NEJ" till true/false för faciliteter
        faciliteter: {
          grillplats: row.grillplats === 'JA',
          toalett: row.toalett === 'JA',
          parkering: row.parkering === 'JA',
          handikappanpassad: row.handikappanpassad === 'JA'
        },

        // Sätt några standardvärden
        status: 'publicerad',
        snittbetyg: 0,
        antalIncheckningar: 0,
      };

      // Lägg till det nya dokumentet i Firestore
      await collectionRef.add(playgroundData);
      console.log(`Lade till: ${playgroundData.namn}`);

    } catch (error) {
      console.error('Fel vid hantering av rad:', row, error);
    }
  })
  .on('end', () => {
    console.log('-----------------------------------');
    console.log('CSV-filen har bearbetats färdigt.');
    console.log('-----------------------------------');
  });