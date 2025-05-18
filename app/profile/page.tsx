"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Check, X, Mail, Briefcase, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { SmartjectCard } from "@/components/smartject-card"
import { mockSmartjects } from "@/lib/mock-data"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    company: "",
    website: "",
    joinDate: "",
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user && !profileData.name) {
      // Only set profile data if it hasn't been set yet
      setProfileData({
        name: user?.name || "User Name",
        bio: "AI implementation specialist with expertise in machine learning and computer vision.",
        location: "San Francisco, CA",
        company: "Tech Innovations Inc.",
        website: "https://example.com",
        joinDate: "January 2023",
      })
    }
  }, [isAuthenticated, user, router, profileData.name])

  if (!isAuthenticated) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // In a real app, we would save the profile data to an API
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form and exit edit mode
    if (user) {
      setProfileData({
        name: user.name || "User Name",
        bio: "AI implementation specialist with expertise in machine learning and computer vision.",
        location: "San Francisco, CA",
        company: "Tech Innovations Inc.",
        website: "https://example.com",
        joinDate: "January 2023",
      })
    }
    setIsEditing(false)
  }

  // Mock data for user activity
  const believedSmartjects = mockSmartjects.slice(0, 3)
  const needSmartjects = user?.accountType === "paid" ? mockSmartjects.slice(3, 5) : []
  const provideSmartjects = user?.accountType === "paid" ? mockSmartjects.slice(5, 7) : []

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Profile info */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="relative pb-0">
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit profile</span>
                </Button>
              ) : (
                <div className="absolute right-4 top-4 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Save</span>
                  </Button>
                </div>
              )}

              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <Input
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="text-center font-bold text-xl mb-1"
                  />
                ) : (
                  <CardTitle className="text-center">{profileData.name}</CardTitle>
                )}
                <CardDescription className="text-center">
                  <Badge variant="outline" className="capitalize">
                    {user?.accountType} Account
                  </Badge>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bio" className="text-sm font-medium mb-1 block">
                      Bio
                    </label>
                    <Textarea id="bio" name="bio" value={profileData.bio} onChange={handleInputChange} rows={4} />
                  </div>
                  <div>
                    <label htmlFor="location" className="text-sm font-medium mb-1 block">
                      Location
                    </label>
                    <Input id="location" name="location" value={profileData.location} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label htmlFor="company" className="text-sm font-medium mb-1 block">
                      Company
                    </label>
                    <Input id="company" name="company" value={profileData.company} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label htmlFor="website" className="text-sm font-medium mb-1 block">
                      Website
                    </label>
                    <Input id="website" name="website" value={profileData.website} onChange={handleInputChange} />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                    <p>{profileData.bio}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email || "user@example.com"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {profileData.joinDate}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{believedSmartjects.length}</p>
                  <p className="text-xs text-muted-foreground">Believed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{needSmartjects.length}</p>
                  <p className="text-xs text-muted-foreground">Need</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{provideSmartjects.length}</p>
                  <p className="text-xs text-muted-foreground">Provide</p>
                </div>
              </div>
              {user?.accountType === "free" && (
                <Button variant="outline" size="sm" asChild>
                  <a href="/upgrade">Upgrade</a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right column - Activity */}
        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Your recent activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="believe">
                <TabsList className="mb-6">
                  <TabsTrigger value="believe">I Believe</TabsTrigger>
                  <TabsTrigger value="need">I Need</TabsTrigger>
                  <TabsTrigger value="provide">I Provide</TabsTrigger>
                </TabsList>

                <TabsContent value="believe" className="space-y-4">
                  {believedSmartjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {believedSmartjects.map((smartject) => (
                        <SmartjectCard key={smartject.id} smartject={smartject} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">You haven't shown interest in any smartjects yet.</p>
                  )}
                </TabsContent>

                <TabsContent value="need" className="space-y-4">
                  {user?.accountType === "paid" ? (
                    needSmartjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {needSmartjects.map((smartject) => (
                          <SmartjectCard key={smartject.id} smartject={smartject} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">You haven't indicated need for any smartjects yet.</p>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Upgrade to a paid account to indicate need for smartjects.
                      </p>
                      <Button asChild>
                        <a href="/upgrade">Upgrade Now</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="provide" className="space-y-4">
                  {user?.accountType === "paid" ? (
                    provideSmartjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {provideSmartjects.map((smartject) => (
                          <SmartjectCard key={smartject.id} smartject={smartject} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        You haven't indicated ability to provide any smartjects yet.
                      </p>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Upgrade to a paid account to indicate you can provide smartjects.
                      </p>
                      <Button asChild>
                        <a href="/upgrade">Upgrade Now</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
