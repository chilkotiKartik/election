"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Vote } from "lucide-react"
import { LocalStorageDB } from "@/lib/local-storage-db"
import type { Election, Candidate, Vote as VoteType } from "@/lib/types"

export default function ResultsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<VoteType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      try {
        const electionsData = LocalStorageDB.getElections()
        const candidatesData = LocalStorageDB.getCandidates()
        const votesData = LocalStorageDB.getVotes()

        setElections(electionsData)
        setCandidates(candidatesData)
        setVotes(votesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getElectionResults = (electionId: string) => {
    const electionCandidates = candidates.filter((c) => c.electionId === electionId)
    const electionVotes = votes.filter((v) => v.electionId === electionId)

    const results: Record<string, Candidate[]> = {}

    // Group candidates by position
    electionCandidates.forEach((candidate) => {
      if (!results[candidate.position]) {
        results[candidate.position] = []
      }

      // Count votes for this candidate
      const candidateVotes = electionVotes.filter((v) => v.candidateId === candidate.id).length

      results[candidate.position].push({
        ...candidate,
        voteCount: candidateVotes,
      })
    })

    // Sort candidates by vote count within each position
    Object.keys(results).forEach((position) => {
      results[position].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
    })

    return results
  }

  const getTotalVotes = (electionId: string) => {
    return votes.filter((v) => v.electionId === electionId).length
  }

  const getPositionVotes = (electionId: string, position: string) => {
    return votes.filter((v) => v.electionId === electionId && v.position === position).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Election Results</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Live results from all elections. Results are updated in real-time as votes are cast.
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{votes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.filter((e) => e.status === "active").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Elections Results */}
      <div className="space-y-8">
        {elections.map((election) => {
          const results = getElectionResults(election.id)
          const totalVotes = getTotalVotes(election.id)

          return (
            <Card key={election.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{election.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{election.description}</CardDescription>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status}</Badge>
                    <div className="text-sm text-muted-foreground">{totalVotes} total votes</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue={Object.keys(results)[0]} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Object.keys(results).map((position) => (
                      <TabsTrigger key={position} value={position} className="text-xs">
                        {position}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(results).map(([position, positionCandidates]) => {
                    const positionVotes = getPositionVotes(election.id, position)

                    return (
                      <TabsContent key={position} value={position} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{position}</h3>
                          <span className="text-sm text-muted-foreground">{positionVotes} votes cast</span>
                        </div>

                        <div className="space-y-4">
                          {positionCandidates.map((candidate, index) => {
                            const percentage =
                              positionVotes > 0 ? ((candidate.voteCount || 0) / positionVotes) * 100 : 0

                            return (
                              <div key={candidate.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                                      <Avatar>
                                        <AvatarImage src={candidate.imageUrl || "/placeholder.svg"} />
                                        <AvatarFallback>
                                          {candidate.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{candidate.name}</h4>
                                      <p className="text-sm text-muted-foreground">{candidate.bio}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold">{candidate.voteCount || 0}</div>
                                    <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                                  </div>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            )
                          })}

                          {positionCandidates.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No candidates for this position
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {elections.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Elections Found</h3>
            <p className="text-muted-foreground">There are currently no elections to display results for.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
