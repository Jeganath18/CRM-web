
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react";

export const Settings = () => {
  // return (
    // <div className="space-y-6 animate-fade-in">
    //   <div className="flex items-center justify-between">
    //     <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
    //     <div className="text-sm text-gray-500">
    //       Manage your CRM preferences and configurations
    //     </div>
    //   </div>

    //   <Tabs defaultValue="profile" className="w-full">
    //     <TabsList className="grid w-full grid-cols-4">
    //       <TabsTrigger value="profile">Profile</TabsTrigger>
    //       <TabsTrigger value="notifications">Notifications</TabsTrigger>
    //       <TabsTrigger value="security">Security</TabsTrigger>
    //       <TabsTrigger value="system">System</TabsTrigger>
    //     </TabsList>

    //     <TabsContent value="profile" className="space-y-6">
    //       <Card className="animate-scale-in">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <User className="h-5 w-5" />
    //             Profile Settings
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="firstName">First Name</Label>
    //               <Input id="firstName" defaultValue="John" />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="lastName">Last Name</Label>
    //               <Input id="lastName" defaultValue="Doe" />
    //             </div>
    //           </div>
    //           <div className="space-y-2">
    //             <Label htmlFor="email">Email</Label>
    //             <Input id="email" type="email" defaultValue="john.doe@company.com" />
    //           </div>
    //           <div className="space-y-2">
    //             <Label htmlFor="phone">Phone</Label>
    //             <Input id="phone" defaultValue="+91 98765 43210" />
    //           </div>
    //           <div className="space-y-2">
    //             <Label htmlFor="designation">Designation</Label>
    //             <Input id="designation" defaultValue="Senior Manager" />
    //           </div>
    //           <Button>Save Changes</Button>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     <TabsContent value="notifications" className="space-y-6">
    //       <Card className="animate-scale-in">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Bell className="h-5 w-5" />
    //             Notification Preferences
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <div className="flex items-center justify-between">
    //             <div className="space-y-1">
    //               <p className="text-sm font-medium">Email Notifications</p>
    //               <p className="text-xs text-gray-500">Receive notifications via email</p>
    //             </div>
    //             <Switch defaultChecked />
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div className="space-y-1">
    //               <p className="text-sm font-medium">Deadline Reminders</p>
    //               <p className="text-xs text-gray-500">Get reminded about upcoming deadlines</p>
    //             </div>
    //             <Switch defaultChecked />
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div className="space-y-1">
    //               <p className="text-sm font-medium">Task Assignments</p>
    //               <p className="text-xs text-gray-500">Notify when tasks are assigned to you</p>
    //             </div>
    //             <Switch defaultChecked />
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div className="space-y-1">
    //               <p className="text-sm font-medium">Client Updates</p>
    //               <p className="text-xs text-gray-500">Receive updates about client activities</p>
    //             </div>
    //             <Switch />
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div className="space-y-1">
    //               <p className="text-sm font-medium">System Maintenance</p>
    //               <p className="text-xs text-gray-500">Notify about system updates and maintenance</p>
    //             </div>
    //             <Switch defaultChecked />
    //           </div>
    //           <Button>Save Preferences</Button>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     <TabsContent value="security" className="space-y-6">
    //       <Card className="animate-scale-in">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Shield className="h-5 w-5" />
    //             Security Settings
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <div className="space-y-4">
    //             <h3 className="text-lg font-medium">Change Password</h3>
    //             <div className="space-y-2">
    //               <Label htmlFor="currentPassword">Current Password</Label>
    //               <Input id="currentPassword" type="password" />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="newPassword">New Password</Label>
    //               <Input id="newPassword" type="password" />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="confirmPassword">Confirm New Password</Label>
    //               <Input id="confirmPassword" type="password" />
    //             </div>
    //             <Button>Update Password</Button>
    //           </div>
              
    //           <div className="border-t pt-6">
    //             <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
    //             <div className="flex items-center justify-between">
    //               <div className="space-y-1">
    //                 <p className="text-sm font-medium">Enable 2FA</p>
    //                 <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
    //               </div>
    //               <Switch />
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     <TabsContent value="system" className="space-y-6">
    //       <Card className="animate-scale-in">
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Database className="h-5 w-5" />
    //             System Configuration
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <div className="space-y-4">
    //             <h3 className="text-lg font-medium">General Settings</h3>
    //             <div className="flex items-center justify-between">
    //               <div className="space-y-1">
    //                 <p className="text-sm font-medium">Auto-save</p>
    //                 <p className="text-xs text-gray-500">Automatically save changes</p>
    //               </div>
    //               <Switch defaultChecked />
    //             </div>
    //             <div className="flex items-center justify-between">
    //               <div className="space-y-1">
    //                 <p className="text-sm font-medium">Dark Mode</p>
    //                 <p className="text-xs text-gray-500">Use dark theme</p>
    //               </div>
    //               <Switch />
    //             </div>
    //           </div>
              
    //           <div className="border-t pt-6">
    //             <h3 className="text-lg font-medium mb-4">Data Management</h3>
    //             <div className="space-y-4">
    //               <Button variant="outline">Export Data</Button>
    //               <Button variant="outline">Import Data</Button>
    //               <Button variant="destructive">Clear Cache</Button>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>
    //   </Tabs>
    // </div>
  // );
};
