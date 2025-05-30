import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface User {
  uid: string
  email: string
  name: string
  role: "admin" | "voter"
  photoURL?: string
  provider?: "email" | "google"
  createdAt: Date
  emailVerified?: boolean
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: "select_account",
})

// Custom error messages for better user experience
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled. Please contact the administrator."
    case "auth/weak-password":
      return "Password should be at least 6 characters long."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection."
    default:
      return "An error occurred. Please try again."
  }
}

// Get current user
export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.createdAt?.toDate() || new Date(),
        emailVerified: firebaseUser.emailVerified,
        photoURL: userData.photoURL || firebaseUser.photoURL,
        provider: userData.provider || "email",
      } as User
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || firebaseUser.displayName || "User",
        role: userData.role || "voter",
        photoURL: firebaseUser.photoURL || userData.photoURL || undefined,
        provider: userData.provider || "email",
        createdAt: userData.createdAt?.toDate() || new Date(),
        emailVerified: firebaseUser.emailVerified,
      }
    } else {
      throw new Error("User data not found")
    }
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code) || "Failed to sign in")
  }
}

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: "admin" | "voter" = "voter",
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Update the user's display name
    await updateProfile(firebaseUser, { displayName: name })

    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name,
      role,
      provider: "email",
      createdAt: new Date(),
      emailVerified: firebaseUser.emailVerified,
    }

    // Save user data to Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name,
      role,
      provider: "email",
      createdAt: serverTimestamp(),
      emailVerified: false,
    })

    // Send email verification
    try {
      await sendEmailVerification(firebaseUser)
    } catch (verificationError) {
      console.log("Email verification not sent:", verificationError)
      // Don't throw error for verification failure
    }

    return userData
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code) || "Failed to create account")
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

    let userData: User

    if (userDoc.exists()) {
      // Existing user
      const existingData = userDoc.data()
      userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: existingData.name || firebaseUser.displayName || "User",
        role: existingData.role || "voter",
        photoURL: firebaseUser.photoURL || existingData.photoURL || undefined,
        provider: "google",
        createdAt: existingData.createdAt?.toDate() || new Date(),
        emailVerified: firebaseUser.emailVerified,
      }

      // Update last login
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        lastLogin: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
      })
    } else {
      // New user
      userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || "User",
        role: "voter",
        photoURL: firebaseUser.photoURL || undefined,
        provider: "google",
        createdAt: new Date(),
        emailVerified: firebaseUser.emailVerified,
      }

      // Save new user data to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || "User",
        role: "voter",
        provider: "google",
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
      })
    }

    return userData
  } catch (error: any) {
    console.error("Google sign-in error:", error)
    throw new Error(error.message || "Failed to sign in with Google")
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error("Sign-out error:", error)
    throw new Error(getErrorMessage(error.code) || "Failed to sign out")
  }
}

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name || firebaseUser.displayName || "User",
            role: userData.role || "voter",
            photoURL: firebaseUser.photoURL || userData.photoURL || undefined,
            provider: userData.provider || "email",
            createdAt: userData.createdAt?.toDate() || new Date(),
            emailVerified: firebaseUser.emailVerified,
          }
          callback(user)
        } else {
          callback(null)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}

// Update user profile
export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error("No user logged in")
  }

  try {
    // Update Firebase Auth profile if name is being updated
    if (updates.name && updates.name !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: updates.name })
    }

    // Update Firestore document
    await updateDoc(doc(db, "users", currentUser.uid), updates)

    // Get updated user data
    const userDoc = await getDoc(doc(db, "users", currentUser.uid))
    return userDoc.data() as User
  } catch (error: any) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile")
  }
}

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new Error("No user logged in")
  }

  try {
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)
  } catch (error: any) {
    console.error("Password change error:", error)

    switch (error.code) {
      case "auth/wrong-password":
        throw new Error("Current password is incorrect")
      case "auth/weak-password":
        throw new Error("New password should be at least 6 characters long")
      default:
        throw new Error("Failed to change password")
    }
  }
}

// Check if Firebase Auth is properly configured
export const checkAuthConfiguration = async (): Promise<boolean> => {
  try {
    // Try to create a test user with a dummy email to check if auth is enabled
    // This will fail gracefully if auth is not configured
    await createUserWithEmailAndPassword(auth, "test@test.com", "test123")
    return true
  } catch (error: any) {
    if (error.code === "auth/operation-not-allowed") {
      return false
    }
    // Other errors might be expected (like email already in use)
    return true
  }
}
