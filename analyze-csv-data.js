// Fetch and analyze the election CSV data
async function analyzeElectionData() {
  try {
    console.log("Fetching election data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/election-5WDsio7tz6dkqJD6djdkuYLcBsXmlb.csv",
    )
    const csvText = await response.text()

    console.log("Election CSV Data:")
    console.log("=".repeat(50))
    console.log(csvText.slice(0, 1000) + "...")

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("\nElection Headers:", headers)

    // Show first few records
    console.log("\nFirst 3 Election Records:")
    for (let i = 1; i <= 3 && i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const record = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ""
        })
        console.log(`Record ${i}:`, record)
      }
    }

    return { headers, totalRecords: lines.length - 1 }
  } catch (error) {
    console.error("Error fetching election data:", error)
  }
}

// Fetch and analyze the candidates CSV data
async function analyzeCandidatesData() {
  try {
    console.log("\n\nFetching candidates data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/candidates-irU1aC84zQ23oVuzn9evfkNgr29JOZ.csv",
    )
    const csvText = await response.text()

    console.log("Candidates CSV Data:")
    console.log("=".repeat(50))
    console.log(csvText.slice(0, 1000) + "...")

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("\nCandidates Headers:", headers)

    // Show first few records
    console.log("\nFirst 3 Candidate Records:")
    for (let i = 1; i <= 3 && i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const record = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ""
        })
        console.log(`Record ${i}:`, record)
      }
    }

    return { headers, totalRecords: lines.length - 1 }
  } catch (error) {
    console.error("Error fetching candidates data:", error)
  }
}

// Run analysis
async function main() {
  const electionData = await analyzeElectionData()
  const candidatesData = await analyzeCandidatesData()

  console.log("\n\nSUMMARY:")
  console.log("=".repeat(50))
  console.log(`Elections: ${electionData?.totalRecords || 0} records`)
  console.log(`Candidates: ${candidatesData?.totalRecords || 0} records`)
}

main()
