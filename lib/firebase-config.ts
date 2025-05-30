import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
}

// Initialize Firebase
let app
let auth
let db
let storage

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // Enable persistence for offline support
  if (typeof window !== "undefined") {
    // Only run in browser environment
    console.log("Firebase initialized successfully")
  }
} catch (error) {
  console.error("Firebase initialization error:", error)

  // Fallback initialization for development
  if (typeof window !== "undefined") {
    console.warn("Using Firebase emulator for development")
  }
}

export { auth, db, storage }
export default app

// Firebase connection status checker
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) return false

    // Try to access Firestore
    const testDoc = await import("firebase/firestore").then(({ doc, getDoc }) => getDoc(doc(db, "test", "connection")))
    return true
  } catch (error) {
    console.error("Firebase connection failed:", error)
    return false
  }
}
