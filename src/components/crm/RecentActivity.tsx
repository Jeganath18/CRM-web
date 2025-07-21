
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      user: "Priya Sharma",
      action: "completed GST filing",
      client: "ABC Industries",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "completion"
    },
    {
      id: 2,
      user: "Rahul Patel",
      action: "started ITR processing",
      client: "XYZ Corp",
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: "started"
    },
    {
      id: 3,
      user: "Anita Singh",
      action: "sent compliance reminder",
      client: "DEF Ltd",
      time: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: "reminder"
    },
    {
      id: 4,
      user: "Vikram Kumar",
      action: "updated client profile",
      client: "GHI Enterprises",
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      type: "update"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "completion": return "bg-green-100 text-green-800";
      case "started": return "bg-blue-100 text-blue-800";
      case "reminder": return "bg-yellow-100 text-yellow-800";
      case "update": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Avatar>
                <AvatarFallback>
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user} {activity.action} for {activity.client}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(activity.time, { addSuffix: true })}
                </p>
              </div>
              <Badge className={getTypeColor(activity.type)}>
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
