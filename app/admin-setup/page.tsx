"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Database, CheckCircle, AlertCircle } from "lucide-react"
import { signUp } from "@/lib/auth"
import { getFirebaseErrorMessage } from "@/lib/firebase-admin"
import { FirebaseSetupGuide } from "@/components/firebase-setup-guide"
import { DataImport } from "@/components/data-import"

export default function AdminSetupPage() {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const createAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setSuccess(false)

    try {
      await signUp(adminData.email, adminData.password, adminData.name, "admin")
      setSuccess(true)
      setAdminData({ name: "", email: "", password: "" })
    } catch (error: any) {
      setError(getFirebaseErrorMessage(error.code))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">System Setup & Configuration</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete the initial setup of your voting system, create admin accounts, and import election data
          </p>
        </div>

        <Tabs defaultValue="firebase" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="firebase">Firebase Setup</TabsTrigger>
            <TabsTrigger value="admin">Create Admin</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>

          <TabsContent value="firebase">
            <FirebaseSetupGuide />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Create Administrator Account</span>
                </CardTitle>
                <CardDescription>Create the first admin account to manage elections and candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createAdminAccount} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Admin account created successfully! You can now sign in with these credentials.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      value={adminData.name}
                      onChange={(e) => setAdminData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Administrator Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminData.email}
                      onChange={(e) => setAdminData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminData.password}
                      onChange={(e) => setAdminData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={creating}>
                    {creating ? "Creating Account..." : "Create Admin Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Import Election Data</span>
                </CardTitle>
                <CardDescription>
                  Import candidates, elections, and user accounts from the provided CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Prerequisites:</strong> Make sure you have completed Firebase setup and created an admin
                      account first.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center">
                    <DataImport />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">CSV Data Includes:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Candidate names and bios</li>
                        <li>• Election and position information</li>
                        <li>• Email addresses for user accounts</li>
                        <li>• Profile images and manifesto URLs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Import Process:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Creates elections automatically</li>
                        <li>• Generates user accounts with temp passwords</li>
                        <li>• Sets up candidate profiles</li>
                        <li>• Links candidates to appropriate elections</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
