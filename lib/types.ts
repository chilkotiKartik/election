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

export interface Election {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: "draft" | "active" | "completed"
  candidates: string[]
  totalVotes: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  allowedVoters?: string[]
  settings: {
    allowMultipleVotes: boolean
    requireVerification: boolean
    showResults: "never" | "after_voting" | "live"
  }
}

export interface Candidate {
  id: string
  name: string
  description: string
  imageUrl?: string
  electionId: string
  votes: number
  createdAt: Date
  updatedAt: Date
}

export interface Vote {
  id: string
  electionId: string
  candidateId: string
  voterId: string
  timestamp: Date
  verified: boolean
}

export interface VoteResult {
  candidateId: string
  candidateName: string
  votes: number
  percentage: number
}

export interface ElectionStats {
  totalElections: number
  activeElections: number
  totalVotes: number
  totalCandidates: number
}
