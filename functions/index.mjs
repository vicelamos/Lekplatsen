// functions/index.mjs

import { onUserCreate } from "firebase-functions/v2/auth";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const createUserProfile = onUserCreate((event) => {
  const user = event.data;
  logger.info("Ny användare:", user.uid, "Skapar profil.");

  const userRef = db.collection("users").doc(user.uid);
  const defaultSmeknamn = user.email.split("@")[0];

  return userRef.set({
    email: user.email,
    smeknamn: defaultSmeknamn,
    skapades: new Date(),
    profilbildUrl: "",
  });
});

export const updatePlaygroundStats = onDocumentCreated("incheckningar/{checkinId}", async (event) => {
  const snap = event.data;
  if (!snap) {
    return logger.warn("Ingen data i eventet, avbryter.");
  }
  const checkinData = snap.data();
  const lekplatsId = checkinData.lekplatsId;

  if (!lekplatsId) {
    return logger.warn("Incheckningen saknar lekplatsId. Avbryter.");
  }
  logger.info(`Uppdaterar statistik för lekplats: ${lekplatsId}`);

  const playgroundRef = db.collection("lekplatser").doc(lekplatsId);
  const checkinsSnapshot = await db
      .collection("incheckningar")
      .where("lekplatsId", "==", lekplatsId)
      .get();

  const antalIncheckningar = checkinsSnapshot.size;

  let totalBetyg = 0;
  checkinsSnapshot.forEach((doc) => {
    totalBetyg += doc.data().betyg;
  });

  const snittbetyg = antalIncheckningar > 0 ? totalBetyg / antalIncheckningar : 0;

  logger.info(`Snitt: ${snittbetyg.toFixed(2)}, Antal: ${antalIncheckningar}`);
  return playgroundRef.update({
    antalIncheckningar,
    snittbetyg,
  });
});