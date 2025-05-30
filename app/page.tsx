"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Vote,
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  BarChart3,
  Globe,
  Zap,
  Award,
  Clock,
  UserCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Layout } from "@/components/layout"

// Mock data for featured elections and statistics
const featuredElections = [
  {
    id: "1",
    title: "Student Council Elections 2024",
    description: "Vote for your student representatives",
    status: "active" as const,
    endDate: new Date("2024-12-31"),
    totalVotes: 1247,
    totalCandidates: 12,
    positions: ["President", "Vice President", "Secretary"],
  },
  {
    id: "2",
    title: "Department Head Selection",
    description: "Choose the next department leadership",
    status: "active" as const,
    endDate: new Date("2024-12-25"),
    totalVotes: 856,
    totalCandidates: 8,
    positions: ["Department Head", "Assistant Head"],
  },
]

const platformStats = {
  totalElections: 156,
  totalVotes: 45678,
  activeUsers: 12543,
  successRate: 99.9,
}

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "University Administrator",
    content: "VoteSecure Pro has revolutionized our election process. The transparency and security are unmatched.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Student Body President",
    content: "The platform is incredibly user-friendly. Our voter turnout increased by 40% after switching.",
    rating: 5,
  },
  {
    name: "Prof. Emily Davis",
    role: "Election Committee Chair",
    content: "Real-time results and comprehensive analytics make election management effortless.",
    rating: 5,
  },
]

const features = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "End-to-end encryption with Firebase authentication and real-time security monitoring.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Live voting statistics, turnout tracking, and comprehensive reporting dashboards.",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Multi-device support with responsive design for desktop, tablet, and mobile voting.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant vote processing with real-time updates and sub-second response times.",
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeUntilElection = (endDate: Date) => {
    const diff = endDate.getTime() - currentTime.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return { days, hours }
  }

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5" />
          <div className="relative text-center space-y-8 py-16">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                  🔥 Most Trusted Voting Platform
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Secure Digital Voting
                <br />
                <span className="text-3xl md:text-5xl">Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience the future of democratic participation with our enterprise-grade voting platform. Trusted by
                universities, organizations, and institutions worldwide.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg px-8 py-6"
                >
                  <Link href={user.role === "admin" ? "/dashboard" : "/vote"}>
                    <Vote className="mr-2 h-5 w-5" />
                    {user.role === "admin" ? "Admin Dashboard" : "View Elections"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg px-8 py-6"
                  >
                    <Link href="/auth">
                      <UserCheck className="mr-2 h-5 w-5" />
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                    <Link href="/auth">
                      <Shield className="mr-2 h-5 w-5" />
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Live Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{platformStats.totalElections.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Elections Hosted</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-600">{platformStats.totalVotes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Votes Cast</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">{platformStats.activeUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-purple-600">{platformStats.successRate}%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Elections */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Featured Elections</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Participate in active elections or explore upcoming voting opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredElections.map((election) => {
              const timeLeft = getTimeUntilElection(election.endDate)
              const progress = Math.min((election.totalVotes / (election.totalVotes + 200)) * 100, 85)

              return (
                <Card
                  key={election.id}
                  className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="group-hover:text-primary transition-colors">{election.title}</CardTitle>
                        <CardDescription>{election.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{election.totalVotes}</div>
                        <div className="text-xs text-muted-foreground">Votes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{election.totalCandidates}</div>
                        <div className="text-xs text-muted-foreground">Candidates</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{election.positions.length}</div>
                        <div className="text-xs text-muted-foreground">Positions</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Voter Turnout</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Ends in {timeLeft.days}d {timeLeft.hours}h
                      </div>
                      <Button asChild size="sm" className="group-hover:bg-primary group-hover:text-white">
                        <Link href={`/vote/${election.id}`}>
                          Vote Now
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/vote">
                View All Elections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Why Choose VoteSecure Pro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with enterprise-grade security and designed for seamless democratic participation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 group">
                <CardContent className="pt-6 space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Trusted by Leaders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what election administrators and participants say about VoteSecure Pro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-blue-600 text-white">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8 py-16 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Transform Your Elections?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of organizations using VoteSecure Pro for secure, transparent, and efficient voting
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg px-8 py-6"
            >
              <Link href="/auth">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/setup">
                <Award className="mr-2 h-5 w-5" />
                Setup Guide
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Free Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Enterprise Ready</span>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
