"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Home, Upload, BookOpen, FileText, BarChart3, Settings, LogOut, Menu, User, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { SurveyBanner } from "@/components/survey-banner"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Upload Files", href: "/upload", icon: Upload },
  { name: "My Library", href: "/library", icon: BookOpen },
  { name: "Quizzes", href: "/quizzes", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Research Survey", href: "/survey", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'U'
    const lastName = user.user_metadata?.last_name || ''
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-3 left-3 z-50 text-blue-600 hover:bg-blue-100 h-8 w-8 p-0">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-white/95 backdrop-blur-sm">
          {/* Visually hidden dialog title for accessibility */}
          <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-14 sm:h-16 items-center px-4 border-b border-blue-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                <Image
                  src="/LOGO.png"
                  alt="AI-GiR Logo"
                  width={28}
                  height={28}
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                />
              </div>
              <span className="ml-2 sm:ml-3 text-base sm:text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">AI-GiR</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 xl:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white/90 backdrop-blur-sm border-r border-indigo-100">
          <div className="flex items-center flex-shrink-0 px-5">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-7 h-7 flex items-center justify-center">
                <Image
                  src="/LOGO.png"
                  alt="AI-GiR Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="ml-3 text-lg xl:text-xl font-medium bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">AI-GiR</span>
            </Link>
          </div>
          <div className="mt-6 flex-1 flex flex-col">
            <nav className="flex-1 px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0",
                        isActive ? "text-white" : "text-indigo-400 group-hover:text-indigo-600"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 xl:pl-72">
        <div className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-indigo-100 bg-white/90 backdrop-blur-sm px-3 sm:px-4 lg:px-6">
          <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-indigo-50 p-0">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium text-xs sm:text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 sm:w-56 bg-white/95 backdrop-blur-sm border-indigo-100" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs sm:text-sm font-medium leading-none text-gray-800 truncate">
                        {user?.user_metadata?.first_name || user?.email?.split('@')[0]} {user?.user_metadata?.last_name || ''}
                      </p>
                      <p className="text-xs leading-none text-indigo-600 truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-indigo-100" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 text-sm">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 text-sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-indigo-100" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-4 sm:py-6 lg:py-8">
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      
      {/* Survey Banner */}
      <SurveyBanner />
    </div>
  )
}
