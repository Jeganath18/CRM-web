import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Pencil, Trash2 } from "lucide-react";
import RegisterForm from "../ui/Register_user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const TeamCollaboration = () => {
  const [showForm, setShowform] = useState(false);
  const [teams, setTeams] = useState([]);
  const [showdeleteDialog, setShowdeleteDialog] = useState(false);
  const [showeditDialog, setShoweditDialog] = useState(false);
  const [edituser, setedituser] = useState(null);
  const [edituserId, setedituserId] = useState<number | null>(null);
  
  let isadmin = true;

  if(localStorage.userRole==="account_manager"){
    isadmin=false;
  }


  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("https://crm-server-three.vercel.app/users/team-groups");
      setTeams(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch team data:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const handleEditUser = (member) => {
    setShoweditDialog(true);
    setedituser(member);
    console.log(member);
  };

  const handleDeleteUser = (id: number) => {
    setedituserId(id);
    setShowdeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (!edituserId) return;

      await axios.delete(`https://crm-server-three.vercel.app/delete_user/${edituserId}`);

      // Remove user from team list
      setTeams((prev) =>
        prev.map((team) => ({
          ...team,
          members: team.members.filter((m) => m.id !== edituserId),
        }))
      );

      setedituserId(null);
      setShowdeleteDialog(false);
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showForm ? (
        <RegisterForm onClose={() => setShowform(false)} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="relative inline-block text-3xl font-bold text-gray-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-[#5c2dbf]">
              Team Collaboration
            </h1>
            <Button
              className="hover:bg-[#5c2dbf] bg-[#7b49e7]"
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
                    {team.name==="Filling Staffs" ? "Filing Staffs":team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between group"
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
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                            </div>
                          </div>
                    {isadmin && 
                          <div className="flex items-center space-x-2 opacity-100 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(member)}
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(member.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showdeleteDialog} onOpenChange={setShowdeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>This action cannot be undone!</DialogDescription>
          </DialogHeader>
          <Button className="w-full mt-2" onClick={confirmDelete}>
            Delete User
          </Button>
        </DialogContent>
      </Dialog>
               <Dialog open={showeditDialog} onOpenChange={setShoweditDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Client</DialogTitle>
      <DialogDescription>
        Update details for <strong>{edituser?.name}</strong>
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 text-sm">
      <div>
        <label className="block font-medium">Full Name:</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={edituser?.name || ""}
          onChange={(e) =>
            setedituser((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
      </div>

      <Button
      onClick={async () => {
        try{
          await axios.post(`https://crm-server-three.vercel.app/reset-password/${edituser.id}`)
          setShoweditDialog(false);
        }
        catch(e){
          alert("Change to default password is unsuccessful!");
        }
      }}>
        Change default password
      </Button>

      <Button
        className="w-full mt-4"
        onClick={async () => {
          try {
            await axios.patch(`https://crm-server-three.vercel.app/edit_user/${edituser.id}`, {
              name: edituser.name,
              email: edituser.email,
              role: edituser.role,
              designation: edituser.designation,
            });

            // Refresh or update local team state
            setTeams((prev) =>
              prev.map((team) => ({
                ...team,
                members: team.members.map((m) =>
                  m.id === edituser.id ? edituser : m
                ),
              }))
            );

            setShoweditDialog(false);
          } catch (err) {
            console.error("❌ Failed to update client:", err);
          }
        }}
      >
        Save
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
};
