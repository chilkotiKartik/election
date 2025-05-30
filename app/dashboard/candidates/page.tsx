"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { AuthGuard } from "@/lib/guards"
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type { Election, Candidate } from "@/lib/types"

function CandidatesManagement() {
  const searchParams = useSearchParams()
  const selectedElectionId = searchParams.get("election")

  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [selectedElection, setSelectedElection] = useState(selectedElectionId || "")
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    position: "",
    electionId: selectedElectionId || "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Subscribe to elections
    const electionsQuery = query(collection(db, "elections"), orderBy("createdAt", "desc"))
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
    const candidatesQuery = query(collection(db, "candidates"), orderBy("createdAt", "desc"))
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
      unsubElections()
      unsubCandidates()
    }
  }, [])

  useEffect(() => {
    if (selectedElection) {
      setFilteredCandidates(candidates.filter((c) => c.electionId === selectedElection))
    } else {
      setFilteredCandidates(candidates)
    }
  }, [candidates, selectedElection])

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      position: "",
      electionId: selectedElectionId || "",
    })
    setImageFile(null)
    setEditingCandidate(null)
    setError("")
  }

  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `candidates/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  }

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      let imageUrl = ""
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      await addDoc(collection(db, "candidates"), {
        name: formData.name,
        bio: formData.bio,
        position: formData.position,
        electionId: formData.electionId,
        imageUrl,
        voteCount: 0,
        createdAt: new Date(),
      })

      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error creating candidate:", error)
      setError("Failed to create candidate")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCandidate) return

    setSubmitting(true)
    setError("")

    try {
      let imageUrl = editingCandidate.imageUrl
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      await updateDoc(doc(db, "candidates", editingCandidate.id), {
        name: formData.name,
        bio: formData.bio,
        position: formData.position,
        electionId: formData.electionId,
        imageUrl,
      })

      setEditingCandidate(null)
      resetForm()
    } catch (error) {
      console.error("Error updating candidate:", error)
      setError("Failed to update candidate")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return

    try {
      await deleteDoc(doc(db, "candidates", candidateId))
    } catch (error) {
      console.error("Error deleting candidate:", error)
      setError("Failed to delete candidate")
    }
  }

  const startEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setFormData({
      name: candidate.name,
      bio: candidate.bio,
      position: candidate.position,
      electionId: candidate.electionId,
    })
  }

  const getElectionTitle = (electionId: string) => {
    const election = elections.find((e) => e.id === electionId)
    return election?.title || "Unknown Election"
  }

  const getElectionPositions = (electionId: string) => {
    const election = elections.find((e) => e.id === electionId)
    return election?.positions || []
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Candidates Management</h1>
          <p className="text-muted-foreground">Add and manage candidates for elections</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>Create a new candidate for an election position</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="election">Election</Label>
                  <Select
                    value={formData.electionId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, electionId: value, position: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select election" />
                    </SelectTrigger>
                    <SelectContent>
                      {elections.map((election) => (
                        <SelectItem key={election.id} value={election.id}>
                          {election.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {getElectionPositions(formData.electionId).map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description of the candidate..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Candidate"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="filter-election">Filter by Election</Label>
              <Select value={selectedElection} onValueChange={setSelectedElection}>
                <SelectTrigger>
                  <SelectValue placeholder="All elections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Elections</SelectItem>
                  {elections.map((election) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">Showing {filteredCandidates.length} candidate(s)</div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={(open) => !open && setEditingCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>Update candidate information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCandidate} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Candidate Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-election">Election</Label>
                <Select
                  value={formData.electionId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, electionId: value, position: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        editingCandidate?.electionId ? getElectionTitle(editingCandidate.electionId) : "Select election"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {elections.map((election) => (
                      <SelectItem key={election.id} value={election.id}>
                        {election.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={editingCandidate?.position || "Select position"} />
                </SelectTrigger>
                <SelectContent>
                  {getElectionPositions(formData.electionId).map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Biography</Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Profile Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {editingCandidate?.imageUrl && (
                <p className="text-sm text-muted-foreground">Current image will be replaced if you upload a new one</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingCandidate(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Candidate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Candidates List */}
      <div className="grid gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
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
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <p className="text-muted-foreground">{candidate.position}</p>
                      <p className="text-sm text-muted-foreground">{getElectionTitle(candidate.electionId)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{candidate.voteCount || 0} votes</Badge>
                    </div>
                  </div>

                  <p className="text-sm">{candidate.bio}</p>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(candidate)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Candidates Found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedElection
                ? "No candidates found for the selected election."
                : "Add your first candidate to get started."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CandidatesPage() {
  return (
    <AuthGuard requiredRole="admin">
      <CandidatesManagement />
    </AuthGuard>
  )
}
