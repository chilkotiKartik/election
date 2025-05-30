"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Users, Vote, Calendar, CheckCircle } from "lucide-react"
import { QuickDemoSetup } from "@/components/quick-demo-setup"
import { DemoDataInitializer } from "@/components/demo-data-initializer"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">VoteSecure Demo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the complete voting system with pre-configured demo data and accounts. Perfect for testing and
            demonstration purposes.
          </p>
        </div>

        <Tabs defaultValue="quick-start" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
            <TabsTrigger value="full-demo">Full Demo Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-start" className="space-y-6">
            <QuickDemoSetup />

            {/* Features Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <CardTitle className="text-lg">4 Elections</CardTitle>
                  <CardDescription>Student Council, Tech Club, Sports, Cultural</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <CardTitle className="text-lg">15 Candidates</CardTitle>
                  <CardDescription>With detailed bios and manifestos</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Vote className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <CardTitle className="text-lg">Live Voting</CardTitle>
                  <CardDescription>Real-time results and analytics</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Database className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <CardTitle className="text-lg">Full Features</CardTitle>
                  <CardDescription>Complete admin and voter experience</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="full-demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Complete Demo Environment</span>
                </CardTitle>
                <CardDescription>
                  Initialize a complete voting system with elections, candidates, users, and sample votes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Firebase Required:</strong> This option requires a properly configured Firebase project with
                    Firestore enabled. Make sure you have completed the Firebase setup first.
                  </AlertDescription>
                </Alert>

                <DemoDataInitializer />

                {/* Demo Data Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Elections Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Student Council Elections 2024</span>
                          <Badge variant="outline">4 positions</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tech Club Leadership</span>
                          <Badge variant="outline">3 positions</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sports Committee Elections</span>
                          <Badge variant="outline">3 positions</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Cultural Society Elections</span>
                          <Badge variant="outline">3 positions</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Demo Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>admin@votesecure.com</span>
                          <Badge>Admin</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>voter1@votesecure.com</span>
                          <Badge variant="secondary">Voter</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>voter2@votesecure.com</span>
                          <Badge variant="secondary">Voter</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>+ 2 more voters</span>
                          <Badge variant="outline">voter123</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Getting Started Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to explore the voting system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  1
                </div>
                <h3 className="font-semibold">Choose Demo Type</h3>
                <p className="text-sm text-muted-foreground">
                  Quick Start for immediate access or Full Demo for complete setup
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  2
                </div>
                <h3 className="font-semibold">Create Account</h3>
                <p className="text-sm text-muted-foreground">
                  Use demo credentials or create your own admin/voter account
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-bold">
                  3
                </div>
                <h3 className="font-semibold">Explore Features</h3>
                <p className="text-sm text-muted-foreground">
                  Test voting, view results, manage elections, and explore all features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
