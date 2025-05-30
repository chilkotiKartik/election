"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Database, Settings, Sparkles } from "lucide-react"
import { FirebaseDataInitializer } from "@/components/firebase-data-initializer"
import { checkAuthConfiguration } from "@/lib/auth"
import Link from "next/link"

export default function InitializePage() {
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const isConfigured = await checkAuthConfiguration()
        setAuthConfigured(isConfigured)
      } catch (error) {
        setAuthConfigured(false)
      } finally {
        setChecking(false)
      }
    }

    checkConfiguration()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Database className="h-8 w-8" />
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Initialize VoteSecure Pro
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Set up your voting system with sample data and verify all functionality is working correctly
          </p>
        </div>

        {/* Status Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checking ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Checking Firebase configuration...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {authConfigured ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>Firebase Ready!</strong> Your system is properly configured.
                        </span>
                        <Badge variant="default" className="bg-green-600">
                          Ready
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>Setup Required:</strong> Firebase Authentication needs to be enabled.
                        </span>
                        <Badge variant="destructive">Not Ready</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {!authConfigured && (
                  <Button asChild>
                    <Link href="/setup">
                      <Settings className="mr-2 h-4 w-4" />
                      Complete Firebase Setup
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Initialization */}
        {authConfigured && (
          <div className="max-w-4xl mx-auto">
            <FirebaseDataInitializer />
          </div>
        )}

        {/* System Verification */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>System Verification</CardTitle>
            <CardDescription>Verify all components of your voting system are working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="checklist">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
                <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Authentication
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="auth-check-1" />
                        <label htmlFor="auth-check-1">Sign up with a new account</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="auth-check-2" />
                        <label htmlFor="auth-check-2">Sign in with existing account</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="auth-check-3" />
                        <label htmlFor="auth-check-3">Sign out functionality</label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Admin Features
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-check-1" />
                        <label htmlFor="admin-check-1">Create a new election</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-check-2" />
                        <label htmlFor="admin-check-2">Add candidates to an election</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-check-3" />
                        <label htmlFor="admin-check-3">View election results</label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Voter Features
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="voter-check-1" />
                        <label htmlFor="voter-check-1">Browse active elections</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="voter-check-2" />
                        <label htmlFor="voter-check-2">Cast votes for candidates</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="voter-check-3" />
                        <label htmlFor="voter-check-3">View voting history</label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="troubleshooting" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Authentication Issues</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Make sure Email/Password authentication is enabled in Firebase Console</li>
                      <li>Check browser console for any errors during sign-in/sign-up</li>
                      <li>Verify your Firebase configuration in lib/firebase.ts</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Database Issues</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Ensure Firestore Database is created in Firebase Console</li>
                      <li>Check security rules to allow read/write operations</li>
                      <li>Verify collection names match those used in the code</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Storage Issues</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Make sure Firebase Storage is enabled</li>
                      <li>Check storage rules to allow uploads</li>
                      <li>Verify storage bucket name in Firebase configuration</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="next-steps" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">1. Explore Admin Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sign in with admin@votesecure.com (password: admin123) to access the admin dashboard
                    </p>
                    <Button asChild size="sm">
                      <Link href="/dashboard">Go to Admin Dashboard</Link>
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">2. Cast Votes as a Voter</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sign in with voter1@votesecure.com (password: voter123) to browse elections and cast votes
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/vote">Go to Voting Page</Link>
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">3. View Real-time Results</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Check the results page to see real-time voting statistics
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/results">View Results</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
