"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, BarChart3 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function HomePage() {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/LOGO.png"
                alt="AI-GiR Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI-GiR</h1>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? null : user ? (
              <>
                <span className="text-indigo-700 font-semibold">Signed in as {user.user_metadata?.first_name || user.email?.split('@')[0]} {user.user_metadata?.last_name || ''}</span>
                <Link href="/dashboard">
                  <Button variant="default">Go to Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Transform Your Study Materials with AI</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your academic files and let AI generate personalized quizzes and comprehensive reviewers to enhance
            your learning experience.
          </p>
          {loading ? null : user ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Learning Today
              </Button>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload PDFs, Word docs, and text files. Our AI extracts and processes your content.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Image
                  src="/LOGO.png"
                  alt="AI-GiR Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <CardTitle>AI Quiz Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate custom quizzes with multiple choice, true/false, and short answer questions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Smart Reviewers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create comprehensive study guides, summaries, and flashcards from your materials.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your learning progress with detailed analytics and performance insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-xl font-semibold">Upload Your Files</h4>
              <p className="text-gray-600">
                Upload your study materials in various formats including PDF, DOCX, and TXT files.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-xl font-semibold">AI Processing</h4>
              <p className="text-gray-600">
                Our AI analyzes your content and generates personalized quizzes and study materials.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="text-xl font-semibold">Learn & Track</h4>
              <p className="text-gray-600">
                Take quizzes, review materials, and track your progress with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <Image
                src="/LOGO.png"
                alt="AI-GiR Logo"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-xl font-bold">AI-GiR</span>
          </div>
          <p className="text-gray-400">Empowering students with AI-driven learning tools</p>
        </div>
      </footer>
    </div>
  )
}
