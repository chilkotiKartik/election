"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Settings, Database, Shield, ExternalLink, Copy } from "lucide-react"
import { checkAuthConfiguration } from "@/lib/auth"

export function FirebaseSetupGuide() {
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const isConfigured = await checkAuthConfiguration()
        setAuthConfigured(isConfigured)
      } catch (error) {
        setAuthConfigured(false)
      } finally {
        setChecking(false)
      }
    }

    checkConfiguration()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Firebase Setup Guide</span>
        </CardTitle>
        <CardDescription>
          Complete setup instructions to configure your Firebase project for VoteSecure Pro
        </CardDescription>
        {!checking && (
          <div className="mt-4">
            {authConfigured ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Great!</strong> Firebase Authentication is properly configured and ready to use.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Setup Required:</strong> Firebase Authentication needs to be enabled. Follow the steps below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="firestore">Firestore</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="auth" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Enable Email/Password Authentication</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Go to Firebase Console</p>
                    <p className="text-sm text-muted-foreground mb-2">Open your Firebase project in the console</p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://console.firebase.google.com/project/vote-5bac6"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Firebase Console
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Navigate to Authentication</p>
                    <p className="text-sm text-muted-foreground">In the left sidebar, click on "Authentication"</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Go to Sign-in Method</p>
                    <p className="text-sm text-muted-foreground">Click on the "Sign-in method" tab</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    4
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Enable Email/Password</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Find "Email/Password" in the providers list and click on it
                    </p>
                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-medium mb-1">Steps:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Toggle "Enable" to ON</li>
                        <li>Click "Save"</li>
                        <li>You can optionally enable "Email link (passwordless sign-in)" later</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    5
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Verify Configuration</p>
                    <p className="text-sm text-muted-foreground">Refresh this page to verify the setup is working</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="firestore" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Firestore Database Setup</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Create Firestore Database</p>
                    <p className="text-sm text-muted-foreground mb-2">Go to Firestore Database → Create database</p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://console.firebase.google.com/project/vote-5bac6/firestore"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Firestore
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Choose Security Rules</p>
                    <p className="text-sm text-muted-foreground">Start in test mode (we'll add custom rules later)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Select Location</p>
                    <p className="text-sm text-muted-foreground">Choose a location closest to your users</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    4
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Apply Security Rules</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Go to Rules tab and replace with the following:
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    match /elections/{electionId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    match /candidates/{candidateId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    match /votes/{voteId} {
      allow create: if request.auth != null &&
                    request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.userId ||
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
      allow update, delete: if request.auth != null && 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs overflow-x-auto">
                        {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Elections - public read, admin write
    match /elections/{electionId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Candidates - public read, admin write
    match /candidates/{candidateId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Votes - restricted access
    match /votes/{voteId} {
      allow create: if request.auth != null &&
                    request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.userId ||
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
      allow update, delete: if request.auth != null && 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Firebase Storage Setup</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Enable Storage</p>
                    <p className="text-sm text-muted-foreground mb-2">Go to Storage → Get started</p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://console.firebase.google.com/project/vote-5bac6/storage"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Storage
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Configure Security Rules</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Go to Rules tab and replace with the following:
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /candidates/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs overflow-x-auto">
                        {`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Candidate images - public read, admin write
    match /candidates/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Profile images - users can manage their own
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule - deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">Choose Location</p>
                    <p className="text-sm text-muted-foreground">Use the same location as your Firestore database</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold mb-2">Quick Setup Checklist:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auth-check" />
              <label htmlFor="auth-check">Enable Email/Password Authentication</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="firestore-check" />
              <label htmlFor="firestore-check">Create Firestore Database</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="storage-check" />
              <label htmlFor="storage-check">Enable Firebase Storage</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="rules-check" />
              <label htmlFor="rules-check">Apply Security Rules</label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
