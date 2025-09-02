"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, X, Mail, Phone, MessageCircle } from "lucide-react"

export function SurveyHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 rounded-full w-14 h-14 shadow-lg bg-indigo-600 hover:bg-indigo-700"
        size="sm"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      {/* Help Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Need Help?</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Survey Support</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Having trouble with the survey? Here are some quick tips:
                </p>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• If the form doesn't load, try refreshing the page</li>
                  <li>• Make sure you have a stable internet connection</li>
                  <li>• The survey works best on desktop browsers</li>
                  <li>• Your responses are automatically saved as you type</li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Contact Research Team</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">research@ai-gir.edu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Live chat available 9-5 EST</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Got it, thanks!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
