"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Zap,
  Bell,
  Palette,
  Upload,
  Unlink,
  Moon,
  Sun,
  Monitor,
  Trash2,
  ExternalLink,
  User as UserIcon,
} from "lucide-react";
import { updateUser, getCurrentUser } from "@/lib/api";
import { changePassword } from "@/lib/api/auth";
import { connectGitHub } from "@/lib/api/github";
import { toast } from "sonner";
import { Loading } from "@/components/common/Loading";
import { User } from "@/lib/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SettingsTab =
  | "profile"
  | "account"
  | "integrations"
  | "notifications"
  | "appearance";

const settingsTabs: { id: SettingsTab; name: string; icon: React.ReactNode }[] =
  [
    { id: "profile", name: "Profile", icon: <UserIcon className="w-4 h-4" /> },
    { id: "account", name: "Account", icon: <Lock className="w-4 h-4" /> },
    {
      id: "integrations",
      name: "Integrations",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "appearance",
      name: "Appearance",
      icon: <Palette className="w-4 h-4" />,
    },
  ];

type AccentId = "blue" | "purple" | "pink" | "red" | "orange" | "green";

const accentOptions: {
  id: AccentId;
  label: string;
  primary: string;
  foreground: string;
  ring?: string;
  swatchClass: string;
}[] = [
  {
    id: "blue",
    label: "Blue",
    primary: "221.2 83.2% 53.3%",
    foreground: "210 40% 98%",
    swatchClass: "bg-blue-600",
  },
  {
    id: "purple",
    label: "Purple",
    primary: "262.1 83.3% 57.8%",
    foreground: "210 40% 98%",
    swatchClass: "bg-purple-600",
  },
  {
    id: "pink",
    label: "Pink",
    primary: "330 81% 60%",
    foreground: "210 40% 98%",
    swatchClass: "bg-pink-500",
  },
  {
    id: "red",
    label: "Red",
    primary: "0 84.2% 60.2%",
    foreground: "210 40% 98%",
    swatchClass: "bg-red-600",
  },
  {
    id: "orange",
    label: "Orange",
    primary: "24.6 95% 53.1%",
    foreground: "210 40% 98%",
    swatchClass: "bg-orange-500",
  },
  {
    id: "green",
    label: "Green",
    primary: "142.1 70.6% 45.3%",
    foreground: "210 40% 98%",
    swatchClass: "bg-green-600",
  },
];

// Extract user from potentially corrupted store data
// The store sometimes has {success: true, data: {...}} instead of just the user
function extractUser(user: unknown): User | null {
  if (!user) return null;

  // Normal case: user has id directly (proper User type)
  if (
    typeof user === "object" &&
    "id" in user &&
    "username" in user &&
    typeof (user as User).id === "string"
  ) {
    return user as User;
  }

  // Corrupted case: user is wrapped in API response {success: true, data: {...}}
  if (typeof user === "object" && "data" in user) {
    const data = (user as { data: unknown }).data;
    if (
      typeof data === "object" &&
      data &&
      "id" in data &&
      "username" in data
    ) {
      return data as User;
    }
  }

  return null;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const { user: storeUser, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Extract valid user from potentially corrupted store data
  const currentUser = useMemo(() => extractUser(storeUser), [storeUser]);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showGithubDialog, setShowGithubDialog] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab") as SettingsTab;
    if (
      tab &&
      [
        "profile",
        "account",
        "integrations",
        "notifications",
        "appearance",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [notifications, setNotifications] = useState({
    dailyChallenge: true,
    contestAlerts: true,
    streakReminder: false,
  });

  const [accent, setAccent] = useState<AccentId>("blue");

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    enabled: !!currentUser,
  });

  // Extract user from API response (also handle potential corrupted response)
  const apiUser = useMemo(() => extractUser(userData?.data), [userData?.data]);

  // Combined user: prefer store user, fallback to API user
  const user: User | null = currentUser || apiUser;

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setProfilePicture(user.profilePicture || "");
      setCodeforcesHandle(user.codeforcesHandle || "");
      setLeetcodeUsername(user.leetcodeUsername || "");
      setGithubUsername(user.githubUsername || "");
      setGithubRepo(user.githubRepo || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
      codeforcesHandle?: string;
      leetcodeUsername?: string;
    }) => updateUser(user!.id, data),
    onSuccess: (updatedUser: { data?: User }) => {
      if (updatedUser.data) {
        setUser(updatedUser.data);
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || "Failed to change password");
    },
  });

  const connectGithubMutation = useMutation({
    mutationFn: (data: { token: string; repo?: string }) => connectGitHub(data),
    onSuccess: (response: { data?: { repo?: string } }) => {
      const repoName = response.data?.repo || "cs-hub-solutions";
      toast.success(`GitHub connected successfully! Repository: ${repoName}`);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setShowGithubDialog(false);
      setGithubToken("");
      if (user) {
        getCurrentUser().then((result) => {
          if (result.data) {
            setUser(result.data);
            setGithubUsername(result.data.githubUsername || "");
            setGithubRepo(result.data.githubRepo || "");
          }
        });
      }
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(
        error.response?.data?.error || "Failed to connect GitHub account",
      );
    },
  });

  const handleSaveProfile = () => {
    if (!user) return;

    const updateData: Record<string, string | undefined> = {};
    if (firstName !== (user.firstName || ""))
      updateData.firstName = firstName || undefined;
    if (lastName !== (user.lastName || ""))
      updateData.lastName = lastName || undefined;
    if (profilePicture !== (user.profilePicture || ""))
      updateData.profilePicture = profilePicture || undefined;
    if (codeforcesHandle !== (user.codeforcesHandle || ""))
      updateData.codeforcesHandle = codeforcesHandle || undefined;
    if (leetcodeUsername !== (user.leetcodeUsername || ""))
      updateData.leetcodeUsername = leetcodeUsername || undefined;

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  useEffect(() => {
    const selected =
      accentOptions.find((option) => option.id === accent) ?? accentOptions[0];
    const root = document.documentElement;
    root.style.setProperty("--primary", selected.primary);
    root.style.setProperty("--primary-foreground", selected.foreground);
    root.style.setProperty("--ring", selected.ring ?? selected.primary);
  }, [accent]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <Loading size="lg" label="Loading settings..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Manage your profile, preferences, and account settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar Navigation - Horizontal scroll on mobile */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-2 md:p-4 overflow-x-auto lg:overflow-visible">
                <div className="flex lg:flex-col gap-1 lg:space-y-1 min-w-max lg:min-w-0">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors text-xs md:text-sm font-medium whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline lg:inline">
                        {tab.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4 md:space-y-6">
                {/* Public Profile */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-4">
                      Public Profile
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                      This information will be displayed on your public profile.
                    </p>

                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-4 md:mb-6">
                      <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-primary">
                        <AvatarImage
                          src={
                            profilePicture || user.profilePicture || undefined
                          }
                          alt="Avatar"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl">
                          {displayName[0]?.toUpperCase() ||
                            user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center sm:text-left">
                        <Button
                          variant="outline"
                          className="mb-2 text-xs md:text-sm h-8 md:h-10"
                          onClick={() => {
                            const url = prompt("Enter profile picture URL:");
                            if (url) setProfilePicture(url);
                          }}
                        >
                          <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                          Change Avatar
                        </Button>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Recommended: 400x400px, JPG, PNG or GIF.
                        </p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <Label className="text-foreground mb-1.5 md:mb-2 block text-xs md:text-sm">
                          First Name
                        </Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-muted border-border text-foreground text-sm h-9 md:h-10"
                          placeholder="First name"
                        />
                      </div>

                      <div>
                        <Label className="text-foreground mb-1.5 md:mb-2 block text-xs md:text-sm">
                          Last Name
                        </Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-muted border-border text-foreground text-sm h-9 md:h-10"
                          placeholder="Last name"
                        />
                      </div>

                      <div>
                        <Label className="text-foreground mb-1.5 md:mb-2 block text-xs md:text-sm">
                          Username
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-semibold text-sm">
                            @
                          </span>
                          <Input
                            value={user.username}
                            disabled
                            className="bg-muted border-border text-muted-foreground text-sm h-9 md:h-10"
                          />
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                          Username cannot be changed
                        </p>
                      </div>
                    </div>

                    <Button
                      className="mt-4 md:mt-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm h-9 md:h-10"
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Platform Integrations */}
                <Card className="bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-4">
                      Platform Integrations
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                      Connect your coding accounts to sync stats and verify
                      achievements.
                    </p>

                    <div className="space-y-3 md:space-y-4">
                      {/* LeetCode */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-yellow-600 dark:text-yellow-500 font-bold text-sm md:text-base">
                              L
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium text-sm md:text-base">
                              LeetCode
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                              {leetcodeUsername
                                ? `Connected as ${leetcodeUsername}`
                                : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={leetcodeUsername}
                            onChange={(e) =>
                              setLeetcodeUsername(e.target.value)
                            }
                            placeholder="LeetCode username"
                            className="w-full sm:w-32 md:w-40 bg-muted border-border text-foreground text-xs md:text-sm h-8 md:h-9"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            className="text-xs h-8 md:h-9 flex-shrink-0"
                          >
                            {leetcodeUsername ? "Update" : "Connect"}
                          </Button>
                        </div>
                      </div>

                      {/* Codeforces */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-500 font-bold">
                              CF
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium text-sm md:text-base">
                              Codeforces
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                              {codeforcesHandle
                                ? `Connected as ${codeforcesHandle}`
                                : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={codeforcesHandle}
                            onChange={(e) =>
                              setCodeforcesHandle(e.target.value)
                            }
                            placeholder="Codeforces handle"
                            className="w-full sm:w-32 md:w-40 bg-muted border-border text-foreground text-xs md:text-sm h-8 md:h-9"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            className="text-xs h-8 md:h-9 flex-shrink-0"
                          >
                            {codeforcesHandle ? "Update" : "Connect"}
                          </Button>
                        </div>
                      </div>

                      {/* GitHub */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-gray-600/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-700 dark:text-gray-300 font-bold text-sm md:text-base">
                              GH
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium text-sm md:text-base">
                              GitHub
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                              {githubUsername
                                ? `Connected as ${githubUsername}`
                                : "Not connected"}
                            </p>
                            {githubRepo && (
                              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                                Repository: {githubRepo}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGithubDialog(true)}
                          disabled={connectGithubMutation.isPending}
                          className="text-xs h-8 md:h-9 w-full sm:w-auto"
                        >
                          {githubUsername ? "Reconnect" : "Connect"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <Card className="bg-card border-border">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                    Account Settings
                  </h2>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <Label className="text-foreground mb-1.5 md:mb-2 block text-xs md:text-sm">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        value="alexander@example.com"
                        disabled
                        className="bg-muted border-border text-muted-foreground text-sm h-9 md:h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground mb-1.5 md:mb-2 block text-xs md:text-sm">
                        Password
                      </Label>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm h-8 md:h-10">
                        Change Password
                      </Button>
                    </div>
                    <div>
                      <Label className="text-foreground mb-1.5 md:mb-2 block text-xs md:text-sm">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        Secure your account with 2FA
                      </p>
                      <Button
                        variant="outline"
                        className="text-xs md:text-sm h-8 md:h-10"
                      >
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div className="space-y-4 md:space-y-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                      Connected Platforms
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Your connected coding platforms and services.
                    </p>

                    <div className="space-y-4">
                      {/* LeetCode */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                            L
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              LeetCode
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last synced: 2 hours ago
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-10 w-full sm:w-auto"
                        >
                          <Unlink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Disconnect</span>
                        </Button>
                      </div>

                      {/* Codeforces */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-sm md:text-base flex-shrink-0">
                            CF
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium text-sm md:text-base">
                              Codeforces
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              Not connected
                            </p>
                          </div>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm h-8 md:h-10 w-full sm:w-auto">
                          Connect
                        </Button>
                      </div>

                      {/* GitHub */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-gray-600/20 flex items-center justify-center text-gray-300 font-bold text-sm md:text-base flex-shrink-0">
                            GH
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium text-sm md:text-base">
                              GitHub
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              Last synced: 5 minutes ago
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-10 w-full sm:w-auto"
                        >
                          <Unlink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Disconnect</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="bg-card border-border">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-4">
                    Notifications
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                    Manage how you receive updates and reminders.
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    {/* Daily Challenge */}
                    <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-medium text-sm md:text-base">
                          Daily Challenge Reminder
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Receive a notification at 9:00 AM if you haven&apos;t
                          solved the daily problem.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.dailyChallenge}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            dailyChallenge: checked,
                          })
                        }
                        className="flex-shrink-0"
                      />
                    </div>

                    {/* Contest Alerts */}
                    <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-medium text-sm md:text-base">
                          Contest Alerts
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Get notified 12 minutes before registered contests
                          begin.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.contestAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            contestAlerts: checked,
                          })
                        }
                        className="flex-shrink-0"
                      />
                    </div>

                    {/* Streak Reminder */}
                    <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-muted rounded-lg border border-border">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-medium text-sm md:text-base">
                          Streak Saver
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Warning email when your streak is about to expire.
                        </p>
                      </div>
                      <Switch
                        checked={notifications.streakReminder}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            streakReminder: checked,
                          })
                        }
                        className="flex-shrink-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-4 md:space-y-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                      Theme
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                      Choose how the app should look on your device.
                    </p>

                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      {/* Light Theme */}
                      <div
                        onClick={() => setTheme("light")}
                        className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          theme === "light"
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <Sun
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              theme === "light"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`font-medium text-sm md:text-base ${
                              theme === "light"
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            Light
                          </span>
                        </div>
                        <div className="w-full h-14 md:h-20 bg-gradient-to-b from-gray-50 to-gray-100 rounded border border-border" />
                      </div>

                      {/* Dark Theme */}
                      <div
                        onClick={() => setTheme("dark")}
                        className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          theme === "dark"
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <Moon
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              theme === "dark"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`font-medium text-sm md:text-base ${
                              theme === "dark"
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            Dark
                          </span>
                        </div>
                        <div className="w-full h-14 md:h-20 bg-gradient-to-b from-gray-900 to-black rounded border border-border" />
                      </div>

                      {/* Auto Theme */}
                      <div
                        onClick={() => setTheme("system")}
                        className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          theme === "system"
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <Monitor
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              theme === "system"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`font-medium text-sm md:text-base ${
                              theme === "system"
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            System
                          </span>
                        </div>
                        <div className="w-full h-14 md:h-20 rounded border border-border bg-gradient-to-r from-gray-100 to-gray-900" />
                      </div>
                    </div>

                    <p className="text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
                      System mode follows your device preference for light or
                      dark.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                      Accent Color
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                      Customize the color scheme of the application.
                    </p>

                    <div className="grid grid-cols-6 gap-2 md:gap-3">
                      {accentOptions.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => setAccent(option.id)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-lg cursor-pointer border-2 transition-all ${
                            accent === option.id
                              ? "border-primary ring-2 ring-primary/40 shadow-sm"
                              : "border-border hover:border-primary/40"
                          } ${option.swatchClass}`}
                          title={`${option.label} accent`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Danger Zone - Always shown */}
            <Card className="bg-destructive/10 border-destructive/20 mt-6 md:mt-8">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-base md:text-lg font-semibold text-red-500 mb-1.5 md:mb-2">
                  Danger Zone
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  Irreversible actions for your account.
                </p>

                <Button
                  variant="destructive"
                  className="bg-destructive hover:bg-destructive/90 gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-10"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Delete Account
                </Button>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2">
                  Permanently removes your account and all data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-foreground mb-2 block text-sm">
                Current Password
              </Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-muted border-border text-foreground"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm">
                New Password
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-muted border-border text-foreground"
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters with uppercase, lowercase, and
                number
              </p>
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm">
                Confirm New Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-muted border-border text-foreground"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub PAT Connection Dialog */}
      <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Connect GitHub Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Connect your GitHub account using a Personal Access Token (PAT) to
              automatically push your accepted solutions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Instructions */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  How to get your GitHub Personal Access Token:
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      GitHub Settings &rarr; Developer settings &rarr; Personal
                      access tokens &rarr; Tokens (classic)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Click &quot;Generate new token&quot; &rarr; &quot;Generate
                    new token (classic)&quot;
                  </li>
                  <li>
                    Give your token a descriptive name (e.g., &quot;CS Hub
                    Solutions&quot;)
                  </li>
                  <li>Select expiration (recommended: 90 days or custom)</li>
                  <li>
                    <strong>Check the following scopes:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>
                        <code className="bg-muted px-1 rounded">repo</code>{" "}
                        &ndash; Full control of private repositories
                      </li>
                      <li>
                        <code className="bg-muted px-1 rounded">workflow</code>{" "}
                        &ndash; Update GitHub Action workflows
                      </li>
                    </ul>
                  </li>
                  <li>Click &quot;Generate token&quot; at the bottom</li>
                  <li>
                    <strong>Copy the token immediately</strong> &ndash; you
                    won&apos;t be able to see it again!
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Token Input */}
            <div className="space-y-4">
              <div>
                <Label className="text-foreground mb-2 block text-sm">
                  Personal Access Token
                </Label>
                <Input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="bg-muted border-border text-foreground font-mono text-sm"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your token starts with &quot;ghp_&quot; and is 40+ characters
                  long
                </p>
              </div>

              <div>
                <Label className="text-foreground mb-2 block text-sm">
                  Repository Name (Optional)
                </Label>
                <Input
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="bg-muted border-border text-foreground"
                  placeholder="cs-hub-solutions"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to use default: &quot;cs-hub-solutions&quot;.
                  Repository will be created automatically if it doesn&apos;t
                  exist.
                </p>
              </div>
            </div>

            {/* Security Note */}
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <p className="text-sm text-foreground">
                  <strong>Security Note:</strong> Your token is stored securely
                  and only used to push your accepted solutions to GitHub. Never
                  share your token with anyone. You can revoke it anytime from
                  GitHub settings.
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGithubDialog(false);
                setGithubToken("");
              }}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!githubToken.trim()) {
                  toast.error("Please enter your GitHub Personal Access Token");
                  return;
                }
                connectGithubMutation.mutate({
                  token: githubToken.trim(),
                  repo: githubRepo.trim() || undefined,
                });
              }}
              disabled={connectGithubMutation.isPending || !githubToken.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {connectGithubMutation.isPending
                ? "Connecting..."
                : "Connect GitHub"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
