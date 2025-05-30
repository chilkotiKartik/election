import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAspdVwIqnnZseadCWeRHV1taw4dz1gZCU",
  authDomain: "vote-5bac6.firebaseapp.com",
  databaseURL: "https://vote-5bac6-default-rtdb.firebaseio.com",
  projectId: "vote-5bac6",
  storageBucket: "vote-5bac6.firebasestorage.app",
  messagingSenderId: "653631856521",
  appId: "1:653631856521:web:bc6ebcece27477ba4c8b58",
  measurementId: "G-GM4S27M051",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser)
let analytics = null
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

// Development emulators (uncomment for local development)
// if (typeof window !== "undefined" && window.location.hostname === "localhost") {
//   connectAuthEmulator(auth, "http://localhost:9099")
//   connectFirestoreEmulator(db, "localhost", 8080)
//   connectStorageEmulator(storage, "localhost", 9199)
// }

export { analytics }
export default app
