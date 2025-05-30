"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, AlertCircle, CheckCircle, Database } from "lucide-react"
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { signUp } from "@/lib/auth"
import { getFirebaseErrorMessage } from "@/lib/firebase-admin"

interface CandidateData {
  name: string
  election: string
  position: string
  email: string
  year: string
  userid: string
  manifestourl: string
  bio: string
  imageUrl: string
}

interface ImportStats {
  totalRecords: number
  successfulImports: number
  errors: string[]
  electionsCreated: number
  candidatesCreated: number
  usersCreated: number
}

export function DataImport() {
  const [importing, setImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const [csvData, setCsvData] = useState<CandidateData[]>([])
  const [previewData, setPreviewData] = useState<CandidateData[]>([])

  const fetchCSVData = async () => {
    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/data-Fj8IvDqYwmkDH6t0fs9gAWY2e4UCvb.csv",
      )
      const csvText = await response.text()

      // Parse CSV
      const lines = csvText.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const data: CandidateData[] = []
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
          const record: any = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ""
          })
          data.push(record as CandidateData)
        }
      }

      setCsvData(data)
      setPreviewData(data.slice(0, 5)) // Show first 5 records for preview
      return data
    } catch (error) {
      console.error("Error fetching CSV:", error)
      throw new Error("Failed to fetch CSV data")
    }
  }

  const createElectionIfNotExists = async (electionTitle: string, positions: string[]) => {
    try {
      // Check if election already exists
      const electionsQuery = query(collection(db, "elections"), where("title", "==", electionTitle))
      const existingElections = await getDocs(electionsQuery)

      if (existingElections.empty) {
        // Create new election
        const electionData = {
          title: electionTitle,
          description: `Election for ${electionTitle} positions`,
          status: "active" as const,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          positions: positions,
          createdBy: auth.currentUser?.uid || "system",
          createdAt: new Date(),
        }

        const docRef = await addDoc(collection(db, "elections"), electionData)
        return docRef.id
      } else {
        return existingElections.docs[0].id
      }
    } catch (error) {
      console.error("Error creating election:", error)
      throw error
    }
  }

  const createUserAccount = async (email: string, name: string, role: "voter" | "admin" = "voter") => {
    try {
      // Check if user already exists
      const usersQuery = query(collection(db, "users"), where("email", "==", email))
      const existingUsers = await getDocs(usersQuery)

      if (existingUsers.empty) {
        // Generate a temporary password
        const tempPassword = `temp${Math.random().toString(36).slice(-8)}`

        try {
          await signUp(email, tempPassword, name, role)
          return { created: true, tempPassword }
        } catch (authError: any) {
          // If user creation fails, still create the user document for reference
          const userId = email.replace(/[^a-zA-Z0-9]/g, "_")
          await setDoc(doc(db, "users", userId), {
            uid: userId,
            email,
            name,
            role,
            createdAt: new Date(),
            needsPasswordReset: true,
          })
          return { created: false, error: getFirebaseErrorMessage(authError.code) }
        }
      }
      return { created: false, exists: true }
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  const importData = async () => {
    if (csvData.length === 0) {
      await fetchCSVData()
    }

    setImporting(true)
    setProgress(0)

    const stats: ImportStats = {
      totalRecords: csvData.length,
      successfulImports: 0,
      errors: [],
      electionsCreated: 0,
      candidatesCreated: 0,
      usersCreated: 0,
    }

    try {
      // Group data by election
      const electionGroups = csvData.reduce(
        (groups, record) => {
          if (!groups[record.election]) {
            groups[record.election] = []
          }
          groups[record.election].push(record)
          return groups
        },
        {} as Record<string, CandidateData[]>,
      )

      const totalSteps = Object.keys(electionGroups).length + csvData.length
      let currentStep = 0

      // Create elections
      const electionIds: Record<string, string> = {}
      for (const [electionTitle, candidates] of Object.entries(electionGroups)) {
        try {
          const positions = [...new Set(candidates.map((c) => c.position))]
          const electionId = await createElectionIfNotExists(electionTitle, positions)
          electionIds[electionTitle] = electionId
          stats.electionsCreated++

          currentStep++
          setProgress((currentStep / totalSteps) * 100)
        } catch (error) {
          stats.errors.push(`Failed to create election "${electionTitle}": ${error}`)
        }
      }

      // Create users and candidates
      for (const record of csvData) {
        try {
          // Create user account
          const userResult = await createUserAccount(record.email, record.name, "voter")
          if (userResult.created) {
            stats.usersCreated++
          }

          // Create candidate
          const electionId = electionIds[record.election]
          if (electionId) {
            await addDoc(collection(db, "candidates"), {
              name: record.name,
              bio: record.bio || `Candidate for ${record.position}`,
              position: record.position,
              electionId: electionId,
              imageUrl: record.imageUrl || "",
              manifestoUrl: record.manifestourl || "",
              email: record.email,
              year: record.year,
              userId: record.userid,
              voteCount: 0,
              createdAt: new Date(),
            })
            stats.candidatesCreated++
            stats.successfulImports++
          } else {
            stats.errors.push(`No election found for candidate ${record.name}`)
          }

          currentStep++
          setProgress((currentStep / totalSteps) * 100)
        } catch (error) {
          stats.errors.push(`Failed to import ${record.name}: ${error}`)
        }
      }

      setImportStats(stats)
    } catch (error) {
      stats.errors.push(`Import failed: ${error}`)
      setImportStats(stats)
    } finally {
      setImporting(false)
      setProgress(100)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Database className="mr-2 h-4 w-4" />
          Import CSV Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Election Data from CSV</DialogTitle>
          <DialogDescription>
            Import candidates, elections, and user accounts from the provided CSV file
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
            <TabsTrigger value="import">Import Process</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CSV Data Preview</CardTitle>
                <CardDescription>Preview of the first 5 records from the CSV file</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={fetchCSVData} className="mb-4" disabled={importing}>
                  <Download className="mr-2 h-4 w-4" />
                  Load CSV Data
                </Button>

                {previewData.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Records:</span>
                        <p>{csvData.length}</p>
                      </div>
                      <div>
                        <span className="font-medium">Elections:</span>
                        <p>{new Set(csvData.map((d) => d.election)).size}</p>
                      </div>
                      <div>
                        <span className="font-medium">Positions:</span>
                        <p>{new Set(csvData.map((d) => d.position)).size}</p>
                      </div>
                      <div>
                        <span className="font-medium">Candidates:</span>
                        <p>{csvData.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Sample Records:</h4>
                      {previewData.map((record, index) => (
                        <Card key={index} className="p-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-medium">{record.name}</span>
                              <p className="text-muted-foreground">{record.email}</p>
                            </div>
                            <div>
                              <Badge variant="outline">{record.election}</Badge>
                              <p className="text-muted-foreground">{record.position}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">{record.bio.slice(0, 100)}...</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Process</CardTitle>
                <CardDescription>This will create elections, user accounts, and candidate records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Make sure Email/Password authentication is enabled in your Firebase
                    Console. Go to Authentication → Sign-in method → Email/Password and enable it.
                  </AlertDescription>
                </Alert>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Import Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">What will be created:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Elections for each unique election name</li>
                    <li>• User accounts for each candidate (with temporary passwords)</li>
                    <li>• Candidate records with bio, manifesto, and image URLs</li>
                    <li>• Proper position assignments within elections</li>
                  </ul>
                </div>

                <Button onClick={importData} disabled={importing || csvData.length === 0} className="w-full">
                  {importing ? "Importing..." : "Start Import"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {importStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Import Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{importStats.totalRecords}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{importStats.successfulImports}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{importStats.electionsCreated}</div>
                      <div className="text-sm text-muted-foreground">Elections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{importStats.usersCreated}</div>
                      <div className="text-sm text-muted-foreground">Users</div>
                    </div>
                  </div>

                  {importStats.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">Errors:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {importStats.errors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Import completed! Users created with temporary passwords will need to reset their passwords on
                      first login.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
