
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  index: number;
}

export const StatsCard = ({ title, value, icon: Icon, color, index }: StatsCardProps) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500"
  };



  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in",
      `animation-delay-${index * 100}`
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            colorClasses[color as keyof typeof colorClasses]
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
