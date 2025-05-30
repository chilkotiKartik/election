"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database } from "lucide-react"
import { DemoDataService } from "@/lib/demo-data-service"

export function AutoDemoInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeDemo = () => {
      try {
        // Check if this is first visit
        const hasVisited = localStorage.getItem("votesecure_initialized")

        if (!hasVisited) {
          console.log("First visit detected, initializing demo data...")
          const result = DemoDataService.initializeAllDemoData()

          if (result.success) {
            localStorage.setItem("votesecure_initialized", "true")
            setInitialized(true)
          }
        }
      } catch (error) {
        console.error("Error auto-initializing demo data:", error)
      } finally {
        setLoading(false)
      }
    }

    // Small delay to ensure localStorage is available
    setTimeout(initializeDemo, 100)
  }, [])

  if (loading) return null

  if (initialized) {
    return (
      <Alert className="mb-6">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Ready!</strong> Complete voting system with 4 elections, 15 candidates, and 5 user accounts has
          been set up for you.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
