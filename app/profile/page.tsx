"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Vote, Calendar, Clock, CheckCircle } from "lucide-react"
import { AuthGuard } from "@/lib/guards"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { onAuthStateChange, getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/firebase"
import type { User as UserType, Vote as VoteType, Election, Candidate } from "@/lib/types"

function ProfileContent() {
  const [user, setUser] = useState<UserType | null>(null)
  const [votes, setVotes] = useState<VoteType[]>([])
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getCurrentUser(firebaseUser)
        setUser(userData)

        // Subscribe to user's votes
        const votesQuery = query(
          collection(db, "votes"),
          where("userId", "==", firebaseUser.uid),
          orderBy("timestamp", "desc"),
        )

        const unsubVotes = onSnapshot(votesQuery, (snapshot) => {
          const votesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as VoteType[]
          setVotes(votesData)
        })

        // Subscribe to elections
        const electionsQuery = query(collection(db, "elections"))
        const unsubElections = onSnapshot(electionsQuery, (snapshot) => {
          const electionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            startDate: doc.data().startDate?.toDate(),
            endDate: doc.data().endDate?.toDate(),
          })) as Election[]
          setElections(electionsData)
        })

        // Subscribe to candidates
        const candidatesQuery = query(collection(db, "candidates"))
        const unsubCandidates = onSnapshot(candidatesQuery, (snapshot) => {
          const candidatesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
          })) as Candidate[]
          setCandidates(candidatesData)
          setLoading(false)
        })

        return () => {
          unsubVotes()
          unsubElections()
          unsubCandidates()
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const getElectionTitle = (electionId: string) => {
    const election = elections.find((e) => e.id === electionId)
    return election?.title || "Unknown Election"
  }

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId)
    return candidate?.name || "Unknown Candidate"
  }

  const getVotesByElection = () => {
    const votesByElection: Record<string, VoteType[]> = {}
    votes.forEach((vote) => {
      if (!votesByElection[vote.electionId]) {
        votesByElection[vote.electionId] = []
      }
      votesByElection[vote.electionId].push(vote)
    })
    return votesByElection
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    )
  }

  const votesByElection = getVotesByElection()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        <p className="text-muted-foreground">View your account information and voting history</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="voting-history">Voting History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Member since:</span>
                      <p className="font-medium">{user.createdAt?.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account ID:</span>
                      <p className="font-mono text-xs">{user.uid}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{votes.length}</div>
                <p className="text-xs text-muted-foreground">Across all elections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Elections Participated</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(votesByElection).length}</div>
                <p className="text-xs text-muted-foreground">Unique elections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Vote</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {votes.length > 0 ? votes[0].timestamp?.toLocaleDateString() : "Never"}
                </div>
                <p className="text-xs text-muted-foreground">Most recent activity</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voting-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="h-5 w-5" />
                <span>Your Voting History</span>
              </CardTitle>
              <CardDescription>A complete record of all your votes across different elections</CardDescription>
            </CardHeader>
            <CardContent>
              {votes.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Votes Cast Yet</h3>
                  <p className="text-muted-foreground">You haven't participated in any elections yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(votesByElection).map(([electionId, electionVotes]) => (
                    <div key={electionId} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{getElectionTitle(electionId)}</h3>
                        <Badge variant="outline">
                          {electionVotes.length} vote{electionVotes.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <div className="grid gap-3">
                        {electionVotes.map((vote) => (
                          <div key={vote.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">{vote.position}</p>
                                <p className="text-sm text-muted-foreground">
                                  Voted for: {getCandidateName(vote.candidateId)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{vote.timestamp?.toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">{vote.timestamp?.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
