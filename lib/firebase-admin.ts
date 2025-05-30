// This would typically be used in a server environment
// For now, we'll handle data import through the client with proper error handling

export const FIREBASE_ERRORS = {
  "auth/operation-not-allowed": "Email/password authentication is not enabled in Firebase Console",
  "auth/weak-password": "Password should be at least 6 characters",
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-email": "Invalid email address format",
  "auth/user-not-found": "No user found with this email",
  "auth/wrong-password": "Incorrect password",
}

export const getFirebaseErrorMessage = (errorCode: string): string => {
  return FIREBASE_ERRORS[errorCode as keyof typeof FIREBASE_ERRORS] || errorCode
}
