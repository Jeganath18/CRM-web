import { CheckCircle } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

interface DeadlineAlert {
  id: number;
  title: string;
  client: string;
  daysLeft: number; // Negative means overdue
}

interface Props {
  alerts: DeadlineAlert[];
}

const DueAlerts: React.FC<Props> = () => {

    const [alerts,setalerts]=useState([]);



    useEffect( ()=>{
        const getdues = async() =>{
        try{
            const res=await axios.get("https://crm-server-three.vercel.app/get_dues")

            setalerts(res.data);
        }
        catch(e){
            console.log("Error occured",e);
        }
    }
    getdues();
    })





  const getAlertStyle = (daysLeft: number) => {
    if (daysLeft < 0) return "bg-red-50 border border-red-200 text-red-800";
    if (daysLeft <= 5) return "bg-yellow-50 border border-yellow-200 text-yellow-800";
    return "bg-green-50 border border-green-200 text-green-800";
  };

  const getAlertText = (daysLeft: number) => {
    if (daysLeft < 0) return `Due ${Math.abs(daysLeft)} days ago`;
    if (daysLeft === 0) return "Due today";
    return `Due in ${daysLeft} days`;
  };

  return (
    <div className="space-y-3">
      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg ${getAlertStyle(alert.daysOverdue)}`}
          >
            <p className="text-sm font-medium">{alert.title}</p>
            <p className="text-xs">{`Client: ${alert.client} - ${getAlertText(alert.daysOverdue)}`}</p>
          </div>
        ))
      ) : (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">You are all caught up</span>
        </div>
      )}
    </div>
  );
};

export default DueAlerts;