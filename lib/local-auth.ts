import { v4 as uuidv4 } from "uuid"

// Type definitions
interface User {
  uid: string
  email: string
  name: string
  role: "admin" | "voter"
  password: string
  createdAt: Date
}

interface Election {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: "draft" | "active" | "completed"
  positions: string[]
  createdBy: string
  createdAt: Date
}

interface Candidate {
  id: string
  name: string
  position: string
  party?: string
  description: string
  imageUrl?: string
  electionId: string
  voteCount?: number
  createdAt: Date
}

interface Vote {
  id: string
  userId: string
  candidateId: string
  electionId: string
  position: string
  timestamp: Date
}

// Local storage keys
const USERS_KEY = "votesecure_users"
const CURRENT_USER_KEY = "votesecure_current_user"
const ELECTIONS_KEY = "votesecure_elections"
const CANDIDATES_KEY = "votesecure_candidates"
const VOTES_KEY = "votesecure_votes"

// Helper functions for localStorage
const getLocalData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting data from ${key}:`, error);
    return [];
  }
}

const setLocalData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error setting data to ${key}:`, error)
  }
}

// User management
export const getUsers = (): User[] => getLocalData<User>(USERS_KEY)

export const saveUser = (user: User): void => {
  const users = getUsers()
  const existingIndex = users.findIndex(u => u.email === user.email)
  
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  
  setLocalData(USERS_KEY, users)
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  } catch (error) {
    console.error('Error setting current user:', error)
  }
}

// Authentication functions
export const signIn = async (email: string, password: string): Promise<User> => {
  const users = getUsers()
  const user = users.find(u => u.email === email)
  
  if (!user) {
    throw new Error('No account found with this email address')
  }
  
  // In a real app, you'd hash and compare passwords
  // For demo purposes, we'll use a simple check
  if (password !== user.password) {
    throw new Error('Incorrect password')
  }
  
  setCurrentUser(user)
  return user
}

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'voter' = 'voter'
): Promise<User> => {
  const users = getUsers()
  const existingUser = users.find(u => u.email === email)
  
  if (existingUser) {
    throw new Error('An account with this email already exists')
  }
  
  if (password.length < 6) {
    throw new Error('Password should be at least 6 characters long')
  }
  
  const newUser: User = {
    uid: uuidv4(),
    email,
    name,
    role,
    password, // In a real app, you'd hash this
    createdAt: new Date(),
  }
  
  saveUser(newUser)
  setCurrentUser(newUser)
  return newUser
}

export const signOut = async (): Promise<void> => {
  setCurrentUser(null)
}

export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  // Check immediately
  const user = getCurrentUser()
  callback(user)
  
  // Set up event listener for storage changes
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === CURRENT_USER_KEY) {
      const user = getCurrentUser()
      callback(user)
    }
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }
  
  return () => {}
}

// Election management
export const getElections = (): Election[] => getLocalData<Election>(ELECTIONS_KEY)

export const saveElection = (election: Election): string => {
  const elections = getElections()
  
  if (!election.id) {
    election.id = uuidv4()
  }
  
  const existingIndex = elections.findIndex(e => e.id === election.id)
  
  if (existingIndex >= 0) {
    elections[existingIndex] = election
  } else {
    elections.push(election)
  }
  
  setLocalData(ELECTIONS_KEY, elections)
  return election.id
}

export const deleteElection = (id: string): void => {
  const elections = getElections()
  const filteredElections = elections.filter(e => e.id !== id)
  setLocalData(ELECTIONS_KEY, filteredElections)
  
  // Also delete related candidates and votes
  const candidates = getCandidates()
  const filteredCandidates = candidates.filter(c => c.electionId !== id)
  setLocalData(CANDIDATES_KEY, filteredCandidates)
  
  const votes = getVotes()
  const filteredVotes = votes.filter(v => v.electionId !== id)
  setLocalData(VOTES_KEY, filteredVotes)
}

// Candidate management
export const getCandidates = (): Candidate[] => getLocalData<Candidate>(CANDIDATES_KEY)

export const saveCandidate = (candidate: Candidate): string => {
  const candidates = getCandidates()
  
  if (!candidate.id) {
    candidate.id = uuidv4()
  }
  
  const existingIndex = candidates.findIndex(c => c.id === candidate.id)
  
  if (existingIndex >= 0) {
    candidates[existingIndex] = candidate
  } else {
    candidates.push(candidate)
  }
  
  setLocalData(CANDIDATES_KEY, candidates)
  return candidate.id
}

export const deleteCandidate = (id: string): void => {
  const candidates = getCandidates()
  const filteredCandidates = candidates.filter(c => c.id !== id)
  setLocalData(CANDIDATES_KEY, filteredCandidates)
  
  // Also delete related votes
  const votes = getVotes()
  const filteredVotes = votes.filter(v => v.candidateId !== id)
  setLocalData(VOTES_KEY, filteredVotes)
}

// Vote management
export const getVotes = (): Vote[] => getLocalData<Vote>(VOTES_KEY)

export const saveVote = (vote: Vote): string => {
  const votes = getVotes()
  
  if (!vote.id) {
    vote.id = uuidv4()
  }
  
  // Check if user already voted for this position in this election
  const existingVote = votes.find(
    v => v.userId === vote.userId && 
         v.electionId === vote.electionId && 
         v.position === vote.position
  )
  
  if (existingVote) {
    throw new Error('You have already voted for this position')
  }
  
  votes.push(vote)
  setLocalData(VOTES_KEY, votes)
  
  // Update candidate vote count
  const candidates = getCandidates()
  const candidateIndex = candidates.findIndex(c => c.id === vote.candidateId)
  
  if (candidateIndex >= 0) {
    candidates[candidateIndex].voteCount = (candidates[candidateIndex].voteCount || 0) + 1
    setLocalData(CANDIDATES_KEY, candidates)
  }
  
  return vote.id
}

// Clear all data (for testing)
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USERS_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(ELECTIONS_KEY)
  localStorage.removeItem(CANDIDATES_KEY)
  localStorage.removeItem(VOTES_KEY)
}
