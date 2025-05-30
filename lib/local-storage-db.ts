import { v4 as uuidv4 } from "uuid"

// Define interfaces for our data types
export interface User {
  uid: string
  email: string
  displayName?: string
  role?: string
  photoURL?: string
}

export interface Election {
  id: string
  title: string
  description: string
  startDate: string | Date
  endDate: string | Date
  positions: string[]
  status: string
  createdBy: string
}

export interface Candidate {
  id: string
  name: string
  position: string
  bio: string
  photoURL?: string
  electionId: string
  voteCount?: number
}

export interface Vote {
  id: string
  userId: string
  candidateId: string
  electionId: string
  position: string
  timestamp: string
}

// Storage keys
const STORAGE_KEYS = {
  USERS: "votesecure_users",
  ELECTIONS: "votesecure_elections",
  CANDIDATES: "votesecure_candidates",
  VOTES: "votesecure_votes",
  CURRENT_USER: "votesecure_current_user",
  SETTINGS: "votesecure_settings",
}

// Helper functions
const getStorageData = (key: string): any[] => {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`Error reading ${key}: ${error}`)
    return []
  }
}

const setStorageData = (key: string, data: any[]): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error writing ${key}:`, error)
  }
}

// Database class
export class LocalStorageDB {
  // Users
  static getUsers(): User[] {
    return getStorageData(STORAGE_KEYS.USERS) as User[]
  }

  static saveUser(user: User): void {
    const users = this.getUsers()
    const existingIndex = users.findIndex((u) => u.email === user.email)

    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }

    setStorageData(STORAGE_KEYS.USERS, users)
  }

  static deleteUser(uid: string): void {
    const users = this.getUsers().filter((u) => u.uid !== uid)
    setStorageData(STORAGE_KEYS.USERS, users)
  }

  // Elections
  static getElections(): Election[] {
    return getStorageData(STORAGE_KEYS.ELECTIONS) as Election[]
  }

  static saveElection(election: Election): string {
    const elections = this.getElections()

    if (!election.id) {
      election.id = uuidv4()
    }

    const existingIndex = elections.findIndex((e) => e.id === election.id)

    if (existingIndex >= 0) {
      elections[existingIndex] = election
    } else {
      elections.push(election)
    }

    setStorageData(STORAGE_KEYS.ELECTIONS, elections)
    return election.id
  }

  static deleteElection(id: string): void {
    const elections = this.getElections().filter((e) => e.id !== id)
    setStorageData(STORAGE_KEYS.ELECTIONS, elections)

    // Clean up related data
    const candidates = this.getCandidates().filter((c) => c.electionId !== id)
    setStorageData(STORAGE_KEYS.CANDIDATES, candidates)

    const votes = this.getVotes().filter((v) => v.electionId !== id)
    setStorageData(STORAGE_KEYS.VOTES, votes)
  }

  // Candidates
  static getCandidates(): Candidate[] {
    return getStorageData(STORAGE_KEYS.CANDIDATES) as Candidate[]
  }

  static saveCandidate(candidate: Candidate): string {
    const candidates = this.getCandidates()

    if (!candidate.id) {
      candidate.id = uuidv4()
    }

    const existingIndex = candidates.findIndex((c) => c.id === candidate.id)

    if (existingIndex >= 0) {
      candidates[existingIndex] = candidate
    } else {
      candidates.push(candidate)
    }

    setStorageData(STORAGE_KEYS.CANDIDATES, candidates)
    return candidate.id
  }

  static deleteCandidate(id: string): void {
    const candidates = this.getCandidates().filter((c) => c.id !== id)
    setStorageData(STORAGE_KEYS.CANDIDATES, candidates)

    // Clean up votes
    const votes = this.getVotes().filter((v) => v.candidateId !== id)
    setStorageData(STORAGE_KEYS.VOTES, votes)
  }

  // Votes
  static getVotes(): Vote[] {
    return getStorageData(STORAGE_KEYS.VOTES) as Vote[]
  }

  static saveVote(vote: Vote): string {
    const votes = this.getVotes()

    if (!vote.id) {
      vote.id = uuidv4()
    }

    // Check for duplicate votes
    const existingVote = votes.find(
      (v) => v.userId === vote.userId && v.electionId === vote.electionId && v.position === vote.position,
    )

    if (existingVote) {
      throw new Error("You have already voted for this position")
    }

    votes.push(vote)
    setStorageData(STORAGE_KEYS.VOTES, votes)

    // Update candidate vote count
    this.updateCandidateVoteCount(vote.candidateId)

    return vote.id
  }

  static updateCandidateVoteCount(candidateId: string): void {
    const candidates = this.getCandidates()
    const votes = this.getVotes()

    const candidateIndex = candidates.findIndex((c) => c.id === candidateId)
    if (candidateIndex >= 0) {
      const voteCount = votes.filter((v) => v.candidateId === candidateId).length
      candidates[candidateIndex].voteCount = voteCount
      setStorageData(STORAGE_KEYS.CANDIDATES, candidates)
    }
  }

  // Current User
  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  static setCurrentUser(user: User | null): void {
    if (typeof window === "undefined") return
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      }
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  }

  // Utility methods
  static clearAllData(): void {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  static exportData(): string {
    const data = {
      users: this.getUsers(),
      elections: this.getElections(),
      candidates: this.getCandidates(),
      votes: this.getVotes(),
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)

      if (data.users) setStorageData(STORAGE_KEYS.USERS, data.users)
      if (data.elections) setStorageData(STORAGE_KEYS.ELECTIONS, data.elections)
      if (data.candidates) setStorageData(STORAGE_KEYS.CANDIDATES, data.candidates)
      if (data.votes) setStorageData(STORAGE_KEYS.VOTES, data.votes)

      console.log("Data imported successfully")
    } catch (error) {
      console.error("Error importing data:", error)
      throw new Error("Invalid data format")
    }
  }
}

// Default export
export default LocalStorageDB
