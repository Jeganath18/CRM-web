
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useEffect, useState } from "react";

export const ServiceStatus = () => {
  useEffect(()=>{
    console.log("Inside useEffect");
    const fetchservicestats = async() =>{
      try{
        const res = await axios.get("https://crm-server-yd9a.onrender.com/get_service_stats");
        const data=res.data;
        console.log(res.data);

        setservices([
           {
      name: data[0].name,
      completed: data[0].completed,
      total: data[0].total,
      status: data[0].status,
      deadline: data[0].deadline
    },
      {
      name: data[1].name,
      completed: data[1].completed,
      total: data[1].total,
      status: data[1].status,
      deadline: data[1].deadline
    },
      {
      name: data[2].name,
      completed: data[2].completed,
      total: data[2].total,
      status: data[2].status,
      deadline: data[2].deadline
    },
        {
      name: data[3].name,
      completed: data[3].completed,
      total: data[3].total,
      status: data[3].status,
      deadline: data[3].deadline
    },
          {
      name: data[4].name,
      completed: data[4].completed,
      total: data[4].total,
      status: data[4].status,
      deadline: data[4].deadline
    },
        ]

        )
        console.log(data);
      }
      catch(e){
        console.log("Error Fetching service status",e);
      }
    }
    fetchservicestats();

  },[])
  
  
  
  const [services,setservices] = useState([ ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead": return "bg-green-500";
      case "on-track": return "bg-blue-500";
      case "behind": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case "ahead": return "Ahead of Schedule";
      case "on-track": return "On Track";
      case "behind": return "Behind Schedule";
      default: return "Unknown";
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle>Service Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {services.map((service, index) => (
            <div key={service.name} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <Badge className={getStatusColor(service.status)}>
                  {getStatusText(service.status)}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{service.completed} of {service.total} completed</span>
               <span>Due: {service.deadline?.slice(0, 10) || 'Not set'}</span>
              </div>
              <Progress 
                value={(service.completed / service.total) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
