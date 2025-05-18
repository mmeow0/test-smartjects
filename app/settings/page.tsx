"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const [accountSettings, setAccountSettings] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smartjectUpdates: true,
    proposalMatches: true,
    contractUpdates: true,
    marketingEmails: false,
  })

  // Redirect if not authenticated
 useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.email && accountSettings.email !== user.email) {
      setAccountSettings((prev) => ({
        ...prev,
        email: user.email,
      }))
    }
  }, [isAuthenticated, router, user, accountSettings.email])

  if (!isAuthenticated) {
    return null
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would call an API to update the password
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    })

    setAccountSettings((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))
  }

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, we would call an API to update the email
    toast({
      title: "Email updated",
      description: "Your email has been updated successfully.",
    })
  }

  const handleNotificationSave = () => {
    // In a real app, we would call an API to update notification preferences
    toast({
      title: "Notification preferences saved",
      description: "Your notification preferences have been updated.",
    })
  }

  const handleDeleteAccount = () => {
    // In a real app, we would call an API to delete the account
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })
      logout()
      router.push("/")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                  <CardDescription>Update your email address</CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailUpdate}>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={accountSettings.email}
                        onChange={handleAccountChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Update Email</Button>
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={accountSettings.currentPassword}
                        onChange={handleAccountChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={handleAccountChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={handleAccountChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Update Password</Button>
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Type</CardTitle>
                  <CardDescription>Manage your account subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{user?.accountType} Account</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.accountType === "free"
                          ? "Limited access to platform features"
                          : "Full access to all platform features"}
                      </p>
                    </div>
                    {user?.accountType === "free" ? (
                      <Button asChild>
                        <a href="/upgrade">Upgrade to Paid</a>
                      </Button>
                    ) : (
                      <Button variant="outline">Manage Subscription</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delete Account</CardTitle>
                  <CardDescription>Permanently delete your account and all data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smartjectUpdates">Smartject Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about updates to smartjects you follow</p>
                  </div>
                  <Switch
                    id="smartjectUpdates"
                    checked={notificationSettings.smartjectUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("smartjectUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="proposalMatches">Proposal Matches</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your proposals match with others</p>
                  </div>
                  <Switch
                    id="proposalMatches"
                    checked={notificationSettings.proposalMatches}
                    onCheckedChange={(checked) => handleNotificationChange("proposalMatches", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contractUpdates">Contract Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about updates to your contracts</p>
                  </div>
                  <Switch
                    id="contractUpdates"
                    checked={notificationSettings.contractUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("contractUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNotificationSave}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the platform looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Select your preferred theme for the platform</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>
                  <Select defaultValue="public">
                    <SelectTrigger id="profileVisibility" className="w-[180px]">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="registered">Registered Users Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dataSharing">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow sharing of your activity data</p>
                  </div>
                  <Switch id="dataSharing" defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cookies">Cookie Preferences</Label>
                    <p className="text-sm text-muted-foreground">Manage cookie settings</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Cookies
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
