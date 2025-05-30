"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, ArrowLeft, VoteIcon } from "lucide-react"
import { AuthGuard } from "@/lib/guards"
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, increment } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { Election, Candidate, Vote } from "@/lib/types"
import Link from "next/link"

function VoteElectionContent() {
  const params = useParams()
  const router = useRouter()
  const electionId = params.electionId as string

  const [election, setElection] = useState<Election | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({})
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        // Fetch election
        const electionDoc = await getDoc(doc(db, "elections", electionId))
        if (!electionDoc.exists()) {
          setError("Election not found")
          return
        }

        const electionData = {
          id: electionDoc.id,
          ...electionDoc.data(),
          createdAt: electionDoc.data().createdAt?.toDate(),
          startDate: electionDoc.data().startDate?.toDate(),
          endDate: electionDoc.data().endDate?.toDate(),
        } as Election

        setElection(electionData)

        // Fetch candidates for this election
        const candidatesQuery = query(collection(db, "candidates"), where("electionId", "==", electionId))
        const candidatesSnapshot = await getDocs(candidatesQuery)
        const candidatesData = candidatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Candidate[]

        setCandidates(candidatesData)

        // Check if user has already voted for each position
        if (auth.currentUser) {
          const votesQuery = query(
            collection(db, "votes"),
            where("userId", "==", auth.currentUser.uid),
            where("electionId", "==", electionId),
          )
          const votesSnapshot = await getDocs(votesQuery)
          const userVotes = votesSnapshot.docs.map((doc) => doc.data() as Vote)

          const votedPositions: Record<string, boolean> = {}
          userVotes.forEach((vote) => {
            votedPositions[vote.position] = true
          })
          setHasVoted(votedPositions)
        }
      } catch (error) {
        console.error("Error fetching election data:", error)
        setError("Failed to load election data")
      } finally {
        setLoading(false)
      }
    }

    fetchElectionData()
  }, [electionId])

  const handleVoteChange = (position: string, candidateId: string) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [position]: candidateId,
    }))
  }

  const handleSubmitVotes = async () => {
    if (!auth.currentUser || !election) return

    setSubmitting(true)
    setError("")

    try {
      const votesToSubmit = Object.entries(selectedVotes).filter(([position]) => !hasVoted[position])

      if (votesToSubmit.length === 0) {
        setError("No new votes to submit")
        return
      }

      // Submit votes
      for (const [position, candidateId] of votesToSubmit) {
        // Add vote document
        await addDoc(collection(db, "votes"), {
          userId: auth.currentUser.uid,
          electionId,
          candidateId,
          position,
          timestamp: new Date(),
        })

        // Update candidate vote count
        await updateDoc(doc(db, "candidates", candidateId), {
          voteCount: increment(1),
        })
      }

      setSuccess(true)

      // Update local state to reflect votes
      const newHasVoted = { ...hasVoted }
      votesToSubmit.forEach(([position]) => {
        newHasVoted[position] = true
      })
      setHasVoted(newHasVoted)
    } catch (error) {
      console.error("Error submitting votes:", error)
      setError("Failed to submit votes. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getCandidatesByPosition = (position: string) => {
    return candidates.filter((c) => c.position === position)
  }

  const isElectionActive = () => {
    if (!election) return false
    const now = new Date()
    return election.startDate <= now && election.endDate >= now && election.status === "active"
  }

  const canVoteForPosition = (position: string) => {
    return isElectionActive() && !hasVoted[position]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !election) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" asChild>
          <Link href="/vote">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elections
          </Link>
        </Button>
      </div>
    )
  }

  if (!election) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/vote">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elections
          </Link>
        </Button>
        <Badge variant={isElectionActive() ? "default" : "secondary"}>
          {isElectionActive() ? "Active" : election.status}
        </Badge>
      </div>

      {/* Election Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{election.title}</CardTitle>
          <CardDescription className="text-base">{election.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Starts: {election.startDate?.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Ends: {election.endDate?.toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Your votes have been successfully submitted! Thank you for participating.</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voting Sections by Position */}
      <div className="space-y-8">
        {election.positions.map((position) => {
          const positionCandidates = getCandidatesByPosition(position)
          const canVote = canVoteForPosition(position)
          const hasVotedForPosition = hasVoted[position]

          return (
            <Card key={position}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{position}</CardTitle>
                  {hasVotedForPosition && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Voted
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {canVote
                    ? "Select one candidate for this position"
                    : hasVotedForPosition
                      ? "You have already voted for this position"
                      : "Voting is not currently available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positionCandidates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No candidates available for this position</p>
                ) : (
                  <RadioGroup
                    value={selectedVotes[position] || ""}
                    onValueChange={(value) => handleVoteChange(position, value)}
                    disabled={!canVote}
                  >
                    <div className="grid gap-4">
                      {positionCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={candidate.id} id={candidate.id} disabled={!canVote} />
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={candidate.imageUrl || "/placeholder.svg"} />
                            <AvatarFallback>
                              {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                            <div>
                              <h4 className="font-semibold">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">{candidate.bio}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit Button */}
      {isElectionActive() && Object.keys(selectedVotes).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                You have selected candidates for {Object.keys(selectedVotes).length} position(s). Click submit to cast
                your votes.
              </p>
              <Button size="lg" onClick={handleSubmitVotes} disabled={submitting}>
                {submitting ? (
                  "Submitting Votes..."
                ) : (
                  <>
                    <VoteIcon className="mr-2 h-4 w-4" />
                    Submit Votes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function VoteElectionPage() {
  return (
    <AuthGuard requiredRole="voter">
      <VoteElectionContent />
    </AuthGuard>
  )
}
