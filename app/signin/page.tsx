import { Suspense } from "react"
import SignInContent from "./signin-content"
import { Card, CardContent } from "@/components/ui/card"
import { Brain } from "lucide-react"

function LoadingSignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">AI-GIR</h1>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sign in page...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingSignIn />}>
      <SignInContent />
    </Suspense>
  )
}
