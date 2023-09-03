// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "@firebase/auth";
import { firebaseObj } from "./firebaseObj";

const app = initializeApp(firebaseObj);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };