import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import axios from "axios";

export const UpcomingDeadlines = () => {
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const getDeadline = async () => {
      try {
        const res = await axios.get(
          "https://crm-server-three.vercel.app/get_upcoming_deadlines"
        );
        setDeadlines(res.data);
        console.log(res.data);
      } catch (e) {
        console.error("Error fetching deadlines", e);
      }
    };
    getDeadline();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyIcon = (daysLeft: number) => {
    if (daysLeft <= 3)
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (daysLeft <= 7) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <Calendar className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card
      className="animate-scale-in overflow-y-auto"
      style={{ maxHeight: "400px" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((deadline, index) => (
            <div
              key={deadline.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                <div className="flex items-center gap-2">
                  {getUrgencyIcon(deadline.daysLeft)}
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">{deadline.client}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(deadline.date).toLocaleDateString()}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {deadline.daysLeft === 0
                    ? "Last Day"
                    : `${deadline.daysLeft} days left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
