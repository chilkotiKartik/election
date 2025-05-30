import { LocalStorageDB } from "./local-storage-db"
import type { User } from "./types"
import { v4 as uuidv4 } from "uuid"

export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    const users = LocalStorageDB.getUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      throw new Error("No account found with this email address")
    }

    if (user.password !== password) {
      throw new Error("Incorrect password")
    }

    LocalStorageDB.setCurrentUser(user)
    return user
  }

  static async signUp(email: string, password: string, name: string, role: "admin" | "voter" = "voter"): Promise<User> {
    const users = LocalStorageDB.getUsers()
    const existingUser = users.find((u) => u.email === email)

    if (existingUser) {
      throw new Error("An account with this email already exists")
    }

    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters long")
    }

    const newUser: User = {
      uid: uuidv4(),
      email,
      name,
      role,
      password,
      createdAt: new Date(),
    }

    LocalStorageDB.saveUser(newUser)
    LocalStorageDB.setCurrentUser(newUser)
    return newUser
  }

  static async signOut(): Promise<void> {
    LocalStorageDB.setCurrentUser(null)
  }

  static getCurrentUser(): User | null {
    return LocalStorageDB.getCurrentUser()
  }

  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Check immediately
    const user = this.getCurrentUser()
    callback(user)

    // Set up storage event listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "votesecure_current_user") {
        const user = this.getCurrentUser()
        callback(user)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }

    return () => {}
  }

  static async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    const updatedUser = { ...currentUser, ...updates }
    LocalStorageDB.saveUser(updatedUser)
    LocalStorageDB.setCurrentUser(updatedUser)
    return updatedUser
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.getCurrentUser()
    if (!user) {
      throw new Error("No user logged in")
    }

    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect")
    }

    if (newPassword.length < 6) {
      throw new Error("New password should be at least 6 characters long")
    }

    const updatedUser = { ...user, password: newPassword }
    LocalStorageDB.saveUser(updatedUser)
    LocalStorageDB.setCurrentUser(updatedUser)
  }
}
