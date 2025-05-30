"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Users,
  Bell,
  UserX,
  CheckCircle,
  Calendar,
  BarChart3,
  Shield,
  Clock,
  Eye,
  Edit,
  Trash2,
  Megaphone,
  TrendingUp,
  Vote,
  Settings,
  Activity,
  XCircle,
  Play,
  Pause,
} from "lucide-react"
import { AuthGuard } from "@/lib/guards"
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { Election, Candidate, Vote as VoteType, User } from "@/lib/types"
import { EnhancedCSVImporter } from "@/components/enhanced-csv-importer"
import Link from "next/link"

interface Poll {
  id: string
  question: string
  options: string[]
  responses: Record<string, number>
  isActive: boolean
  createdAt: Date
  createdBy: string
  targetAudience: "all" | "voters" | "candidates"
}

interface Announcement {
  id: string
  title: string
  content: string
  type: "general" | "urgent" | "election" | "system"
  isActive: boolean
  targetAudience: "all" | "voters" | "candidates" | "admins"
  createdAt: Date
  createdBy: string
  expiresAt?: Date
}

function AdminDashboard() {
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<VoteType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [showElectionDialog, setShowElectionDialog] = useState(false)
  const [showPollDialog, setShowPollDialog] = useState(false)
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false)
  const [editingElection, setEditingElection] = useState<Election | null>(null)
  const [selectedElectionDetails, setSelectedElectionDetails] = useState<Election | null>(null)

  // Form states
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    positions: "",
    status: "inactive" as "active" | "inactive" | "completed",
    isHighlighted: false,
    eligibilityCriteria: "",
    maxVotesPerPosition: 1,
  })

  const [pollForm, setPollForm] = useState({
    question: "",
    options: ["", ""],
    targetAudience: "all" as "all" | "voters" | "candidates",
  })

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "general" as "general" | "urgent" | "election" | "system",
    targetAudience: "all" as "all" | "voters" | "candidates" | "admins",
    expiresAt: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsubscribers = [
      // Elections
      onSnapshot(query(collection(db, "elections"), orderBy("createdAt", "desc")), (snapshot) => {
        const electionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
        })) as Election[]
        setElections(electionsData)
      }),

      // Candidates
      onSnapshot(query(collection(db, "candidates"), orderBy("createdAt", "desc")), (snapshot) => {
        const candidatesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Candidate[]
        setCandidates(candidatesData)
      }),

      // Votes
      onSnapshot(query(collection(db, "votes"), orderBy("timestamp", "desc")), (snapshot) => {
        const votesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as VoteType[]
        setVotes(votesData)
      }),

      // Users
      onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as User[]
        setUsers(usersData)
      }),

      // Polls
      onSnapshot(query(collection(db, "polls"), orderBy("createdAt", "desc")), (snapshot) => {
        const pollsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Poll[]
        setPolls(pollsData)
      }),

      // Announcements
      onSnapshot(query(collection(db, "announcements"), orderBy("createdAt", "desc")), (snapshot) => {
        const announcementsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
        })) as Announcement[]
        setAnnouncements(announcementsData)
      }),
    ]

    setLoading(false)
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [])

  // Election Management Functions
  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setSubmitting(true)
    setError("")

    try {
      const positions = electionForm.positions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)

      await addDoc(collection(db, "elections"), {
        title: electionForm.title,
        description: electionForm.description,
        startDate: new Date(electionForm.startDate),
        endDate: new Date(electionForm.endDate),
        positions,
        status: electionForm.status,
        isHighlighted: electionForm.isHighlighted,
        eligibilityCriteria: electionForm.eligibilityCriteria,
        maxVotesPerPosition: electionForm.maxVotesPerPosition,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      })

      // Send announcement if election is highlighted
      if (electionForm.isHighlighted) {
        await addDoc(collection(db, "announcements"), {
          title: `New Election: ${electionForm.title}`,
          content: `A new election has been created and is now highlighted for voting. ${electionForm.description}`,
          type: "election",
          isActive: true,
          targetAudience: "voters",
          createdAt: new Date(),
          createdBy: auth.currentUser.uid,
        })
      }

      setShowElectionDialog(false)
      resetElectionForm()
    } catch (error) {
      console.error("Error creating election:", error)
      setError("Failed to create election")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateElection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingElection) return

    setSubmitting(true)
    setError("")

    try {
      const positions = electionForm.positions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)

      await updateDoc(doc(db, "elections", editingElection.id), {
        title: electionForm.title,
        description: electionForm.description,
        startDate: new Date(electionForm.startDate),
        endDate: new Date(electionForm.endDate),
        positions,
        status: electionForm.status,
        isHighlighted: electionForm.isHighlighted,
        eligibilityCriteria: electionForm.eligibilityCriteria,
        maxVotesPerPosition: electionForm.maxVotesPerPosition,
      })

      setEditingElection(null)
      resetElectionForm()
    } catch (error) {
      console.error("Error updating election:", error)
      setError("Failed to update election")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteElection = async (electionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this election? This will also delete all associated candidates and votes.",
      )
    )
      return

    try {
      const batch = writeBatch(db)

      // Delete election
      batch.delete(doc(db, "elections", electionId))

      // Delete associated candidates
      const candidatesQuery = query(collection(db, "candidates"), where("electionId", "==", electionId))
      const candidatesSnapshot = await getDocs(candidatesQuery)
      candidatesSnapshot.docs.forEach((candidateDoc) => {
        batch.delete(candidateDoc.ref)
      })

      // Delete associated votes
      const votesQuery = query(collection(db, "votes"), where("electionId", "==", electionId))
      const votesSnapshot = await getDocs(votesQuery)
      votesSnapshot.docs.forEach((voteDoc) => {
        batch.delete(voteDoc.ref)
      })

      await batch.commit()
    } catch (error) {
      console.error("Error deleting election:", error)
      setError("Failed to delete election")
    }
  }

  const toggleElectionStatus = async (electionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    try {
      await updateDoc(doc(db, "elections", electionId), { status: newStatus })
    } catch (error) {
      console.error("Error updating election status:", error)
    }
  }

  const toggleElectionHighlight = async (electionId: string, currentHighlight: boolean) => {
    try {
      await updateDoc(doc(db, "elections", electionId), { isHighlighted: !currentHighlight })
    } catch (error) {
      console.error("Error updating election highlight:", error)
    }
  }

  // Poll Management Functions
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setSubmitting(true)
    try {
      const responses: Record<string, number> = {}
      pollForm.options.forEach((option) => {
        if (option.trim()) responses[option.trim()] = 0
      })

      await addDoc(collection(db, "polls"), {
        question: pollForm.question,
        options: pollForm.options.filter((opt) => opt.trim()),
        responses,
        isActive: true,
        targetAudience: pollForm.targetAudience,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
      })

      setShowPollDialog(false)
      setPollForm({ question: "", options: ["", ""], targetAudience: "all" })
    } catch (error) {
      console.error("Error creating poll:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "polls", pollId), { isActive: !currentStatus })
    } catch (error) {
      console.error("Error updating poll status:", error)
    }
  }

  // Announcement Management Functions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, "announcements"), {
        title: announcementForm.title,
        content: announcementForm.content,
        type: announcementForm.type,
        isActive: true,
        targetAudience: announcementForm.targetAudience,
        expiresAt: announcementForm.expiresAt ? new Date(announcementForm.expiresAt) : null,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
      })

      setShowAnnouncementDialog(false)
      setAnnouncementForm({
        title: "",
        content: "",
        type: "general",
        targetAudience: "all",
        expiresAt: "",
      })
    } catch (error) {
      console.error("Error creating announcement:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAnnouncementStatus = async (announcementId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "announcements", announcementId), { isActive: !currentStatus })
    } catch (error) {
      console.error("Error updating announcement status:", error)
    }
  }

  // Candidate Management Functions
  const disqualifyCandidate = async (candidateId: string, reason: string) => {
    try {
      await updateDoc(doc(db, "candidates", candidateId), {
        isDisqualified: true,
        disqualificationReason: reason,
        disqualifiedAt: new Date(),
        disqualifiedBy: auth.currentUser?.uid,
      })

      await addDoc(collection(db, "announcements"), {
        title: "Candidate Disqualified",
        content: `A candidate has been disqualified. Reason: ${reason}`,
        type: "urgent",
        isActive: true,
        targetAudience: "all",
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || "system",
      })
    } catch (error) {
      console.error("Error disqualifying candidate:", error)
    }
  }

  const reinstateCandidate = async (candidateId: string) => {
    try {
      await updateDoc(doc(db, "candidates", candidateId), {
        isDisqualified: false,
        disqualificationReason: null,
        disqualifiedAt: null,
        reinstatedAt: new Date(),
        reinstatedBy: auth.currentUser?.uid,
      })
    } catch (error) {
      console.error("Error reinstating candidate:", error)
    }
  }

  // Helper Functions
  const resetElectionForm = () => {
    setElectionForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      positions: "",
      status: "inactive",
      isHighlighted: false,
      eligibilityCriteria: "",
      maxVotesPerPosition: 1,
    })
    setEditingElection(null)
    setError("")
  }

  const startEditElection = (election: Election) => {
    setEditingElection(election)
    setElectionForm({
      title: election.title,
      description: election.description,
      startDate: election.startDate?.toISOString().slice(0, 16) || "",
      endDate: election.endDate?.toISOString().slice(0, 16) || "",
      positions: election.positions.join(", "),
      status: election.status,
      isHighlighted: election.isHighlighted || false,
      eligibilityCriteria: election.eligibilityCriteria || "",
      maxVotesPerPosition: election.maxVotesPerPosition || 1,
    })
    setShowElectionDialog(true)
  }

  const getElectionResults = (electionId: string) => {
    const electionCandidates = candidates.filter((c) => c.electionId === electionId)
    const electionVotes = votes.filter((v) => v.electionId === electionId)

    const results: Record<string, Candidate[]> = {}

    electionCandidates.forEach((candidate) => {
      if (!results[candidate.position]) {
        results[candidate.position] = []
      }

      const candidateVotes = electionVotes.filter((v) => v.candidateId === candidate.id).length
      results[candidate.position].push({
        ...candidate,
        voteCount: candidateVotes,
      })
    })

    Object.keys(results).forEach((position) => {
      results[position].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
    })

    return results
  }

  const getStats = () => {
    const activeElections = elections.filter((e) => e.status === "active").length
    const highlightedElections = elections.filter((e) => e.isHighlighted).length
    const totalVotes = votes.length
    const totalCandidates = candidates.length
    const disqualifiedCandidates = candidates.filter((c) => c.isDisqualified).length
    const activePolls = polls.filter((p) => p.isActive).length
    const activeAnnouncements = announcements.filter((a) => a.isActive).length

    return {
      activeElections,
      highlightedElections,
      totalVotes,
      totalCandidates,
      disqualifiedCandidates,
      activePolls,
      activeAnnouncements,
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-muted-foreground">Complete election management and oversight dashboard</p>
        </div>
        <div className="flex space-x-2">
          <EnhancedCSVImporter />
          <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="mr-2 h-4 w-4" />
                Make Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Send an announcement to users</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ann-title">Title</Label>
                    <Input
                      id="ann-title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ann-type">Type</Label>
                    <Select
                      value={announcementForm.type}
                      onValueChange={(value: any) => setAnnouncementForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="election">Election</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ann-content">Content</Label>
                  <Textarea
                    id="ann-content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ann-audience">Target Audience</Label>
                    <Select
                      value={announcementForm.targetAudience}
                      onValueChange={(value: any) =>
                        setAnnouncementForm((prev) => ({ ...prev, targetAudience: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="voters">Voters Only</SelectItem>
                        <SelectItem value="candidates">Candidates Only</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ann-expires">Expires At (Optional)</Label>
                    <Input
                      id="ann-expires"
                      type="datetime-local"
                      value={announcementForm.expiresAt}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Announcement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeElections}</div>
            <p className="text-xs text-muted-foreground">{elections.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highlighted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highlightedElections}</div>
            <p className="text-xs text-muted-foreground">Featured elections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
            <p className="text-xs text-muted-foreground">Cast votes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">{stats.disqualifiedCandidates} disqualified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolls}</div>
            <p className="text-xs text-muted-foreground">{polls.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Active now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="elections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="live-results">Live Results</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="elections" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Elections Management</h2>
            <Dialog open={showElectionDialog} onOpenChange={setShowElectionDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetElectionForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Election
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingElection ? "Edit Election" : "Create New Election"}</DialogTitle>
                  <DialogDescription>
                    {editingElection ? "Update election details" : "Set up a new election with positions and settings"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingElection ? handleUpdateElection : handleCreateElection} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Election Title</Label>
                      <Input
                        id="title"
                        value={electionForm.title}
                        onChange={(e) => setElectionForm((prev) => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={electionForm.status}
                        onValueChange={(value: any) => setElectionForm((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={electionForm.description}
                      onChange={(e) => setElectionForm((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date & Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={electionForm.startDate}
                        onChange={(e) => setElectionForm((prev) => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date & Time</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={electionForm.endDate}
                        onChange={(e) => setElectionForm((prev) => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positions">Positions (comma-separated)</Label>
                    <Input
                      id="positions"
                      placeholder="President, Vice President, Secretary, Treasurer"
                      value={electionForm.positions}
                      onChange={(e) => setElectionForm((prev) => ({ ...prev, positions: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eligibility">Eligibility Criteria</Label>
                      <Textarea
                        id="eligibility"
                        placeholder="Who can vote in this election?"
                        value={electionForm.eligibilityCriteria}
                        onChange={(e) => setElectionForm((prev) => ({ ...prev, eligibilityCriteria: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxVotes">Max Votes Per Position</Label>
                      <Input
                        id="maxVotes"
                        type="number"
                        min="1"
                        value={electionForm.maxVotesPerPosition}
                        onChange={(e) =>
                          setElectionForm((prev) => ({ ...prev, maxVotesPerPosition: Number.parseInt(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="highlighted"
                      checked={electionForm.isHighlighted}
                      onChange={(e) => setElectionForm((prev) => ({ ...prev, isHighlighted: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="highlighted">Highlight this election for voters</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowElectionDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting
                        ? editingElection
                          ? "Updating..."
                          : "Creating..."
                        : editingElection
                          ? "Update Election"
                          : "Create Election"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {elections.map((election) => (
              <Card key={election.id} className={election.isHighlighted ? "border-yellow-400 bg-yellow-50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">{election.title}</CardTitle>
                        {election.isHighlighted && (
                          <Badge variant="default" className="bg-yellow-500">
                            Highlighted
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{election.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleElectionStatus(election.id, election.status)}
                      >
                        {election.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Start: {election.startDate?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>End: {election.endDate?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{candidates.filter((c) => c.electionId === election.id).length} Candidates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Vote className="h-4 w-4 text-muted-foreground" />
                        <span>{votes.filter((v) => v.electionId === election.id).length} Votes</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Positions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {election.positions.map((position, index) => (
                          <Badge key={index} variant="outline">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedElectionDetails(election)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/candidates?election=${election.id}`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Candidates
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleElectionHighlight(election.id, election.isHighlighted || false)}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {election.isHighlighted ? "Remove Highlight" : "Highlight"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => startEditElection(election)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteElection(election.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {elections.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Elections Found</h3>
                <p className="text-muted-foreground mb-4">Create your first election to get started.</p>
                <Button onClick={() => setShowElectionDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Election
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Candidates Management</h2>
            <Button asChild>
              <Link href="/dashboard/candidates">
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className={candidate.isDisqualified ? "border-red-200 bg-red-50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.imageUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.position}</p>
                          <p className="text-xs text-muted-foreground">
                            {elections.find((e) => e.id === candidate.electionId)?.title}
                          </p>
                          {candidate.isDisqualified && (
                            <p className="text-xs text-red-600 mt-1">
                              Disqualified: {candidate.disqualificationReason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {candidate.isDisqualified ? (
                            <Badge variant="destructive">Disqualified</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                          <Badge variant="secondary">{candidate.voteCount || 0} votes</Badge>
                        </div>
                      </div>

                      <p className="text-sm">{candidate.bio}</p>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/candidates/${candidate.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                        {candidate.isDisqualified ? (
                          <Button variant="outline" size="sm" onClick={() => reinstateCandidate(candidate.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reinstate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt("Enter disqualification reason:")
                              if (reason) disqualifyCandidate(candidate.id, reason)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Disqualify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live-results" className="space-y-6">
          <h2 className="text-2xl font-bold">Live Election Results</h2>

          <div className="space-y-8">
            {elections
              .filter((e) => e.status === "active")
              .map((election) => {
                const results = getElectionResults(election.id)
                const totalVotes = votes.filter((v) => v.electionId === election.id).length

                return (
                  <Card key={election.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{election.title}</CardTitle>
                          <CardDescription>Live results - Updates in real-time</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="animate-pulse">
                            Live
                          </Badge>
                          <span className="text-sm text-muted-foreground">{totalVotes} total votes</span>
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
                          const positionVotes = votes.filter(
                            (v) => v.electionId === election.id && v.position === position,
                          ).length

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
                                            <span
                                              className={`text-2xl font-bold ${index === 0 ? "text-yellow-600" : index === 1 ? "text-gray-600" : index === 2 ? "text-orange-600" : "text-muted-foreground"}`}
                                            >
                                              #{index + 1}
                                            </span>
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
                                      <Progress value={percentage} className="h-3" />
                                    </div>
                                  )
                                })}
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

          {elections.filter((e) => e.status === "active").length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Elections</h3>
                <p className="text-muted-foreground">Activate an election to see live results here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="polls" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Polls Management</h2>
            <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Poll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Poll</DialogTitle>
                  <DialogDescription>Create a poll for users to participate in</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePoll} className="space-y-4">
                  <div>
                    <Label htmlFor="poll-question">Question</Label>
                    <Input
                      id="poll-question"
                      value={pollForm.question}
                      onChange={(e) => setPollForm((prev) => ({ ...prev, question: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label>Options</Label>
                    {pollForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollForm.options]
                            newOptions[index] = e.target.value
                            setPollForm((prev) => ({ ...prev, options: newOptions }))
                          }}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {pollForm.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = pollForm.options.filter((_, i) => i !== index)
                              setPollForm((prev) => ({ ...prev, options: newOptions }))
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setPollForm((prev) => ({ ...prev, options: [...prev.options, ""] }))}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="poll-audience">Target Audience</Label>
                    <Select
                      value={pollForm.targetAudience}
                      onValueChange={(value: any) => setPollForm((prev) => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="voters">Voters Only</SelectItem>
                        <SelectItem value="candidates">Candidates Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowPollDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Poll"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {polls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{poll.question}</CardTitle>
                      <CardDescription>
                        Created {poll.createdAt?.toLocaleDateString()} • Target: {poll.targetAudience}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={poll.isActive ? "default" : "secondary"}>
                        {poll.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => togglePollStatus(poll.id, poll.isActive)}>
                        {poll.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {poll.options.map((option, index) => {
                      const votes = poll.responses[option] || 0
                      const totalVotes = Object.values(poll.responses).reduce((a, b) => a + b, 0)
                      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{option}</span>
                            <span className="text-sm text-muted-foreground">
                              {votes} votes ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          <h2 className="text-2xl font-bold">Announcements</h2>

          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge
                          variant={
                            announcement.type === "urgent"
                              ? "destructive"
                              : announcement.type === "election"
                                ? "default"
                                : announcement.type === "system"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-sm">{announcement.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Created: {announcement.createdAt?.toLocaleString()}</span>
                        <span>Target: {announcement.targetAudience}</span>
                        {announcement.expiresAt && <span>Expires: {announcement.expiresAt.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={announcement.isActive ? "default" : "secondary"}>
                        {announcement.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAnnouncementStatus(announcement.id, announcement.isActive)}
                      >
                        {announcement.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics & System Health</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Voting Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {elections.map((election) => {
                    const electionVotes = votes.filter((v) => v.electionId === election.id).length
                    const electionCandidates = candidates.filter((c) => c.electionId === election.id).length
                    const maxPossibleVotes = electionCandidates * users.filter((u) => u.role === "voter").length

                    return (
                      <div key={election.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{election.title}</span>
                          <span className="text-sm text-muted-foreground">{electionVotes} votes</span>
                        </div>
                        <Progress
                          value={maxPossibleVotes > 0 ? (electionVotes / maxPossibleVotes) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database Connection</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Authentication Service</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Storage</span>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Real-time Updates</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Security Rules</span>
                    <Badge variant="default">Enforced</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Election Details Dialog */}
      <Dialog open={!!selectedElectionDetails} onOpenChange={(open) => !open && setSelectedElectionDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedElectionDetails?.title}</DialogTitle>
            <DialogDescription>Detailed election information and statistics</DialogDescription>
          </DialogHeader>
          {selectedElectionDetails && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Election Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Status:</strong> {selectedElectionDetails.status}
                      </div>
                      <div>
                        <strong>Start Date:</strong> {selectedElectionDetails.startDate?.toLocaleString()}
                      </div>
                      <div>
                        <strong>End Date:</strong> {selectedElectionDetails.endDate?.toLocaleString()}
                      </div>
                      <div>
                        <strong>Highlighted:</strong> {selectedElectionDetails.isHighlighted ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>Created:</strong> {selectedElectionDetails.createdAt?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedElectionDetails.description}</p>
                  </div>

                  {selectedElectionDetails.eligibilityCriteria && (
                    <div>
                      <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                      <p className="text-sm text-muted-foreground">{selectedElectionDetails.eligibilityCriteria}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Total Candidates:</strong>{" "}
                        {candidates.filter((c) => c.electionId === selectedElectionDetails.id).length}
                      </div>
                      <div>
                        <strong>Total Votes:</strong>{" "}
                        {votes.filter((v) => v.electionId === selectedElectionDetails.id).length}
                      </div>
                      <div>
                        <strong>Positions:</strong> {selectedElectionDetails.positions.length}
                      </div>
                      <div>
                        <strong>Max Votes per Position:</strong> {selectedElectionDetails.maxVotesPerPosition || 1}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Positions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedElectionDetails.positions.map((position, index) => (
                        <Badge key={index} variant="outline">
                          {position}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Live Results Preview</h4>
                {getElectionResults(selectedElectionDetails.id) &&
                Object.keys(getElectionResults(selectedElectionDetails.id)).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(getElectionResults(selectedElectionDetails.id)).map(
                      ([position, positionCandidates]) => (
                        <div key={position} className="space-y-2">
                          <h5 className="font-medium">{position}</h5>
                          <div className="space-y-2">
                            {positionCandidates.slice(0, 3).map((candidate, index) => (
                              <div key={candidate.id} className="flex justify-between items-center text-sm">
                                <span>{candidate.name}</span>
                                <Badge variant="outline">{candidate.voteCount || 0} votes</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No candidates or votes yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboard />
    </AuthGuard>
  )
}
