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
import { Database, CheckCircle, AlertCircle, Users, Vote, Calendar } from "lucide-react"
import { DemoDataService } from "@/lib/demo-data-service"

interface DemoStats {
  elections: number
  candidates: number
  users: number
}

export function DemoDataInitializer() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    stats: DemoStats
  } | null>(null)
  const [open, setOpen] = useState(false)

  const initializeDemoData = async () => {
    setLoading(true)
    setProgress(0)
    setResult(null)

    try {
      // Check if data exists
      setProgress(10)
      const exists = DemoDataService.checkDemoDataExists()

      if (exists) {
        setResult({
          success: false,
          message: "Demo data already exists. Please clear existing data first.",
          stats: { elections: 0, candidates: 0, users: 0 },
        })
        setLoading(false)
        return
      }

      setProgress(25)

      // Initialize all demo data
      setTimeout(() => {
        setProgress(50)

        setTimeout(() => {
          setProgress(75)

          const initResult = DemoDataService.initializeAllDemoData()
          setProgress(100)
          setResult(initResult)
          setLoading(false)
        }, 500)
      }, 500)
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error}`,
        stats: { elections: 0, candidates: 0, users: 0 },
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Database className="mr-2 h-4 w-4" />
          Initialize Demo Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Initialize Demo Data</DialogTitle>
          <DialogDescription>
            Set up complete demo elections, candidates, and users for testing the voting system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Demo Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What will be created:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-muted-foreground">Elections</div>
                  <div className="text-xs text-muted-foreground mt-1">Student Council, Tech Club, Sports, Cultural</div>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-sm text-muted-foreground">Candidates</div>
                  <div className="text-xs text-muted-foreground mt-1">With bios and manifestos</div>
                </div>
                <div className="text-center">
                  <Vote className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-muted-foreground">Demo Users</div>
                  <div className="text-xs text-muted-foreground mt-1">1 Admin + 4 Voters</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo Accounts</CardTitle>
              <CardDescription>These accounts will be created for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">admin@votesecure.com</div>
                    <div className="text-sm text-muted-foreground">Password: admin123</div>
                  </div>
                  <Badge variant="default">Admin</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">voter1@votesecure.com</div>
                    <div className="text-sm text-muted-foreground">Password: voter123</div>
                  </div>
                  <Badge variant="secondary">Voter</Badge>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  + 3 more voter accounts (voter2, voter3, voter4)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Initializing demo data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                <div className="space-y-2">
                  <div>{result.message}</div>
                  {result.success && (
                    <div className="text-sm">
                      Created: {result.stats.elections} elections, {result.stats.candidates} candidates,{" "}
                      {result.stats.users} users
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={initializeDemoData} disabled={loading}>
              {loading ? "Initializing..." : "Initialize Demo Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
