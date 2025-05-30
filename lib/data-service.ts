import {
  getElections as getLocalElections,
  saveElection as saveLocalElection,
  deleteElection as deleteLocalElection,
  getCandidates as getLocalCandidates,
  saveCandidate as saveLocalCandidate,
  deleteCandidate as deleteLocalCandidate,
  getVotes as getLocalVotes,
  saveVote as saveLocalVote,
  getUsers as getLocalUsers,
} from "./local-auth"
import type { Election, Candidate, Vote, User } from "./types"

// Elections
export const getElections = async (): Promise<Election[]> => {
  return getLocalElections()
}

export const getElection = async (id: string): Promise<Election | null> => {
  const elections = getLocalElections()
  return elections.find((e) => e.id === id) || null
}

export const saveElection = async (election: Election): Promise<string> => {
  return saveLocalElection(election)
}

export const deleteElection = async (id: string): Promise<void> => {
  return deleteLocalElection(id)
}

// Candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  return getLocalCandidates()
}

export const getElectionCandidates = async (electionId: string): Promise<Candidate[]> => {
  const candidates = getLocalCandidates()
  return candidates.filter((c) => c.electionId === electionId)
}

export const getCandidate = async (id: string): Promise<Candidate | null> => {
  const candidates = getLocalCandidates()
  return candidates.find((c) => c.id === id) || null
}

export const saveCandidate = async (candidate: Candidate): Promise<string> => {
  return saveLocalCandidate(candidate)
}

export const deleteCandidate = async (id: string): Promise<void> => {
  return deleteLocalCandidate(id)
}

// Votes
export const getVotes = async (): Promise<Vote[]> => {
  return getLocalVotes()
}

export const getElectionVotes = async (electionId: string): Promise<Vote[]> => {
  const votes = getLocalVotes()
  return votes.filter((v) => v.electionId === electionId)
}

export const getUserVotes = async (userId: string): Promise<Vote[]> => {
  const votes = getLocalVotes()
  return votes.filter((v) => v.userId === userId)
}

export const hasUserVotedForPosition = async (
  userId: string,
  electionId: string,
  position: string,
): Promise<boolean> => {
  const votes = getLocalVotes()
  return votes.some((v) => v.userId === userId && v.electionId === electionId && v.position === position)
}

export const saveVote = async (vote: Vote): Promise<string> => {
  return saveLocalVote(vote)
}

// Users
export const getUsers = async (): Promise<User[]> => {
  return getLocalUsers()
}

export const getVoters = async (): Promise<User[]> => {
  const users = getLocalUsers()
  return users.filter((u) => u.role === "voter")
}

export const getAdmins = async (): Promise<User[]> => {
  const users = getLocalUsers()
  return users.filter((u) => u.role === "admin")
}

// Stats
export const getElectionStats = async (
  electionId: string,
): Promise<{
  totalVotes: number
  candidateVotes: Record<string, number>
  positionVotes: Record<string, number>
}> => {
  const votes = getLocalVotes().filter((v) => v.electionId === electionId)
  const candidates = getLocalCandidates().filter((c) => c.electionId === electionId)

  const candidateVotes: Record<string, number> = {}
  const positionVotes: Record<string, number> = {}

  votes.forEach((vote) => {
    // Count votes by candidate
    candidateVotes[vote.candidateId] = (candidateVotes[vote.candidateId] || 0) + 1

    // Count votes by position
    positionVotes[vote.position] = (positionVotes[vote.position] || 0) + 1
  })

  return {
    totalVotes: votes.length,
    candidateVotes,
    positionVotes,
  }
}
