import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground mb-6">Here's an overview of your account.</p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Advanced Admin Tools</h3>
              <p className="text-muted-foreground">Access comprehensive election management features</p>
            </div>
            <Button asChild size="lg">
              <Link href="/dashboard/admin">
                <Settings className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">Total Votes</h2>
            <p className="text-3xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">Registered Users</h2>
            <p className="text-3xl font-bold">567</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold">Active Elections</h2>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
