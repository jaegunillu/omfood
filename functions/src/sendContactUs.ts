import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
const corsHandler = cors({
  origin: [
    "http://localhost:3000",
    "https://omfood-2024.web.app",
    "https://omfood-2024.firebaseapp.com",
  ],
  credentials: true,
});

export const sendContactUs = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({error: "Method Not Allowed"});
    }

    const {
      subject,
      productName,
      country,
      email,
      comments,
      agreedPrivacy,
      createdAt,
    } = req.body;

    // 필수값 체크
    if (!subject || !email || !comments || !agreedPrivacy) {
      return res.status(400).send({error: "Missing required fields."});
    }
    if (!emailRegex.test(email)) {
      return res.status(400).send({error: "Invalid email address."});
    }
    if (typeof agreedPrivacy !== "boolean" || agreedPrivacy !== true) {
      return res.status(400).send({
        error: "Privacy policy agreement required.",
      });
    }
    if (comments.length > 2000) {
      return res.status(400).send({
        error: "Comments too long (max 2000 chars).",
      });
    }

    try {
      await db.collection("contact_us").add({
        subject,
        productName: productName || "",
        country: country || "",
        email,
        comments,
        agreedPrivacy,
        createdAt:
          createdAt ?
            admin.firestore.Timestamp.fromDate(new Date(createdAt)) :
            admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).send({success: true});
    } catch (error) {
      console.error("🔥🔥🔥 ERROR in sendContactUs:", error);
      return res.status(500).send({error: "Failed to save inquiry."});
    }
  });
});
