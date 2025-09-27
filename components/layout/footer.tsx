"use client"

import { Heart, Facebook, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
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
              <span className="text-xl font-bold">AI-GiR</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              AI-Generated intelligent Reviewers - Empowering learners with AI-powered study tools and intelligent analytics for better educational outcomes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/library" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Library
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-100">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/upload" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Upload Materials
                </Link>
              </li>
              <li>
                <Link href="/reviewers" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  AI Reviewers
                </Link>
              </li>
              <li>
                <Link href="/survey" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Learning Survey
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-100">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/Jlloydieee/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition-colors duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="mailto:parungao.johnlloyd@ue.edu.ph"
                className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-blue-200 text-sm">
              Have questions? We're here to help!
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-700 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-1 text-blue-200 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for better learning</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <span>© 2025 AI-GiR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}