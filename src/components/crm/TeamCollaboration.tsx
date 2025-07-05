import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import RegisterForm from "../ui/Register_user";

export const TeamCollaboration = () => {
  const [showForm, setShowform] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/team-groups");
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch team data:", err);
      }
    };
    fetchTeams();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showForm ? (
        <RegisterForm onClose={() => setShowform(false)} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowform(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team, index: number) => (
              <Card
                key={team.name}
                className="hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {member.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                  member.status || "offline"
                                )}`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};