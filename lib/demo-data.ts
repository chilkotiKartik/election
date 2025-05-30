import { v4 as uuidv4 } from "uuid"
import {
  saveUser,
  saveElection,
  saveCandidate,
  saveVote,
  getElections,
  getCandidates,
  getUsers,
  setCurrentUser,
} from "./local-auth"
import type { User, Election, Candidate, Vote } from "./types"

// Demo Elections Data
export const demoElections = [
  {
    title: "Student Council Elections 2024",
    description: "Annual student council elections for leadership positions",
    status: "active" as const,
    positions: ["President", "Vice President", "Secretary", "Treasurer"],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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

// Demo Candidates Data
export const demoCandidates = [
  // Student Council Elections
  {
    name: "Alex Johnson",
    bio: "Third-year Computer Science student with leadership experience in multiple student organizations. Passionate about improving campus life and student services.",
    position: "President",
    electionTitle: "Student Council Elections 2024",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/alex-johnson",
    email: "alex.johnson@university.edu",
  },
  {
    name: "Sarah Chen",
    bio: "Experienced student leader with a focus on academic excellence and student welfare. Advocates for better study facilities and mental health support.",
    position: "President",
    electionTitle: "Student Council Elections 2024",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/sarah-chen",
    email: "sarah.chen@university.edu",
  },
  {
    name: "Michael Rodriguez",
    bio: "Business Administration student with strong organizational skills. Committed to enhancing student engagement and campus activities.",
    position: "Vice President",
    electionTitle: "Student Council Elections 2024",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/michael-rodriguez",
    email: "michael.rodriguez@university.edu",
  },
  {
    name: "Emily Davis",
    bio: "Environmental Science major passionate about sustainability initiatives on campus. Experienced in event planning and student coordination.",
    position: "Vice President",
    electionTitle: "Student Council Elections 2024",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/emily-davis",
    email: "emily.davis@university.edu",
  },
  {
    name: "David Kim",
    bio: "Mathematics student with excellent record-keeping skills and attention to detail. Committed to transparent financial management.",
    position: "Secretary",
    electionTitle: "Student Council Elections 2024",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/david-kim",
    email: "david.kim@university.edu",
  },
  {
    name: "Lisa Thompson",
    bio: "Accounting major with experience in financial planning and budget management. Advocates for responsible spending of student funds.",
    position: "Treasurer",
    electionTitle: "Student Council Elections 2024",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/lisa-thompson",
    email: "lisa.thompson@university.edu",
  },

  // Tech Club Leadership
  {
    name: "Ryan Patel",
    bio: "Senior Software Engineering student with internship experience at major tech companies. Passionate about coding competitions and hackathons.",
    position: "President",
    electionTitle: "Tech Club Leadership",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/ryan-patel",
    email: "ryan.patel@university.edu",
  },
  {
    name: "Jessica Wu",
    bio: "AI/ML enthusiast with research experience. Wants to organize workshops on emerging technologies and industry connections.",
    position: "Technical Lead",
    electionTitle: "Tech Club Leadership",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/jessica-wu",
    email: "jessica.wu@university.edu",
  },
  {
    name: "Carlos Martinez",
    bio: "Event management expert with experience organizing tech conferences and meetups. Skilled in coordinating large-scale technical events.",
    position: "Event Coordinator",
    electionTitle: "Tech Club Leadership",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/carlos-martinez",
    email: "carlos.martinez@university.edu",
  },

  // Sports Committee Elections
  {
    name: "Jordan Smith",
    bio: "Varsity basketball player with leadership experience. Committed to promoting sports participation and improving athletic facilities.",
    position: "Sports Captain",
    electionTitle: "Sports Committee Elections",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/jordan-smith",
    email: "jordan.smith@university.edu",
  },
  {
    name: "Maya Singh",
    bio: "Track and field athlete with experience in team coordination. Focuses on inclusive sports programs for all skill levels.",
    position: "Vice Captain",
    electionTitle: "Sports Committee Elections",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/maya-singh",
    email: "maya.singh@university.edu",
  },
  {
    name: "Tom Wilson",
    bio: "Equipment management specialist with experience in inventory and maintenance. Ensures all sports equipment is properly maintained.",
    position: "Equipment Manager",
    electionTitle: "Sports Committee Elections",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/tom-wilson",
    email: "tom.wilson@university.edu",
  },

  // Cultural Society Elections
  {
    name: "Priya Sharma",
    bio: "Performing arts enthusiast with experience in organizing cultural festivals. Passionate about celebrating diversity through arts.",
    position: "Cultural Secretary",
    electionTitle: "Cultural Society Elections",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/priya-sharma",
    email: "priya.sharma@university.edu",
  },
  {
    name: "James Brown",
    bio: "Event planning professional with experience in large-scale cultural events. Specializes in logistics and vendor coordination.",
    position: "Event Manager",
    electionTitle: "Cultural Society Elections",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/james-brown",
    email: "james.brown@university.edu",
  },
  {
    name: "Aisha Ahmed",
    bio: "Digital media expert with skills in photography, videography, and social media management. Creates engaging content for cultural events.",
    position: "Media Head",
    electionTitle: "Cultural Society Elections",
    imageUrl: "/placeholder.svg?height=200&width=200",
    manifestoUrl: "https://example.com/manifesto/aisha-ahmed",
    email: "aisha.ahmed@university.edu",
  },
]

// Demo Users Data
export const demoUsers = [
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

// Check if demo data already exists
export const checkDemoDataExists = (): boolean => {
  const elections = getElections()
  return elections.some((e) => e.title === "Student Council Elections 2024")
}

// Initialize demo elections
export const initializeDemoElections = (): string[] => {
  const electionIds: string[] = []

  for (const electionData of demoElections) {
    try {
      const election: Election = {
        id: uuidv4(),
        ...electionData,
        createdBy: "demo-admin",
        createdAt: new Date(),
      }

      const id = saveElection(election)
      electionIds.push(id)
      console.log(`Created election: ${electionData.title}`)
    } catch (error) {
      console.error(`Error creating election ${electionData.title}:`, error)
    }
  }

  return electionIds
}

// Initialize demo candidates
export const initializeDemoCandidates = (electionIds: string[]): void => {
  // Create a mapping of election titles to IDs
  const elections = getElections()
  const electionMap: Record<string, string> = {}

  for (const election of elections) {
    electionMap[election.title] = election.id
  }

  for (const candidateData of demoCandidates) {
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
          voteCount: Math.floor(Math.random() * 50), // Random vote count for demo
          createdAt: new Date(),
        }

        saveCandidate(candidate)
        console.log(`Created candidate: ${candidateData.name}`)
      }
    } catch (error) {
      console.error(`Error creating candidate ${candidateData.name}:`, error)
    }
  }
}

// Initialize demo users
export const initializeDemoUsers = (): void => {
  for (const userData of demoUsers) {
    try {
      const user: User = {
        uid: uuidv4(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: userData.password,
        createdAt: new Date(),
      }

      saveUser(user)
      console.log(`Created user: ${userData.name}`)
    } catch (error) {
      console.error(`Error creating user ${userData.name}:`, error)
    }
  }
}

// Generate sample votes for demo
export const generateDemoVotes = (): void => {
  try {
    // Get all elections
    const elections = getElections()

    // Get all candidates
    const candidates = getCandidates()

    // Get demo voters (excluding admin)
    const voters = getUsers().filter((user) => user.role === "voter")

    // Generate random votes
    for (const voter of voters.slice(0, 3)) {
      // Only first 3 voters vote
      for (const election of elections.slice(0, 2)) {
        // Only first 2 elections
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
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
            }

            try {
              saveVote(vote)
            } catch (error) {
              // Ignore duplicate votes
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

// Initialize all demo data
export const initializeAllDemoData = (): {
  success: boolean
  message: string
  stats: {
    elections: number
    candidates: number
    users: number
  }
} => {
  try {
    // Check if demo data already exists
    const exists = checkDemoDataExists()
    if (exists) {
      return {
        success: false,
        message: "Demo data already exists",
        stats: { elections: 0, candidates: 0, users: 0 },
      }
    }

    console.log("Initializing demo data...")

    // Initialize users
    initializeDemoUsers()

    // Initialize elections
    const electionIds = initializeDemoElections()

    // Initialize candidates
    initializeDemoCandidates(electionIds)

    // Generate votes
    generateDemoVotes()

    return {
      success: true,
      message: "Demo data initialized successfully",
      stats: {
        elections: demoElections.length,
        candidates: demoCandidates.length,
        users: demoUsers.length,
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

// Quick login with demo account
export const quickDemoLogin = (role: "admin" | "voter"): User | null => {
  try {
    const email = role === "admin" ? "admin@votesecure.com" : "voter1@votesecure.com"
    const users = getUsers()
    const user = users.find((u) => u.email === email)

    if (user) {
      setCurrentUser(user)
      return user
    }

    // If user doesn't exist, create it
    const newUser: User = {
      uid: uuidv4(),
      email,
      name: role === "admin" ? "Admin User" : "John Voter",
      role,
      password: role === "admin" ? "admin123" : "voter123",
      createdAt: new Date(),
    }

    saveUser(newUser)
    setCurrentUser(newUser)
    return newUser
  } catch (error) {
    console.error("Error with quick demo login:", error)
    return null
  }
}
