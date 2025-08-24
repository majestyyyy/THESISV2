"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Shield, Palette } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Manage your account preferences and application settings</p>
          </div>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Control how you receive notifications from the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col">
                  <span>Email notifications</span>
                  <span className="font-normal text-sm text-gray-500">Receive quiz results and reminders via email</span>
                </Label>
                <Switch id="email-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex flex-col">
                  <span>Push notifications</span>
                  <span className="font-normal text-sm text-gray-500">Get notified when new quizzes are available</span>
                </Label>
                <Switch id="push-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-digest" className="flex flex-col">
                  <span>Weekly digest</span>
                  <span className="font-normal text-sm text-gray-500">Receive a summary of your quiz performance</span>
                </Label>
                <Switch id="weekly-digest" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing" className="flex flex-col">
                  <span>Anonymous data sharing</span>
                  <span className="font-normal text-sm text-gray-500">Help improve the app by sharing anonymous usage data</span>
                </Label>
                <Switch id="data-sharing" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="quiz-history" className="flex flex-col">
                  <span>Save quiz history</span>
                  <span className="font-normal text-sm text-gray-500">Keep track of your quiz attempts and scores</span>
                </Label>
                <Switch id="quiz-history" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Data retention</Label>
                <Select defaultValue="1year">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 months</SelectItem>
                    <SelectItem value="6months">6 months</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="forever">Keep forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
