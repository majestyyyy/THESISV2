"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export function SessionStatus() {
  const { user, timeUntilExpiry, refreshSession, error, loading } = useAuth()

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading session...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return null // Don't show for unauthenticated users
  }

  const getStatusColor = () => {
    if (error) return "destructive"
    if (timeUntilExpiry <= 2) return "destructive" 
    if (timeUntilExpiry <= 5) return "warning"
    return "success"
  }

  const getStatusIcon = () => {
    if (error) return <AlertTriangle className="h-4 w-4" />
    if (timeUntilExpiry <= 2) return <AlertTriangle className="h-4 w-4" />
    if (timeUntilExpiry <= 5) return <Clock className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (error) return "Session Error"
    if (timeUntilExpiry <= 0) return "Session Expired"
    if (timeUntilExpiry <= 2) return `Expires in ${timeUntilExpiry}min`
    if (timeUntilExpiry <= 5) return `${timeUntilExpiry}min remaining`
    return "Session Active"
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Session Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor() as any}>
              {error ? "Error" : timeUntilExpiry <= 2 ? "Critical" : timeUntilExpiry <= 5 ? "Warning" : "Good"}
            </Badge>
            {(error || timeUntilExpiry <= 5) && (
              <Button
                size="sm"
                variant="outline"
                onClick={refreshSession}
                className="h-7 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>User: {user.email}</div>
              <div>Time until expiry: {timeUntilExpiry} minutes</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-refresh active</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}