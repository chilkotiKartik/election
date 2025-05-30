import { LocalStorageDB } from "./local-storage-db"
import type { User, Election, Candidate, Vote } from "./types"
import { v4 as uuidv4 } from "uuid"

export class DemoDataService {
  static readonly DEMO_ELECTIONS = [
    {
      title: "Student Council Elections 2024",
      description: "Annual student council elections for leadership positions",
      status: "active" as const,
      positions: ["President", "Vice President", "Secretary", "Treasurer"],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Tech Club Leadership",
      description: "Elections for technical club leadership positions",
      status: "active" as const,
      positions: ["President", "Technical Lead", "Event Coordinator"],
      startDate: new Date(),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Sports Committee Elections",
      description: "Choose your sports committee representatives",
      status: "active" as const,
      positions: ["Sports Captain", "Vice Captain", "Equipment Manager"],
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Cultural Society Elections",
      description: "Elections for cultural activities and events management",
      status: "active" as const,
      positions: ["Cultural Secretary", "Event Manager", "Media Head"],
      startDate: new Date(),
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    },
  ]

  static readonly DEMO_USERS = [
    {
      name: "Admin User",
      email: "admin@votesecure.com",
      password: "admin123",
      role: "admin" as const,
    },
    {
      name: "John Voter",
      email: "voter1@votesecure.com",
      password: "voter123",
      role: "voter" as const,
    },
    {
      name: "Jane Student",
      email: "voter2@votesecure.com",
      password: "voter123",
      role: "voter" as const,
    },
    {
      name: "Mike Wilson",
      email: "voter3@votesecure.com",
      password: "voter123",
      role: "voter" as const,
    },
    {
      name: "Sarah Johnson",
      email: "voter4@votesecure.com",
      password: "voter123",
      role: "voter" as const,
    },
  ]

  static readonly DEMO_CANDIDATES = [
    // Student Council Elections
    {
      name: "Alex Johnson",
      bio: "Third-year Computer Science student with leadership experience in multiple student organizations. Passionate about improving campus life and student services.",
      position: "President",
      electionTitle: "Student Council Elections 2024",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Sarah Chen",
      bio: "Experienced student leader with a focus on academic excellence and student welfare. Advocates for better study facilities and mental health support.",
      position: "President",
      electionTitle: "Student Council Elections 2024",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Michael Rodriguez",
      bio: "Business Administration student with strong organizational skills. Committed to enhancing student engagement and campus activities.",
      position: "Vice President",
      electionTitle: "Student Council Elections 2024",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Emily Davis",
      bio: "Environmental Science major passionate about sustainability initiatives on campus. Experienced in event planning and student coordination.",
      position: "Vice President",
      electionTitle: "Student Council Elections 2024",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "David Kim",
      bio: "Mathematics student with excellent record-keeping skills and attention to detail. Committed to transparent financial management.",
      position: "Secretary",
      electionTitle: "Student Council Elections 2024",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Lisa Thompson",
      bio: "Accounting major with experience in financial planning and budget management. Advocates for responsible spending of student funds.",
      position: "Treasurer",
      electionTitle: "Student Council Elections 2024",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    // Tech Club Leadership
    {
      name: "Ryan Patel",
      bio: "Senior Software Engineering student with internship experience at major tech companies. Passionate about coding competitions and hackathons.",
      position: "President",
      electionTitle: "Tech Club Leadership",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Jessica Wu",
      bio: "AI/ML enthusiast with research experience. Wants to organize workshops on emerging technologies and industry connections.",
      position: "Technical Lead",
      electionTitle: "Tech Club Leadership",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Carlos Martinez",
      bio: "Event management expert with experience organizing tech conferences and meetups. Skilled in coordinating large-scale technical events.",
      position: "Event Coordinator",
      electionTitle: "Tech Club Leadership",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    // Sports Committee Elections
    {
      name: "Jordan Smith",
      bio: "Varsity basketball player with leadership experience. Committed to promoting sports participation and improving athletic facilities.",
      position: "Sports Captain",
      electionTitle: "Sports Committee Elections",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Maya Singh",
      bio: "Track and field athlete with experience in team coordination. Focuses on inclusive sports programs for all skill levels.",
      position: "Vice Captain",
      electionTitle: "Sports Committee Elections",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Tom Wilson",
      bio: "Equipment management specialist with experience in inventory and maintenance. Ensures all sports equipment is properly maintained.",
      position: "Equipment Manager",
      electionTitle: "Sports Committee Elections",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    // Cultural Society Elections
    {
      name: "Priya Sharma",
      bio: "Performing arts enthusiast with experience in organizing cultural festivals. Passionate about celebrating diversity through arts.",
      position: "Cultural Secretary",
      electionTitle: "Cultural Society Elections",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "James Brown",
      bio: "Event planning professional with experience in large-scale cultural events. Specializes in logistics and vendor coordination.",
      position: "Event Manager",
      electionTitle: "Cultural Society Elections",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Aisha Ahmed",
      bio: "Digital media expert with skills in photography, videography, and social media management. Creates engaging content for cultural events.",
      position: "Media Head",
      electionTitle: "Cultural Society Elections",
      imageUrl: "/placeholder.svg?height=200&width=200",
    },
  ]

  static checkDemoDataExists(): boolean {
    const elections = LocalStorageDB.getElections()
    return elections.some((e) => e.title === "Student Council Elections 2024")
  }

  static initializeAllDemoData(): {
    success: boolean
    message: string
    stats: { elections: number; candidates: number; users: number }
  } {
    try {
      if (this.checkDemoDataExists()) {
        return {
          success: false,
          message: "Demo data already exists",
          stats: { elections: 0, candidates: 0, users: 0 },
        }
      }

      console.log("Initializing demo data...")

      // Initialize users
      this.initializeDemoUsers()

      // Initialize elections
      const electionIds = this.initializeDemoElections()

      // Initialize candidates
      this.initializeDemoCandidates(electionIds)

      // Generate sample votes
      this.generateDemoVotes()

      return {
        success: true,
        message: "Demo data initialized successfully",
        stats: {
          elections: this.DEMO_ELECTIONS.length,
          candidates: this.DEMO_CANDIDATES.length,
          users: this.DEMO_USERS.length,
        },
      }
    } catch (error) {
      console.error("Error initializing demo data:", error)
      return {
        success: false,
        message: `Error initializing demo data: ${error}`,
        stats: { elections: 0, candidates: 0, users: 0 },
      }
    }
  }

  private static initializeDemoUsers(): void {
    for (const userData of this.DEMO_USERS) {
      try {
        const user: User = {
          uid: uuidv4(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          password: userData.password,
          createdAt: new Date(),
        }

        LocalStorageDB.saveUser(user)
        console.log(`Created user: ${userData.name}`)
      } catch (error) {
        console.error(`Error creating user ${userData.name}:`, error)
      }
    }
  }

  private static initializeDemoElections(): string[] {
    const electionIds: string[] = []

    for (const electionData of this.DEMO_ELECTIONS) {
      try {
        const election: Election = {
          id: uuidv4(),
          ...electionData,
          createdBy: "demo-admin",
          createdAt: new Date(),
        }

        const id = LocalStorageDB.saveElection(election)
        electionIds.push(id)
        console.log(`Created election: ${electionData.title}`)
      } catch (error) {
        console.error(`Error creating election ${electionData.title}:`, error)
      }
    }

    return electionIds
  }

  private static initializeDemoCandidates(electionIds: string[]): void {
    const elections = LocalStorageDB.getElections()
    const electionMap: Record<string, string> = {}

    for (const election of elections) {
      electionMap[election.title] = election.id
    }

    for (const candidateData of this.DEMO_CANDIDATES) {
      try {
        const electionId = electionMap[candidateData.electionTitle]
        if (electionId) {
          const candidate: Candidate = {
            id: uuidv4(),
            name: candidateData.name,
            bio: candidateData.bio,
            position: candidateData.position,
            electionId: electionId,
            imageUrl: candidateData.imageUrl,
            voteCount: Math.floor(Math.random() * 50),
            createdAt: new Date(),
          }

          LocalStorageDB.saveCandidate(candidate)
          console.log(`Created candidate: ${candidateData.name}`)
        }
      } catch (error) {
        console.error(`Error creating candidate ${candidateData.name}:`, error)
      }
    }
  }

  private static generateDemoVotes(): void {
    try {
      const elections = LocalStorageDB.getElections()
      const candidates = LocalStorageDB.getCandidates()
      const voters = LocalStorageDB.getUsers().filter((user) => user.role === "voter")

      // Generate random votes for first 3 voters in first 2 elections
      for (const voter of voters.slice(0, 3)) {
        for (const election of elections.slice(0, 2)) {
          const electionCandidates = candidates.filter((c) => c.electionId === election.id)
          const positions = [...new Set(electionCandidates.map((c) => c.position))]

          for (const position of positions) {
            const positionCandidates = electionCandidates.filter((c) => c.position === position)
            if (positionCandidates.length > 0) {
              const randomCandidate = positionCandidates[Math.floor(Math.random() * positionCandidates.length)]

              const vote: Vote = {
                id: uuidv4(),
                userId: voter.uid,
                electionId: election.id,
                candidateId: randomCandidate.id,
                position: position,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              }

              try {
                LocalStorageDB.saveVote(vote)
              } catch (error) {
                console.log(`Skipping duplicate vote for ${voter.name} in ${position}`)
              }
            }
          }
        }
      }

      console.log("Generated demo votes")
    } catch (error) {
      console.error("Error generating demo votes:", error)
    }
  }

  static quickDemoLogin(role: "admin" | "voter"): User | null {
    try {
      const email = role === "admin" ? "admin@votesecure.com" : "voter1@votesecure.com"
      const users = LocalStorageDB.getUsers()
      let user = users.find((u) => u.email === email)

      if (!user) {
        // Create user if doesn't exist
        const userData = this.DEMO_USERS.find((u) => u.email === email)
        if (userData) {
          user = {
            uid: uuidv4(),
            email: userData.email,
            name: userData.name,
            role: userData.role,
            password: userData.password,
            createdAt: new Date(),
          }
          LocalStorageDB.saveUser(user)
        }
      }

      if (user) {
        LocalStorageDB.setCurrentUser(user)
        return user
      }

      return null
    } catch (error) {
      console.error("Error with quick demo login:", error)
      return null
    }
  }
}
