"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
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
import { Brain, Home, Upload, BookOpen, FileText, BarChart3, Settings, LogOut, Menu, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
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
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-50 text-indigo-600 hover:bg-indigo-100">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-0 bg-white/95 backdrop-blur-sm">
          {/* Visually hidden dialog title for accessibility */}
          <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-4 sm:px-6 border-b border-indigo-100">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="ml-3 text-lg sm:text-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI-GIR</span>
            </div>
            <nav className="flex-1 space-y-1 px-2 sm:px-4 py-4 sm:py-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 sm:px-3 py-2 text-sm sm:text-base font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                        : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 sm:mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
  <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:max-w-xs xl:w-72 xl:max-w-sm lg:flex-col">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto bg-white/90 backdrop-blur-sm border-r border-indigo-100">
          <div className="flex items-center flex-shrink-0 px-6">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="ml-3 text-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI-GIR</span>
            </Link>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                        : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-white" : "text-indigo-400 group-hover:text-indigo-600"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
  <div className="lg:pl-64 xl:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-indigo-100 bg-white/90 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-xl hover:bg-indigo-50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-medium">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border-indigo-100" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-indigo-600">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-indigo-100" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-indigo-100" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 sm:py-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
