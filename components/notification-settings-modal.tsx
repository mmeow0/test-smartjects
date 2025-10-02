"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bell, FileText } from "lucide-react";
import { userSettingsService } from "@/lib/services/user-settings.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";

interface NotificationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationSettingsModal({
  open,
  onOpenChange,
}: NotificationSettingsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    smartjectUpdates: true,
    contractUpdates: true,
  });

  // Fetch current settings when modal opens
  useEffect(() => {
    if (open && user?.id) {
      fetchSettings();
    }
  }, [open, user?.id]);

  const fetchSettings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userSettings = await userSettingsService.getUserSettings(user.id);
      if (userSettings) {
        setSettings({
          smartjectUpdates: userSettings.smartjectUpdates,
          contractUpdates: userSettings.contractUpdates,
        });
      }
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const success = await userSettingsService.updateUserSettings(user.id, {
        smartjectUpdates: settings.smartjectUpdates,
        contractUpdates: settings.contractUpdates,
      });

      if (success) {
        toast({
          title: "Success",
          description: "Notification preferences saved successfully",
        });
        onOpenChange(false);
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (field: 'smartjectUpdates' | 'contractUpdates') => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your notification preferences
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="notifications" className="mt-4">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-md bg-blue-100 p-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="smartject-updates" className="text-base font-medium">
                          Smartject Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about smartject activities and updates
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="smartject-updates"
                      checked={settings.smartjectUpdates}
                      onCheckedChange={() => handleToggle('smartjectUpdates')}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-md bg-purple-100 p-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="contract-updates" className="text-base font-medium">
                          Contract Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about contract status changes
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="contract-updates"
                      checked={settings.contractUpdates}
                      onCheckedChange={() => handleToggle('contractUpdates')}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePreferences}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
