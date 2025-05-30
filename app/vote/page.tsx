"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, VoteIcon, Trophy, TrendingUp } from "lucide-react"
import { AuthGuard } from "@/lib/guards"
import LocalStorageDB from "@/lib/local-storage-db"
import type { Election, Candidate } from "@/lib/local-storage-db"
import Link from "next/link"

function VoteContent() {
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const electionsData = LocalStorageDB.getElections()
        const candidatesData = LocalStorageDB.getCandidates()

        // Convert string dates to Date objects and filter active elections
        const processedElections = electionsData
          .map((election) => ({
            ...election,
            startDate: new Date(election.startDate),
            endDate: new Date(election.endDate),
          }))
          .filter((e) => e.status === "active")

        setElections(processedElections)
        setCandidates(candidatesData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load elections. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getElectionCandidates = (electionId: string) => {
    return candidates.filter((c) => c.electionId === electionId)
  }

  const isElectionActive = (election: Election) => {
    const now = new Date()
    return election.startDate <= now && election.endDate >= now
  }

  const getElectionStatus = (election: Election) => {
    const now = new Date()
    if (now < election.startDate) return { status: "upcoming", color: "secondary" }
    if (now > election.endDate) return { status: "ended", color: "destructive" }
    return { status: "active", color: "default" }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading elections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-destructive mb-4">
              <VoteIcon className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Elections</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <VoteIcon className="h-4 w-4" />
          <span>Democratic Participation</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Available Elections
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Participate in active elections by casting your vote. Your voice matters in shaping the future of our
          community.
        </p>
      </div>

      {elections.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                <VoteIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">No Active Elections</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  There are currently no active elections. Check back later for new voting opportunities, or contact
                  your administrator.
                </p>
              </div>
              <div className="flex justify-center space-x-4 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/results">View Past Results</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/profile">Update Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {elections.map((election) => {
            const electionCandidates = getElectionCandidates(election.id)
            const isActive = isElectionActive(election)
            const statusInfo = getElectionStatus(election)

            return (
              <Card
                key={election.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-1">
                  <Card className="border-0">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Trophy className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold">{election.title}</CardTitle>
                              <CardDescription className="text-base mt-1">{election.description}</CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge variant={statusInfo.color as any} className="ml-4">
                          {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Election Info Grid */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Starts</p>
                            <p className="text-sm text-muted-foreground">{formatDate(election.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Ends</p>
                            <p className="text-sm text-muted-foreground">{formatDate(election.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Candidates</p>
                            <p className="text-sm text-muted-foreground">{electionCandidates.length} Running</p>
                          </div>
                        </div>
                      </div>

                      {/* Positions */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Available Positions</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {election.positions.map((position, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-primary/5 hover:bg-primary/10 transition-colors"
                            >
                              {position}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Candidates Preview */}
                      {electionCandidates.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Featured Candidates</span>
                          </h4>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {electionCandidates.slice(0, 6).map((candidate) => (
                              <div
                                key={candidate.id}
                                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={candidate.photoURL || "/placeholder.svg?height=48&width=48"} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {candidate.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{candidate.name}</p>
                                  <p className="text-sm text-muted-foreground">{candidate.position}</p>
                                  {candidate.voteCount !== undefined && (
                                    <p className="text-xs text-primary font-medium">{candidate.voteCount} votes</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {electionCandidates.length > 6 && (
                              <div className="flex items-center justify-center p-4 border rounded-lg text-muted-foreground bg-muted/20">
                                <div className="text-center">
                                  <p className="font-medium">+{electionCandidates.length - 6} more</p>
                                  <p className="text-xs">candidates</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Section */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {isActive ? "Voting is currently open" : "Voting is not available"}
                        </div>
                        {isActive ? (
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            asChild
                          >
                            <Link href={`/vote/${election.id}`}>
                              <VoteIcon className="mr-2 h-4 w-4" />
                              Cast Your Vote
                            </Link>
                          </Button>
                        ) : (
                          <Button size="lg" disabled variant="outline">
                            {statusInfo.status === "upcoming" ? "Voting Not Started" : "Voting Ended"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Statistics Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader>
            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <VoteIcon className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">{elections.length}</CardTitle>
            <CardDescription className="font-medium">Active Elections</CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader>
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">{candidates.length}</CardTitle>
            <CardDescription className="font-medium">Total Candidates</CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader>
            <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {elections.reduce((acc, e) => acc + e.positions.length, 0)}
            </CardTitle>
            <CardDescription className="font-medium">Available Positions</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export default function VotePage() {
  return (
    <AuthGuard requiredRole="voter">
      <VoteContent />
    </AuthGuard>
  )
}
