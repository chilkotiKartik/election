"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, ArrowRight } from "lucide-react"
import { QuickDemoSetup } from "@/components/quick-demo-setup"
import { initializeAllDemoData } from "@/lib/demo-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Check if this is the first visit
    const isFirstVisit = !localStorage.getItem("votesecure_visited")

    if (isFirstVisit) {
      // Initialize demo data automatically on first visit
      initializeAllDemoData()
      localStorage.setItem("votesecure_visited", "true")
      setInitialized(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to VoteSecure</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your complete voting system is ready to use! All data is stored locally in your browser.
          </p>
        </div>

        {initialized && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Demo data has been automatically initialized for you. You can start using the system right away!
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="quick-start" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
            <TabsTrigger value="about">About VoteSecure</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-start" className="space-y-6">
            <QuickDemoSetup />

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Follow these steps to explore the voting system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-4">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <h3 className="font-medium">Browse Elections</h3>
                    <p className="text-sm text-muted-foreground">View active elections and their details</p>
                    <Button variant="outline" asChild>
                      <Link href="/vote">
                        View Elections <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-medium">Cast Your Vote</h3>
                    <p className="text-sm text-muted-foreground">Select candidates and submit your vote</p>
                    <Button variant="outline" asChild>
                      <Link href="/vote">
                        Vote Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <h3 className="font-medium">View Results</h3>
                    <p className="text-sm text-muted-foreground">Check real-time election results</p>
                    <Button variant="outline" asChild>
                      <Link href="/results">
                        See Results <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About VoteSecure</CardTitle>
                <CardDescription>A secure and transparent voting platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  VoteSecure is a comprehensive voting system designed to facilitate secure, transparent, and accessible
                  elections. Whether you're organizing student council elections, club leadership votes, or community
                  polls, VoteSecure provides all the tools you need.
                </p>

                <h3 className="font-medium text-lg mt-4">Key Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Secure authentication and vote verification</li>
                  <li>Real-time results and analytics</li>
                  <li>Candidate profiles and election information</li>
                  <li>Admin dashboard for election management</li>
                  <li>Mobile-friendly responsive design</li>
                  <li>Data export and reporting tools</li>
                </ul>

                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link href="/setup">
                      Set Up Firebase <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
