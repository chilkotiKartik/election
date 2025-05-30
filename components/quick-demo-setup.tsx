"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Zap, User, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { DemoDataService } from "@/lib/demo-data-service"
import { useRouter } from "next/navigation"

export function QuickDemoSetup() {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleQuickLogin = async (role: "admin" | "voter") => {
    setLoading(role)
    setMessage(null)

    try {
      const user = DemoDataService.quickDemoLogin(role)

      if (user) {
        setMessage({ type: "success", text: `Signed in as ${role}!` })

        // Redirect based on role
        setTimeout(() => {
          router.push(role === "admin" ? "/dashboard" : "/vote")
        }, 1000)
      } else {
        throw new Error("Failed to create demo account")
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Quick Demo Setup</span>
        </CardTitle>
        <CardDescription>
          Get started instantly with pre-configured demo accounts. Perfect for testing the voting system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Admin Demo */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Admin Demo</span>
                </span>
                <Badge variant="default">Administrator</Badge>
              </CardTitle>
              <CardDescription>Full access to manage elections, candidates, and view analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> admin@votesecure.com
                </div>
                <div>
                  <span className="font-medium">Password:</span> admin123
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Admin Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create and manage elections</li>
                  <li>• Add candidates with photos</li>
                  <li>• View real-time results</li>
                  <li>• Export voting data</li>
                  <li>• User management</li>
                </ul>
              </div>

              <Button className="w-full" onClick={() => handleQuickLogin("admin")} disabled={loading === "admin"}>
                {loading === "admin" ? "Setting up..." : "Start as Admin"}
              </Button>
            </CardContent>
          </Card>

          {/* Voter Demo */}
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Voter Demo</span>
                </span>
                <Badge variant="secondary">Voter</Badge>
              </CardTitle>
              <CardDescription>Experience the voting process from a student's perspective</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> voter1@votesecure.com
                </div>
                <div>
                  <span className="font-medium">Password:</span> voter123
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Voter Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Browse active elections</li>
                  <li>• View candidate profiles</li>
                  <li>• Cast votes securely</li>
                  <li>• View live results</li>
                  <li>• Track voting history</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleQuickLogin("voter")}
                disabled={loading === "voter"}
              >
                {loading === "voter" ? "Setting up..." : "Start as Voter"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> These demo accounts work entirely with local storage. No server or Firebase setup is
            required!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
