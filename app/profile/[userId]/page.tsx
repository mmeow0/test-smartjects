"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Briefcase,
  Calendar,
  MapPin,
  Globe,
  ArrowLeft,
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
import { SmartjectCard } from "@/components/smartject-card";
import { useUserSmartjects } from "@/hooks/use-user-smartjects";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/lib/services/user.service";
import { useAuth } from "@/components/auth-provider";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  joinDate: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.userId as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { smartjects: groupedSmartjects, isLoading: smartjectsLoading } =
    useUserSmartjects(userId);

  // Convert grouped smartjects to a flat array for display
  const smartjects = useMemo(() => {
    if (!groupedSmartjects) return [];
    const merged = [
      ...groupedSmartjects.believe,
      ...groupedSmartjects.need,
      ...groupedSmartjects.provide,
    ];
    return Array.from(new Set(merged));
  }, [groupedSmartjects]);

  useEffect(() => {
    // If user is viewing their own profile, redirect to /profile
    if (currentUser && currentUser.id === userId) {
      router.push("/profile");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userData = await userService.getUser(userId);

        if (!userData) {
          setError("User not found");
          return;
        }

        setUserProfile({
          id: userData.id,
          name: userData.name || "Anonymous User",
          email: userData.email,
          avatar: userData.avatar || null,
          bio: userData.bio || null,
          location: userData.location || null,
          company: userData.company || null,
          website: userData.website || null,
          joinDate: userData.joinDate || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser, router]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {error || "User not found"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The user you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/discover")}>
                Browse Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = userProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(userProfile.joinDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage
                  src={userProfile.avatar || undefined}
                  alt={userProfile.name}
                />
                <AvatarFallback className="text-2xl sm:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl mb-2">
                  {userProfile.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {userProfile.bio || "No bio provided"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{userProfile.email}</span>
              </div>
              {userProfile.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{userProfile.company}</span>
                </div>
              )}
              {userProfile.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{userProfile.location}</span>
                </div>
              )}
              {userProfile.website && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {userProfile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Projects */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsContent value="projects" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Smartjects of Interest to {userProfile.name}
                </h3>
                <Badge variant="secondary">
                  {smartjects.length}{" "}
                  {smartjects.length === 1 ? "Project" : "Projects"}
                </Badge>
              </div>

              {smartjectsLoading ? (
                <SkeletonGrid />
              ) : smartjects.length === 0 ? (
                <EmptyState userName={userProfile.name} />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {smartjects.map((smartject) => (
                    <SmartjectCard
                      key={smartject.id}
                      smartject={smartject}
                      onVoted={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full max-w-xs" />
              ))}
            </div>
          </CardContent>
        </Card>
        <SkeletonGrid />
      </div>
    </div>
  );
};

const SkeletonGrid = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

const EmptyState = ({ userName }: { userName: string }) => {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto mb-4 text-4xl">📦</div>
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground">
        {userName} hasn't created any projects.
      </p>
    </Card>
  );
};
