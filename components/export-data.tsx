"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, FileText, Table } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Election, Vote, Candidate } from "@/lib/types"

interface ExportDataProps {
  elections: Election[]
}

export function ExportData({ elections }: ExportDataProps) {
  const [selectedElection, setSelectedElection] = useState("")
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [exporting, setExporting] = useState(false)
  const [open, setOpen] = useState(false)

  const exportElectionData = async () => {
    if (!selectedElection) return

    setExporting(true)

    try {
      // Fetch votes for the selected election
      const votesQuery = query(collection(db, "votes"), where("electionId", "==", selectedElection))
      const votesSnapshot = await getDocs(votesQuery)
      const votes = votesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Vote[]

      // Fetch candidates for the selected election
      const candidatesQuery = query(collection(db, "candidates"), where("electionId", "==", selectedElection))
      const candidatesSnapshot = await getDocs(candidatesQuery)
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Candidate[]

      const election = elections.find((e) => e.id === selectedElection)

      // Prepare export data
      const exportData = votes.map((vote) => {
        const candidate = candidates.find((c) => c.id === vote.candidateId)
        return {
          electionTitle: election?.title || "Unknown",
          position: vote.position,
          candidateName: candidate?.name || "Unknown",
          voterID: vote.userId,
          timestamp: vote.timestamp?.toISOString() || "",
          voteId: vote.id,
        }
      })

      // Export based on format
      if (exportFormat === "csv") {
        exportToCSV(exportData, `${election?.title || "election"}_votes.csv`)
      } else {
        exportToJSON(exportData, `${election?.title || "election"}_votes.json`)
      }

      setOpen(false)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
    ].join("\n")

    downloadFile(csvContent, filename, "text/csv")
  }

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, filename, "application/json")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Election Data</DialogTitle>
          <DialogDescription>Export voting data for analysis and record-keeping</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="election-select">Select Election</Label>
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an election to export" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format-select">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: "csv" | "json") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <Table className="mr-2 h-4 w-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    JSON (Data)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={exportElectionData} disabled={!selectedElection || exporting}>
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
