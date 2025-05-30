"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Vote,
  AlertCircle,
  Sparkles,
  Shield,
  Users,
  Settings,
  Mail,
  Lock,
  Chrome,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { signIn, signUp, signInWithGoogle, checkAuthConfiguration } from "@/lib/auth"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"voter" | "admin">("voter")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const isConfigured = await checkAuthConfiguration()
        setAuthConfigured(isConfigured)
      } catch (error) {
        setAuthConfigured(false)
      }
    }

    checkConfiguration()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const user = await signIn(email, password)
      setSuccess("Successfully signed in!")
      setTimeout(() => {
        router.push(user.role === "admin" ? "/dashboard" : "/vote")
      }, 1000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const user = await signUp(email, password, name, role)
      setSuccess("Account created successfully!")
      setTimeout(() => {
        router.push(user.role === "admin" ? "/dashboard" : "/vote")
      }, 1000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError("")
    setSuccess("")

    try {
      const user = await signInWithGoogle()
      setSuccess("Successfully signed in with Google!")
      setTimeout(() => {
        router.push(user.role === "admin" ? "/dashboard" : "/vote")
      }, 1000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  // Show setup message if Firebase Auth is not configured
  if (authConfigured === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Setup Required</CardTitle>
            <CardDescription>Firebase Authentication needs to be configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Email/password authentication is not enabled in your Firebase project. Please complete the setup first.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/setup">
                <Settings className="mr-2 h-4 w-4" />
                Complete Firebase Setup
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VoteSecure Pro
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure • Professional • Trusted</p>
            </div>
          </Link>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Sign In</span>
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Sign Up</span>
            </TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Welcome Back</span>
                </CardTitle>
                <CardDescription>Sign in to access your voting dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alerts */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  variant="outline"
                  className="w-full h-12 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <Chrome className="mr-3 h-5 w-5 text-blue-600" />
                  {googleLoading ? "Signing in..." : "Continue with Google"}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email Sign In Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center space-x-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center space-x-2 text-sm font-medium">
                      <Lock className="h-4 w-4" />
                      <span>Password</span>
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Create Account</span>
                </CardTitle>
                <CardDescription>Join VoteSecure Pro for secure voting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alerts */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign Up */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  variant="outline"
                  className="w-full h-12 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <Chrome className="mr-3 h-5 w-5 text-blue-600" />
                  {googleLoading ? "Creating account..." : "Sign up with Google"}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">
                      Or create with email
                    </span>
                  </div>
                </div>

                {/* Email Sign Up Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Account Type
                    </Label>
                    <Select value={role} onValueChange={(value: "voter" | "admin") => setRole(value)}>
                      <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voter">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Voter - Participate in elections</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Administrator - Manage elections</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help with setup?{" "}
            <Link href="/setup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Firebase Configuration Guide
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
