"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Calendar, Shield } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
    email: user?.email || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    // Placeholder implementation
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }
        setUser(updatedUser)
        setMessage("Profile updated successfully!")
        setEditing(false)
      }
      setLoading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.user_metadata?.first_name || "",
      lastName: user?.user_metadata?.last_name || "",
      email: user?.email || "",
    })
    setEditing(false)
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'U'
    const lastName = user.user_metadata?.last_name || ''
    return `${firstName[0]}${lastName[0] || ''}`.toUpperCase()
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="mb-8 lg:mb-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-20 left-32 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute top-32 left-20 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute top-16 right-24 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-40 right-16 w-1 h-1 bg-white rounded-full"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <Shield className="h-8 w-8 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <User className="h-6 w-6 animate-bounce" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                      <User className="h-8 w-8 text-blue-200" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                        Profile Settings
                      </h1>
                      <p className="text-lg sm:text-xl text-blue-100">
                        Manage your account information and customize your learning experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center p-4 sm:p-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-3 sm:mb-4">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-lg sm:text-xl">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base sm:text-lg">
                  {user?.user_metadata?.first_name || user?.email?.split('@')[0]} {user?.user_metadata?.last_name || ''}
                </CardTitle>
                <CardDescription className="text-sm">{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Joined December 2024</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Email {user?.email_confirmed_at ? "Verified" : "Not Verified"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
                <CardDescription className="text-sm">Update your personal information and account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="flex space-x-4">
                  {!editing ? (
                    <Button onClick={() => setEditing(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account security and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Manage your email preferences</p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                <div>
                  <h4 className="font-medium text-red-700">Delete Account</h4>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
