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
import { userSettingsService } from "@/lib/services/user-settings.service"
import type { UserSettingsType } from "@/lib/types"

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

  const [userSettings, setUserSettings] = useState<UserSettingsType | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public" as "public" | "registered" | "private",
    dataSharing: false,
  })

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return

      try {
        setIsLoadingSettings(true)
        const settings = await userSettingsService.getUserSettings(user.id)
        
        if (settings) {
          setUserSettings(settings)
          setPrivacySettings({
            profileVisibility: settings.profileVisibility,
            dataSharing: settings.dataSharing,
          })
          
          // Sync theme with loaded settings
          if (settings.theme !== theme) {
            setTheme(settings.theme)
          }
        }
      } catch (error) {
        console.error("Error loading user settings:", error)
        toast({
          title: "Error",
          description: "Failed to load your settings. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSettings(false)
      }
    }

    if (isAuthenticated && user) {
      loadUserSettings()
      setAccountSettings((prev) => ({
        ...prev,
        email: user.email,
      }))
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, router, user, theme, setTheme, toast])

  if (!isAuthenticated) {
    return null
  }

  if (isLoadingSettings) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <div className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    if (!userSettings) return
    
    setUserSettings((prev) => prev ? { ...prev, [name as keyof UserSettingsType]: checked } : null)
  }

  const handlePrivacyChange = (name: string, value: string | boolean) => {
    setPrivacySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    if (accountSettings.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await userSettingsService.updateUserPassword(accountSettings.newPassword)
      
      if (success) {
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
      } else {
        toast({
          title: "Error",
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (accountSettings.email === user?.email) {
      toast({
        title: "No changes",
        description: "Your email address is already up to date.",
      })
      return
    }

    try {
      const success = await userSettingsService.updateUserEmail(accountSettings.email)
      
      if (success) {
        toast({
          title: "Email update initiated",
          description: "Please check your new email address to confirm the change.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update email. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating email:", error)
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNotificationSave = async () => {
    if (!user?.id || !userSettings) return

    try {
      const success = await userSettingsService.updateUserSettings(user.id, {
        emailNotifications: userSettings.emailNotifications,
        smartjectUpdates: userSettings.smartjectUpdates,
        proposalMatches: userSettings.proposalMatches,
        contractUpdates: userSettings.contractUpdates,
        marketingEmails: userSettings.marketingEmails,
      })

      if (success) {
        toast({
          title: "Notification preferences saved",
          description: "Your notification preferences have been updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save notification preferences. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return

    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const success = await userSettingsService.deleteUserAccount(user.id)
        
        if (success) {
          toast({
            title: "Account deleted",
            description: "Your account has been deleted successfully.",
          })
          await logout()
          router.push("/")
        } else {
          toast({
            title: "Error",
            description: "Failed to delete account. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting account:", error)
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    if (!user?.id) return

    setTheme(newTheme)
    
    try {
      await userSettingsService.updateUserSettings(user.id, {
        theme: newTheme as "light" | "dark" | "system",
      })
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  const handlePrivacySave = async () => {
    if (!user?.id) return

    try {
      const success = await userSettingsService.updateUserSettings(user.id, {
        profileVisibility: privacySettings.profileVisibility,
        dataSharing: privacySettings.dataSharing,
      })

      if (success) {
        toast({
          title: "Privacy settings saved",
          description: "Your privacy settings have been updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save privacy settings. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error)
      toast({
        title: "Error",
        description: "Failed to save privacy settings. Please try again.",
        variant: "destructive",
      })
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
                    checked={userSettings?.emailNotifications ?? true}
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
                    checked={userSettings?.smartjectUpdates ?? true}
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
                    checked={userSettings?.proposalMatches ?? true}
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
                    checked={userSettings?.contractUpdates ?? true}
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
                    checked={userSettings?.marketingEmails ?? false}
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
                  <Select value={theme} onValueChange={handleThemeChange}>
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
                  <Select 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
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
                  <Switch 
                    id="dataSharing" 
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => handlePrivacyChange("dataSharing", checked)}
                  />
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
                <Button onClick={handlePrivacySave}>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
