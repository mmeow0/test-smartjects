"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Check,
  X,
  Mail,
  Briefcase,
  Calendar,
  MapPin,
  Signature,
  Contact,
  SquarePen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth-provider";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import { SmartjectCard } from "@/components/smartject-card";
import { useUserSmartjects } from "@/hooks/use-user-smartjects";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/lib/services/user.service";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequireAuth();
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    company: "",
    website: "",
    joinDate: "",
  });

  const { smartjects, isLoading, refetch } = useUserSmartjects(user?.id);

  // Set profile data when user is loaded
  useEffect(() => {
    if (authLoading || !canAccess) {
      return;
    }

    if (user && !profileData.name) {
      // Only set profile data if it hasn't been set yet
      setProfileData({
        name: user?.name || "",
        bio: user?.bio || "",
        location: user?.location || "",
        company: user?.company || "",
        website: user?.website || "",
        joinDate: user?.joinDate
          ? new Date(user.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })
          : "",
      });
    }
  }, [authLoading, canAccess, user, profileData.name]);

  if (authLoading || !canAccess) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      const success = await userService.updateUser(user.id, {
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        company: profileData.company,
        website: profileData.website,
      });

      if (success) {
        // Refresh user data to reflect changes
        await refreshUser();
        toast({
          title: "Profile updated",
          description:
            "Your profile information has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset form and exit edit mode
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        company: user.company || "",
        website: user.website || "",
        joinDate: user.joinDate
          ? new Date(user.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })
          : "",
      });
    }
    setIsEditing(false);
  };

  // Mock data for user activity
  const believedSmartjects = smartjects.believe;
  const needSmartjects = user?.accountType === "paid" ? smartjects.need : [];
  const provideSmartjects =
    user?.accountType === "paid" ? smartjects.provide : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Profile info */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="relative pb-0">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setIsEditing(true)}
                >
                  <SquarePen className="h-4 w-4" />
                  <span className="sr-only">Edit profile</span>
                </Button>
              )}

              <div className="flex items-start gap-4">
                {/* Меньший аватар */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {/* Контент справа от аватара */}
                <div className="flex flex-col justify-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium block"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="text-base font-bold"
                        placeholder="Enter your name"
                      />
                    </div>
                  ) : (
                    <CardTitle className="text-lg">
                      {profileData.name}
                    </CardTitle>
                  )}
                  <CardDescription>
                    <p className="capitalize border-none text-gray-400 pl-1">
                      {user?.accountType} Account
                    </p>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="text-sm font-medium mb-2 block"
                    >
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. New York, USA"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="text-sm font-medium mb-2 block"
                    >
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={profileData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Your Company Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="website"
                      className="text-sm font-medium mb-2 block"
                    >
                      Website
                    </label>
                    <Input
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p
                      className={
                        profileData.bio ? "" : "text-muted-foreground italic"
                      }
                    >
                      {profileData.bio || "No bio added yet"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email || "user@example.com"}</span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          profileData.location
                            ? ""
                            : "text-muted-foreground italic"
                        }
                      >
                        {profileData.location || "No location specified"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          profileData.company
                            ? ""
                            : "text-muted-foreground italic"
                        }
                      >
                        {profileData.company || "No company specified"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex items-center gap-2">
                      <Contact className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          profileData.website
                            ? ""
                            : "text-muted-foreground italic"
                        }
                      >
                        {profileData.website || "No website specified"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          profileData.joinDate
                            ? ""
                            : "text-muted-foreground italic"
                        }
                      >
                        {profileData.joinDate
                          ? `Joined ${profileData.joinDate}`
                          : "Join date not available"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col justify-between gap-7">
              {isEditing && (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button size="lg" className="w-full" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              )}
              {user?.accountType === "free" && (
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <a href="/upgrade">Upgrade plan</a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right column - Activity */}
        <div className="w-full">
          <Card>
            <CardContent>
              <Tabs defaultValue="believe" className="mt-8 w-full">
                <TabsList className="mb-6 flex w-full">
                  <TabsTrigger value="believe" className="flex-1 text-center">
                    I Believe
                  </TabsTrigger>
                  <TabsTrigger value="need" className="flex-1 text-center">
                    I Need
                  </TabsTrigger>
                  <TabsTrigger value="provide" className="flex-1 text-center">
                    I Provide
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="believe" className="space-y-4">
                  {isLoading ? (
                    <SkeletonGrid />
                  ) : believedSmartjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
                      {believedSmartjects.map((smartject) => (
                        <SmartjectCard
                          key={smartject.id}
                          smartject={smartject}
                          onVoted={refetch}
                          userVotes={smartject.userVotes}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      message="You haven’t believed in any Smartjects yet."
                      href="/discover"
                      buttonText="Browse Smartjects"
                    />
                  )}
                </TabsContent>

                <TabsContent value="need" className="space-y-4">
                  {isLoading ? (
                    <SkeletonGrid />
                  ) : user?.accountType === "paid" ? (
                    needSmartjects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
                        {needSmartjects.map((smartject) => (
                          <SmartjectCard
                            key={smartject.id}
                            smartject={smartject}
                            onVoted={refetch}
                            userVotes={smartject.userVotes}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        message="You haven't indicated need for any smartjects yet."
                        href="/explore"
                        buttonText="Explore Smartjects"
                      />
                    )
                  ) : (
                    <EmptyState
                      message="Upgrade to a paid account to indicate need for smartjects."
                      href="/upgrade"
                      buttonText="Upgrade Now"
                    />
                  )}
                </TabsContent>

                <TabsContent value="provide" className="space-y-4">
                  {isLoading ? (
                    <SkeletonGrid />
                  ) : user?.accountType === "paid" ? (
                    provideSmartjects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
                        {provideSmartjects.map((smartject) => (
                          <SmartjectCard
                            key={smartject.id}
                            smartject={smartject}
                            onVoted={refetch}
                            userVotes={smartject.userVotes}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        message="You haven't indicated ability to provide any smartjects yet."
                        href="/explore"
                        buttonText="Explore Smartjects"
                      />
                    )
                  ) : (
                    <EmptyState
                      message="Upgrade to a paid account to indicate you can provide smartjects."
                      href="/upgrade"
                      buttonText="Upgrade Now"
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6)
      .fill(0)
      .map((_, i) => (
        <Card key={i} className="h-[400px]">
          <div className="h-40 relative">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-5 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </Card>
      ))}
  </div>
);

const EmptyState = ({
  message,
  href,
  buttonText,
}: {
  message: string;
  href: string;
  buttonText: string;
}) => (
  <Card className="col-span-3">
    <CardContent className="py-8 flex flex-col items-center justify-center">
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button asChild>
        <a href={href}>{buttonText}</a>
      </Button>
    </CardContent>
  </Card>
);
