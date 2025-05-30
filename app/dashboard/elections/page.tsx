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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Calendar, Users, Settings, Eye } from "lucide-react"
import { AuthGuard } from "@/lib/guards"
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { Election } from "@/lib/types"
import Link from "next/link"

function ElectionsManagement() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingElection, setEditingElection] = useState<Election | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    positions: "",
    status: "inactive" as "active" | "inactive" | "completed",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const electionsQuery = query(collection(db, "elections"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(electionsQuery, (snapshot) => {
      const electionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      })) as Election[]
      setElections(electionsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      positions: "",
      status: "inactive",
    })
    setEditingElection(null)
    setError("")
  }

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setSubmitting(true)
    setError("")

    try {
      const positions = formData.positions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)

      await addDoc(collection(db, "elections"), {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        positions,
        status: formData.status,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      })

      setShowCreateDialog(false)
      resetForm()
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
      const positions = formData.positions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)

      await updateDoc(doc(db, "elections", editingElection.id), {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        positions,
        status: formData.status,
      })

      setEditingElection(null)
      resetForm()
    } catch (error) {
      console.error("Error updating election:", error)
      setError("Failed to update election")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteElection = async (electionId: string) => {
    if (!confirm("Are you sure you want to delete this election? This action cannot be undone.")) return

    try {
      await deleteDoc(doc(db, "elections", electionId))
    } catch (error) {
      console.error("Error deleting election:", error)
      setError("Failed to delete election")
    }
  }

  const startEdit = (election: Election) => {
    setEditingElection(election)
    setFormData({
      title: election.title,
      description: election.description,
      startDate: election.startDate?.toISOString().slice(0, 16) || "",
      endDate: election.endDate?.toISOString().slice(0, 16) || "",
      positions: election.positions.join(", "),
      status: election.status,
    })
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
          <h1 className="text-3xl font-bold">Elections Management</h1>
          <p className="text-muted-foreground">Create and manage elections</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Election</DialogTitle>
              <DialogDescription>Set up a new election with positions and candidates</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateElection} className="space-y-4">
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
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
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
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="positions">Positions (comma-separated)</Label>
                <Input
                  id="positions"
                  placeholder="President, Vice President, Secretary, Treasurer"
                  value={formData.positions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, positions: e.target.value }))}
                  required
                />
                <p className="text-sm text-muted-foreground">Enter positions separated by commas</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Election"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingElection} onOpenChange={(open) => !open && setEditingElection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Election</DialogTitle>
            <DialogDescription>Update election details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateElection} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Election Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date & Time</Label>
                <Input
                  id="edit-startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date & Time</Label>
                <Input
                  id="edit-endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-positions">Positions (comma-separated)</Label>
              <Input
                id="edit-positions"
                placeholder="President, Vice President, Secretary, Treasurer"
                value={formData.positions}
                onChange={(e) => setFormData((prev) => ({ ...prev, positions: e.target.value }))}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingElection(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Election"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Elections List */}
      <div className="grid gap-6">
        {elections.map((election) => (
          <Card key={election.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{election.title}</CardTitle>
                  <CardDescription className="mt-2">{election.description}</CardDescription>
                </div>
                <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Starts: {election.startDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Ends: {election.endDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{election.positions.length} Positions</span>
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
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/elections/${election.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/candidates?election=${election.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Candidates
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startEdit(election)}>
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
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Election
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function ElectionsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <ElectionsManagement />
    </AuthGuard>
  )
}
