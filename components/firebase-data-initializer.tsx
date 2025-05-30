"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Database, Users, Vote } from "lucide-react"
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, uploadString } from "firebase/storage"
import { db, auth, storage } from "@/lib/firebase"
import { v4 as uuidv4 } from "uuid"

// Sample data for initialization
const sampleElections = [
  {
    title: "Student Council Elections 2024",
    description: "Annual student council elections for leadership positions",
    status: "active",
    positions: ["President", "Vice President", "Secretary", "Treasurer"],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    title: "Tech Club Leadership",
    description: "Elections for technical club leadership positions",
    status: "active",
    positions: ["President", "Technical Lead", "Event Coordinator"],
    startDate: new Date(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Sports Committee Elections",
    description: "Choose your sports committee representatives",
    status: "active",
    positions: ["Sports Captain", "Vice Captain", "Equipment Manager"],
    startDate: new Date(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  },
]

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@votesecure.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "John Voter",
    email: "voter1@votesecure.com",
    password: "voter123",
    role: "voter",
  },
  {
    name: "Jane Student",
    email: "voter2@votesecure.com",
    password: "voter123",
    role: "voter",
  },
]

const sampleCandidates = [
  // Student Council Elections - will be linked to actual election IDs during initialization
  {
    name: "Alex Johnson",
    bio: "Third-year Computer Science student with leadership experience in multiple student organizations.",
    position: "President",
    electionTitle: "Student Council Elections 2024",
    voteCount: 0,
  },
  {
    name: "Sarah Chen",
    bio: "Experienced student leader with a focus on academic excellence and student welfare.",
    position: "President",
    electionTitle: "Student Council Elections 2024",
    voteCount: 0,
  },
  {
    name: "Michael Rodriguez",
    bio: "Business Administration student with strong organizational skills.",
    position: "Vice President",
    electionTitle: "Student Council Elections 2024",
    voteCount: 0,
  },
  {
    name: "Emily Davis",
    bio: "Environmental Science major passionate about sustainability initiatives on campus.",
    position: "Secretary",
    electionTitle: "Student Council Elections 2024",
    voteCount: 0,
  },
  {
    name: "David Kim",
    bio: "Mathematics student with excellent record-keeping skills and attention to detail.",
    position: "Treasurer",
    electionTitle: "Student Council Elections 2024",
    voteCount: 0,
  },
  // Tech Club Leadership
  {
    name: "Ryan Patel",
    bio: "Senior Software Engineering student with internship experience at major tech companies.",
    position: "President",
    electionTitle: "Tech Club Leadership",
    voteCount: 0,
  },
  {
    name: "Jessica Wu",
    bio: "AI/ML enthusiast with research experience. Wants to organize workshops on emerging technologies.",
    position: "Technical Lead",
    electionTitle: "Tech Club Leadership",
    voteCount: 0,
  },
  {
    name: "Carlos Martinez",
    bio: "Event management expert with experience organizing tech conferences and meetups.",
    position: "Event Coordinator",
    electionTitle: "Tech Club Leadership",
    voteCount: 0,
  },
  // Sports Committee Elections
  {
    name: "Jordan Smith",
    bio: "Varsity basketball player with leadership experience.",
    position: "Sports Captain",
    electionTitle: "Sports Committee Elections",
    voteCount: 0,
  },
  {
    name: "Maya Singh",
    bio: "Track and field athlete with experience in team coordination.",
    position: "Vice Captain",
    electionTitle: "Sports Committee Elections",
    voteCount: 0,
  },
]

// Generate a simple placeholder SVG for candidate images
const generatePlaceholderSVG = (name: string) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
  const colors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"]
  const color = colors[Math.floor(Math.random() * colors.length)]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${color}" />
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial" fontSize="80" fill="white">${initials}</text>
  </svg>`
}

export function FirebaseDataInitializer() {
  const [initializing, setInitializing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    stats: {
      elections: number
      candidates: number
      users: number
    }
  } | null>(null)

  const initializeData = async () => {
    setInitializing(true)
    setProgress(0)
    setResult(null)

    try {
      // Step 1: Create users (10%)
      setProgress(10)
      const createdUsers: Record<string, string> = {}

      for (const userData of sampleUsers) {
        try {
          // Create auth user
          const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)

          // Create user document
          await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            createdAt: serverTimestamp(),
          })

          createdUsers[userData.email] = userCredential.user.uid
        } catch (error: any) {
          console.error(`Error creating user ${userData.email}:`, error)
          // If user already exists, continue with next user
          if (error.code === "auth/email-already-in-use") {
            continue
          }
        }
      }

      // Step 2: Create elections (30%)
      setProgress(30)
      const createdElections: Record<string, string> = {}

      for (const electionData of sampleElections) {
        try {
          const adminId = createdUsers["admin@votesecure.com"] || "system"

          const electionRef = await addDoc(collection(db, "elections"), {
            title: electionData.title,
            description: electionData.description,
            status: electionData.status,
            positions: electionData.positions,
            startDate: electionData.startDate,
            endDate: electionData.endDate,
            createdBy: adminId,
            createdAt: serverTimestamp(),
          })

          createdElections[electionData.title] = electionRef.id
        } catch (error) {
          console.error(`Error creating election ${electionData.title}:`, error)
        }
      }

      // Step 3: Create candidates (60%)
      setProgress(60)
      let candidatesCreated = 0

      for (const candidateData of sampleCandidates) {
        try {
          const electionId = createdElections[candidateData.electionTitle]

          if (!electionId) {
            console.error(`Election not found for candidate ${candidateData.name}`)
            continue
          }

          // Generate placeholder image
          const svgString = generatePlaceholderSVG(candidateData.name)
          const imageId = uuidv4()
          const storageRef = ref(storage, `candidates/${imageId}.svg`)

          // Upload SVG to storage
          await uploadString(storageRef, svgString, "raw", { contentType: "image/svg+xml" })
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/candidates%2F${imageId}.svg?alt=media`

          // Create candidate document
          await addDoc(collection(db, "candidates"), {
            name: candidateData.name,
            bio: candidateData.bio,
            position: candidateData.position,
            electionId: electionId,
            imageUrl: imageUrl,
            voteCount: candidateData.voteCount,
            createdAt: serverTimestamp(),
          })

          candidatesCreated++
        } catch (error) {
          console.error(`Error creating candidate ${candidateData.name}:`, error)
        }
      }

      // Step 4: Finalize (100%)
      setProgress(100)
      setResult({
        success: true,
        message: "Sample data initialized successfully!",
        stats: {
          elections: Object.keys(createdElections).length,
          candidates: candidatesCreated,
          users: Object.keys(createdUsers).length,
        },
      })
    } catch (error) {
      console.error("Error initializing data:", error)
      setResult({
        success: false,
        message: `Error initializing data: ${error}`,
        stats: { elections: 0, candidates: 0, users: 0 },
      })
    } finally {
      setInitializing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Initialize Sample Data</span>
        </CardTitle>
        <CardDescription>
          Populate your Firebase database with sample elections, candidates, and user accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Data Details</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Vote className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold">{sampleElections.length}</div>
                <div className="text-sm text-muted-foreground">Elections</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold">{sampleCandidates.length}</div>
                <div className="text-sm text-muted-foreground">Candidates</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Database className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{sampleUsers.length}</div>
                <div className="text-sm text-muted-foreground">User Accounts</div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> This will create sample data in your Firebase database. It's safe to run multiple
                times as it will skip existing users.
              </AlertDescription>
            </Alert>

            {initializing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Initializing data...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button
              onClick={initializeData}
              disabled={initializing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {initializing ? "Initializing..." : "Initialize Sample Data"}
            </Button>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sample Elections</h3>
                <div className="space-y-2">
                  {sampleElections.map((election, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div className="font-medium">{election.title}</div>
                        <Badge>{election.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{election.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Positions: {election.positions.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Sample Users</h3>
                <div className="space-y-2">
                  {sampleUsers.map((user, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div className="font-medium">{user.name}</div>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">Password: {user.password}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {result && (
              <div className="space-y-4">
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                {result.success && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Vote className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <div className="text-2xl font-bold">{result.stats.elections}</div>
                      <div className="text-sm text-muted-foreground">Elections Created</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <div className="text-2xl font-bold">{result.stats.candidates}</div>
                      <div className="text-sm text-muted-foreground">Candidates Created</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Database className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <div className="text-2xl font-bold">{result.stats.users}</div>
                      <div className="text-sm text-muted-foreground">Users Created</div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Sign in with admin@votesecure.com (password: admin123)</li>
                    <li>Explore the admin dashboard to manage elections</li>
                    <li>Sign out and sign in with voter1@votesecure.com (password: voter123)</li>
                    <li>Browse elections and cast votes</li>
                    <li>View real-time results</li>
                  </ol>
                </div>
              </div>
            )}

            {!result && (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-16 w-16 mx-auto mb-4" />
                <p>Initialize sample data to see results here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
