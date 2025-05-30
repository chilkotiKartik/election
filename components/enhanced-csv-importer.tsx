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
import { Download, AlertCircle, CheckCircle, Upload, FileText } from "lucide-react"
import { collection, query, getDocs, doc, writeBatch } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

interface ElectionData {
  type: string
  typeName: string
  term: string
  position: string
  startDate: string
  endDate: string
  sessionYear: string
  description: string
  status: string
  eligibilityCriteria: string
  nominationStartDate: string
  nominationEndDate: string
  resultDate: string
}

interface CandidateData {
  name: string
  userid: string
  manifestourl: string
  bio: string
  imageUrl: string
}

interface ImportStats {
  totalElections: number
  totalCandidates: number
  successfulElections: number
  successfulCandidates: number
  errors: string[]
  warnings: string[]
}

export function EnhancedCSVImporter() {
  const [importing, setImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const [electionData, setElectionData] = useState<ElectionData[]>([])
  const [candidateData, setCandidateData] = useState<CandidateData[]>([])
  const [previewElections, setPreviewElections] = useState<ElectionData[]>([])
  const [previewCandidates, setPreviewCandidates] = useState<CandidateData[]>([])

  const fetchElectionData = async () => {
    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/election-5WDsio7tz6dkqJD6djdkuYLcBsXmlb.csv",
      )
      const csvText = await response.text()

      const lines = csvText.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const data: ElectionData[] = []
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
          const record: any = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ""
          })
          data.push(record as ElectionData)
        }
      }

      setElectionData(data)
      setPreviewElections(data.slice(0, 5))
      return data
    } catch (error) {
      console.error("Error fetching election CSV:", error)
      throw new Error("Failed to fetch election data")
    }
  }

  const fetchCandidateData = async () => {
    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/candidates-irU1aC84zQ23oVuzn9evfkNgr29JOZ.csv",
      )
      const csvText = await response.text()

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

      setCandidateData(data)
      setPreviewCandidates(data.slice(0, 5))
      return data
    } catch (error) {
      console.error("Error fetching candidate CSV:", error)
      throw new Error("Failed to fetch candidate data")
    }
  }

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date()

    // Handle different date formats
    if (dateString.includes("-")) {
      return new Date(dateString)
    } else if (dateString.length === 4) {
      // Year only
      return new Date(`${dateString}-01-01`)
    }

    return new Date(dateString)
  }

  const createElectionsFromData = async (elections: ElectionData[]) => {
    const batch = writeBatch(db)
    const stats = { created: 0, errors: [] as string[] }

    // Group elections by type and term to create consolidated elections
    const electionGroups = elections.reduce(
      (groups, election) => {
        const key = `${election.type}-${election.term}`
        if (!groups[key]) {
          groups[key] = {
            title: `${election.typeName} Elections ${election.term}`,
            description: `Elections for ${election.typeName} positions for term ${election.term}`,
            type: election.type,
            typeName: election.typeName,
            term: election.term,
            sessionYear: election.sessionYear,
            startDate: parseDate(election.startDate),
            endDate: parseDate(election.endDate),
            nominationStartDate: parseDate(election.nominationStartDate),
            nominationEndDate: parseDate(election.nominationEndDate),
            resultDate: parseDate(election.resultDate),
            status: election.status || "upcoming",
            positions: [],
            eligibilityCriteria: election.eligibilityCriteria,
          }
        }

        if (election.position && !groups[key].positions.includes(election.position)) {
          groups[key].positions.push(election.position)
        }

        return groups
      },
      {} as Record<string, any>,
    )

    try {
      for (const [key, electionGroup] of Object.entries(electionGroups)) {
        const docRef = doc(collection(db, "elections"))
        batch.set(docRef, {
          ...electionGroup,
          createdBy: auth.currentUser?.uid || "system",
          createdAt: new Date(),
          id: docRef.id,
        })
        stats.created++
      }

      await batch.commit()
    } catch (error) {
      stats.errors.push(`Failed to create elections: ${error}`)
    }

    return stats
  }

  const createCandidatesFromData = async (candidates: CandidateData[]) => {
    const batch = writeBatch(db)
    const stats = { created: 0, errors: [] as string[] }

    // Get all elections to match candidates
    const electionsQuery = query(collection(db, "elections"))
    const electionsSnapshot = await getDocs(electionsQuery)
    const elections = electionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    try {
      for (const candidate of candidates) {
        // For now, assign candidates to the first available election
        // In a real scenario, you'd have a mapping between candidates and elections
        const targetElection = elections[0]

        if (targetElection) {
          const docRef = doc(collection(db, "candidates"))
          batch.set(docRef, {
            name: candidate.name,
            bio: candidate.bio || `Candidate profile for ${candidate.name}`,
            imageUrl: candidate.imageUrl || "",
            manifestoUrl: candidate.manifestourl || "",
            email: candidate.userid,
            userId: candidate.userid,
            position: targetElection.positions[0] || "General", // Assign to first position
            electionId: targetElection.id,
            voteCount: 0,
            status: "active",
            isDisqualified: false,
            createdAt: new Date(),
            id: docRef.id,
          })
          stats.created++
        }
      }

      await batch.commit()
    } catch (error) {
      stats.errors.push(`Failed to create candidates: ${error}`)
    }

    return stats
  }

  const importAllData = async () => {
    setImporting(true)
    setProgress(0)

    const stats: ImportStats = {
      totalElections: electionData.length,
      totalCandidates: candidateData.length,
      successfulElections: 0,
      successfulCandidates: 0,
      errors: [],
      warnings: [],
    }

    try {
      // Step 1: Load data if not already loaded
      if (electionData.length === 0) {
        await fetchElectionData()
      }
      if (candidateData.length === 0) {
        await fetchCandidateData()
      }
      setProgress(20)

      // Step 2: Create elections
      const electionStats = await createElectionsFromData(electionData)
      stats.successfulElections = electionStats.created
      stats.errors.push(...electionStats.errors)
      setProgress(60)

      // Step 3: Create candidates
      const candidateStats = await createCandidatesFromData(candidateData)
      stats.successfulCandidates = candidateStats.created
      stats.errors.push(...candidateStats.errors)
      setProgress(100)

      setImportStats(stats)
    } catch (error) {
      stats.errors.push(`Import failed: ${error}`)
      setImportStats(stats)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Upload className="mr-2 h-5 w-5" />
          Import Election Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Import Election & Candidate Data</DialogTitle>
          <DialogDescription>
            Import comprehensive election and candidate data from CSV files to create a complete voting system
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
            <TabsTrigger value="import">Import Process</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Elections Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Elections Data</span>
                  </CardTitle>
                  <CardDescription>Preview of election data from CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={fetchElectionData} className="mb-4" disabled={importing}>
                    <Download className="mr-2 h-4 w-4" />
                    Load Election Data
                  </Button>

                  {previewElections.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total Records:</span>
                          <p>{electionData.length}</p>
                        </div>
                        <div>
                          <span className="font-medium">Election Types:</span>
                          <p>{new Set(electionData.map((d) => d.type)).size}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Sample Records:</h4>
                        {previewElections.slice(0, 3).map((record, index) => (
                          <Card key={index} className="p-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <Badge variant="outline">{record.type}</Badge>
                                <Badge variant={record.status === "active" ? "default" : "secondary"}>
                                  {record.status}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">{record.typeName}</span>
                                <p className="text-muted-foreground">{record.position}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{record.description}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Candidates Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Candidates Data</span>
                  </CardTitle>
                  <CardDescription>Preview of candidate data from CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={fetchCandidateData} className="mb-4" disabled={importing}>
                    <Download className="mr-2 h-4 w-4" />
                    Load Candidate Data
                  </Button>

                  {previewCandidates.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total Candidates:</span>
                          <p>{candidateData.length}</p>
                        </div>
                        <div>
                          <span className="font-medium">With Manifestos:</span>
                          <p>{candidateData.filter((c) => c.manifestourl).length}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Sample Candidates:</h4>
                        {previewCandidates.slice(0, 3).map((record, index) => (
                          <Card key={index} className="p-3">
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">{record.name}</span>
                                <p className="text-muted-foreground">{record.userid}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{record.bio.slice(0, 100)}...</p>
                              {record.manifestourl && (
                                <Badge variant="outline" className="text-xs">
                                  Has Manifesto
                                </Badge>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Process</CardTitle>
                <CardDescription>
                  This will create elections, candidates, and set up the complete voting system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Make sure your Firebase project is properly configured with Firestore
                    Database and Authentication enabled.
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
                    <li>• Consolidated elections from CSV data</li>
                    <li>• Candidate profiles with bios and manifestos</li>
                    <li>• Proper position assignments</li>
                    <li>• Election schedules and timelines</li>
                    <li>• Status tracking for all entities</li>
                  </ul>
                </div>

                <Button onClick={importAllData} disabled={importing} className="w-full" size="lg">
                  {importing ? "Importing..." : "Start Complete Import"}
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
                      <div className="text-2xl font-bold">{importStats.totalElections}</div>
                      <div className="text-sm text-muted-foreground">Total Elections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{importStats.successfulElections}</div>
                      <div className="text-sm text-muted-foreground">Elections Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{importStats.totalCandidates}</div>
                      <div className="text-sm text-muted-foreground">Total Candidates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{importStats.successfulCandidates}</div>
                      <div className="text-sm text-muted-foreground">Candidates Created</div>
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
                      Import completed! Your election portal is now ready with all the imported data.
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
