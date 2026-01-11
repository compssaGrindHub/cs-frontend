'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Lock, 
  Zap, 
  Bell, 
  Palette,
  Upload,
  Unlink,
  Moon,
  Sun,
  Monitor,
  Trash2
} from 'lucide-react';

type SettingsTab = 'profile' | 'account' | 'integrations' | 'notifications' | 'appearance';

const settingsTabs: { id: SettingsTab; name: string; icon: React.ReactNode }[] = [
  { id: 'profile', name: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'account', name: 'Account', icon: <Lock className="w-4 h-4" /> },
  { id: 'integrations', name: 'Integrations', icon: <Zap className="w-4 h-4" /> },
  { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'appearance', name: 'Appearance', icon: <Palette className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState('Alexander Mitchell');
  const [username, setUsername] = useState('alexdev');
  const [bio, setBio] = useState('CS Student @ Stanford. Passionate about algorithms and distributed systems. Grinding for FAANG.');

  const [notifications, setNotifications] = useState({
    dailyChallenge: true,
    contestAlerts: true,
    streakReminder: false,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, preferences, and account settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Public Profile</h2>
                    <p className="text-sm text-muted-foreground mb-4">This information will be displayed on your public profile.</p>

                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-20 h-20 border-2 border-primary">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=AlexDev" alt="Avatar" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">AM</AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" className="mb-2">
                          <Upload className="w-4 h-4 mr-2" />
                          Change Avatar
                        </Button>
                        <p className="text-xs text-muted-foreground">Recommended: 400x400px, JPG, PNG or GIF.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-foreground mb-2 block text-sm">Display Name</Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="bg-muted border-border text-foreground"
                        />
                      </div>

                      <div>
                        <Label className="text-foreground mb-2 block text-sm">Username</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-semibold">@</span>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-muted border-border text-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-foreground mb-2 block text-sm">Bio</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-muted border-border text-foreground resize-none"
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Brief description for your profile. URLs are hyperlinked.</p>
                      </div>
                    </div>

                    <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Platform Integrations</h2>
                    <p className="text-sm text-muted-foreground mb-6">Connect your coding accounts to sync stats and verify achievements.</p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-yellow-600 dark:text-yellow-500 font-bold">L</span>
                          </div>
                          <div>
                            <p className="text-foreground font-medium">LeetCode</p>
                            <p className="text-xs text-muted-foreground">Connected as alex_mitchell_99</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-500 font-bold">CF</span>
                          </div>
                          <div>
                            <p className="text-foreground font-medium">Codeforces</p>
                            <p className="text-xs text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Connect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-600/20 flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 font-bold">GH</span>
                          </div>
                          <div>
                            <p className="text-foreground font-medium">GitHub</p>
                            <p className="text-xs text-muted-foreground">Connected as alexdev</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Account Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground mb-2 block text-sm">Email Address</Label>
                      <Input
                        type="email"
                        value="alexander@example.com"
                        disabled
                        className="bg-muted border-border text-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block text-sm">Password</Label>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Change Password
                      </Button>
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block text-sm">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground mb-2">Secure your account with 2FA</p>
                      <Button variant="outline">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Connected Platforms</h2>
                  <p className="text-sm text-muted-foreground mb-6">Your connected coding platforms and services.</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500 font-bold">L</div>
                        <div>
                          <p className="text-foreground font-medium">LeetCode</p>
                          <p className="text-xs text-muted-foreground">Last synced: 2 hours ago</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-2">
                        <Unlink className="w-4 h-4" />
                        Disconnect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500 font-bold">CF</div>
                        <div>
                          <p className="text-foreground font-medium">Codeforces</p>
                          <p className="text-xs text-muted-foreground">Not connected</p>
                        </div>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Connect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-600/20 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold">GH</div>
                        <div>
                          <p className="text-foreground font-medium">GitHub</p>
                          <p className="text-xs text-muted-foreground">Last synced: 5 minutes ago</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-2">
                        <Unlink className="w-4 h-4" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
                  <p className="text-sm text-muted-foreground mb-6">Manage how you receive updates and reminders.</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <p className="text-foreground font-medium">Daily Challenge Reminder</p>
                        <p className="text-xs text-muted-foreground">Receive a notification at 9:00 AM if you haven&apos;t solved the daily problem.</p>
                      </div>
                      <Switch
                        checked={notifications.dailyChallenge}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, dailyChallenge: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <p className="text-foreground font-medium">Contest Alerts</p>
                        <p className="text-xs text-muted-foreground">Get notified 12 minutes before registered contests begin.</p>
                      </div>
                      <Switch
                        checked={notifications.contestAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, contestAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <p className="text-foreground font-medium">Streak Saver</p>
                        <p className="text-xs text-muted-foreground">Warning email when your streak is about to expire.</p>
                      </div>
                      <Switch
                        checked={notifications.streakReminder}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, streakReminder: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <>
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Theme</h2>
                    <p className="text-sm text-muted-foreground mb-6">Choose how the app should look on your device.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          theme === 'light'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-muted hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${theme === 'light' ? 'text-primary' : 'text-foreground'}`}>
                            Light
                          </span>
                        </div>
                        <div className="w-full h-20 bg-gradient-to-b from-gray-50 to-gray-100 rounded border border-gray-200" />
                      </div>

                      <div
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          theme === 'dark'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-muted hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${theme === 'dark' ? 'text-primary' : 'text-foreground'}`}>
                            Dark
                          </span>
                        </div>
                        <div className="w-full h-20 bg-gradient-to-b from-gray-900 to-black rounded border border-gray-700" />
                      </div>

                      <div
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          theme === 'system'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-muted hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${theme === 'system' ? 'text-primary' : 'text-foreground'}`}>
                            System
                          </span>
                        </div>
                        <div className="w-full h-20 rounded border border-border bg-gradient-to-r from-gray-100 to-gray-900" />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      System mode will use your device preferences to determine light or dark theme.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Accent Color</h2>
                    <p className="text-sm text-muted-foreground mb-6">Customize the color scheme of the application.</p>

                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {['blue', 'purple', 'pink', 'red', 'orange', 'green'].map((color) => (
                        <div
                          key={color}
                          className={`w-12 h-12 rounded-lg cursor-pointer border-2 transition-all ${'blue' === color ? 'border-foreground/80' : 'border-border'} bg-${color}-600`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Danger Zone */}
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mb-4">Irreversible actions for your account.</p>

                <Button className="border border-destructive/50 text-destructive hover:bg-destructive/10 gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Permanently removes your account and all data.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
