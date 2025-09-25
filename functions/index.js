// functions/index.js (Slutgiltig, förenklad version)

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Funktion 1: Skapar automatiskt ett profildokument i Firestore
 * när en ny användare registreras i Firebase Authentication.
 */
exports.createUserProfile = functions.auth.user().onCreate((user) => {
  console.log("Ny användare:", user.uid, "Skapar profil.");
  const defaultSmeknamn = user.email.split("@")[0];

  // Returnera Promise direkt från set()
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    smeknamn: defaultSmeknamn,
    skapades: admin.firestore.FieldValue.serverTimestamp(),
    profilbildUrl: "",
  });
});


/**
 * Funktion 2: Uppdaterar snittbetyg och antal incheckningar för en lekplats
 * varje gång en ny incheckning skapas för den.
 */
exports.updatePlaygroundStats = functions.firestore
    .document("incheckningar/{checkinId}")
    .onCreate(async (snap) => {
      const checkinData = snap.data();
      const lekplatsId = checkinData.lekplatsId;

      if (!lekplatsId) {
        return console.log("Incheckningen saknar lekplatsId. Avbryter.");
      }
      console.log(`Uppdaterar statistik för lekplats: ${lekplatsId}`);

      const playgroundRef = admin.firestore()
          .collection("lekplatser").doc(lekplatsId);

      const checkinsSnapshot = await admin.firestore()
          .collection("incheckningar")
          .where("lekplatsId", "==", lekplatsId)
          .get();

      const checkins = checkinsSnapshot.docs;
      const antalIncheckningar = checkins.length;

      let totalBetyg = 0;
      checkins.forEach((doc) => {
        totalBetyg += doc.data().betyg;
      });
      // Undvik division med noll
      const snittbetyg = antalIncheckningar > 0 ?
        totalBetyg / antalIncheckningar : 0;

      console.log(`Snitt: ${snittbetyg}, Antal: ${antalIncheckningar}`);
      return playgroundRef.update({
        antalIncheckningar: antalIncheckningar,
        snittbetyg: snittbetyg,
      });
    });
