"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Settings, Sparkles } from "lucide-react"
import { FirebaseSetupGuide } from "@/components/firebase-setup-guide"
import { checkAuthConfiguration } from "@/lib/auth"
import Link from "next/link"

export default function SetupPage() {
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

  const recheckConfiguration = async () => {
    setChecking(true)
    try {
      const isConfigured = await checkAuthConfiguration()
      setAuthConfigured(isConfigured)
    } catch (error) {
      setAuthConfigured(false)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Settings className="h-8 w-8" />
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Firebase Setup for VoteSecure Pro
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete the Firebase configuration to enable authentication, database, and storage for your voting system
          </p>
        </div>

        {/* Status Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuration Status</span>
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
                          <strong>Configuration Complete!</strong> Firebase is properly set up and ready to use.
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

                <div className="flex space-x-2">
                  <Button onClick={recheckConfiguration} variant="outline" disabled={checking}>
                    {checking ? "Checking..." : "Recheck Configuration"}
                  </Button>
                  {authConfigured && (
                    <Button asChild className="bg-gradient-to-r from-green-600 to-blue-600">
                      <Link href="/auth">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Using VoteSecure Pro
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Guide */}
        <FirebaseSetupGuide />

        {/* Next Steps */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>After Setup</CardTitle>
            <CardDescription>What you can do once Firebase is configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">For Administrators:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Create and manage elections</li>
                  <li>• Add candidates with photos</li>
                  <li>• Monitor real-time results</li>
                  <li>• Export voting data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">For Voters:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Browse active elections</li>
                  <li>• View candidate profiles</li>
                  <li>• Cast secure votes</li>
                  <li>• View live results</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
