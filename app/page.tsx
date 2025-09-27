"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, BarChart3 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import SignInModal from "@/components/auth/sign-in-modal"
import SignUpModal from "@/components/auth/sign-up-modal"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful sign in/up
    router.push('/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <Image
                src="/LOGO.png"
                alt="AI-GiR Logo"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">AI-GiR</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {loading ? null : user ? (
              <>
                <span className="hidden md:inline text-indigo-700 font-semibold text-sm lg:text-base">
                  Signed in as {user.user_metadata?.first_name || user.email?.split('@')[0]} {user.user_metadata?.last_name || ''}
                </span>
                <Link href="/dashboard">
                  <Button variant="default" size="sm" className="text-xs sm:text-sm">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignInModal onSuccess={handleAuthSuccess}>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    Sign In
                  </Button>
                </SignInModal>
                <SignUpModal onSuccess={handleAuthSuccess}>
                  <Button size="sm" className="text-xs sm:text-sm">
                    Get Started
                  </Button>
                </SignUpModal>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            Transform Your Study Materials with AI
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4">
            Upload your academic files and let AI generate personalized quizzes and comprehensive reviewers to enhance
            your learning experience.
          </p>
          {loading ? null : user ? (
            <Link href="/dashboard">
              <Button size="sm" className="text-sm sm:text-base md:text-lg sm:px-6 md:px-8 py-2 sm:py-3">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <SignUpModal onSuccess={handleAuthSuccess}>
              <Button size="sm" className="text-sm sm:text-base md:text-lg sm:px-6 md:px-8 py-2 sm:py-3">
                Start Learning Today
              </Button>
            </SignUpModal>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600 mx-auto mb-2 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Upload PDFs, Word docs, and text files. Our AI extracts and processes your content.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-4 flex items-center justify-center">
                <Image
                  src="/LOGO.png"
                  alt="AI-GiR Logo"
                  width={48}
                  height={48}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
                />
              </div>
              <CardTitle className="text-base sm:text-lg">AI Quiz Generation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Generate custom quizzes with multiple choice, true/false, and short answer questions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600 mx-auto mb-2 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Smart Reviewers</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Create comprehensive study guides, summaries, and flashcards from your materials.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-orange-600 mx-auto mb-2 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs sm:text-sm">
                Monitor your learning progress with detailed analytics and performance insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center px-2 sm:px-0">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-12">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-lg sm:text-xl font-semibold">Upload Your Files</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Upload your study materials in various formats including PDF, DOCX, and TXT files.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-lg sm:text-xl font-semibold">AI Processing</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Our AI analyzes your content and generates personalized quizzes and study materials.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-0 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="text-lg sm:text-xl font-semibold">Learn & Track</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Take quizzes, review materials, and track your progress with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 mt-8 sm:mt-12 md:mt-16">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
              <Image
                src="/LOGO.png"
                alt="AI-GiR Logo"
                width={24}
                height={24}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold">AI-GiR</span>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Empowering students with AI-driven learning tools</p>
        </div>
      </footer>
    </div>
  )
}
