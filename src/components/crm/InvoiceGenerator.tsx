import defaultLogo from "@/assets/Wealth Empires.jpg";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

interface InvoiceProps {
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientGST: string;
  services: string;
  amount: number[];
  invoiceId: string;
  issueDate: string;
  dueDate: string;
  onClose?: () => void; 
}

const InvoicePreview = ({
  clientName,
  clientAddress,
  clientEmail,
  clientGST,
  services,
  amount,
  invoiceId,
  issueDate,
  dueDate,
  onClose,
}: InvoiceProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const handlePrint = () => {
    const divContents = document.getElementById("Invoice")?.innerHTML;
    if (!divContents) return;

    const printWindow = window.open('', '', 'height=500,width=500');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body {
                font-family: sans-serif;
                padding: 20px;
                color: black;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                border-bottom: 1px solid #ccc;
              }
            </style>
          </head>
          <body>
            ${divContents}
          </body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 300);
    }
  };

  return (
    <div>
      <div className="min-h-[400px] bg-white text-white p-5 font-sans flex flex-col">
        {/* Top Bar with Close & Print */}
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant="outline"
            className="text-black border border-gray-400"
            onClick={onClose ? onClose : () => window.close()}
          >
            Close
          </Button>
          <Button
            className="hover:bg-[#5c2dbf] bg-[#7b49e7] text-white"
            onClick={reactToPrintFn}
          >
             Print
          </Button>
        </div>

        {/* Invoice Box */}
        <div ref={contentRef} className="mb-10">
        <div className="w-[700px] mx-auto rounded-lg p-5"  id="Invoice">
          <div className="flex justify-between items-start">
            <img src={defaultLogo} alt="Company Logo" className="h-40" />
            <div className="text-right">
              <p className="text-xl font-semibold text-gray-800">Invoice {invoiceId}</p>
              <p className="text-sm text-gray-800">Issued at: {issueDate}</p>
              <p className="text-sm text-gray-800">Due at: {dueDate}</p>
              <p className="text-sm text-gray-800">Late fee: 0.50%</p>
            </div>
          </div>

          <div className="flex justify-between mb-10 text-sm">
            <div>
              <p className="font-bold text-gray-800 text-lg">{clientName}</p>
              <p className="text-gray-800 w-[200px]">{clientAddress}</p>
              <p className="text-gray-800">{clientEmail}</p>
              <p className="text-gray-800">GST: {clientGST}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 text-lg">Wealth Empires</p>
              <p className="text-gray-800">Greenways Bussiness Park, Chennai</p>
              <p className="text-gray-800">Tamilnadu, India</p>
              <p className="text-gray-800">support@wealthempires.in</p>
              <p className="text-gray-800">GST : 566121545</p>
            </div>
          </div>

<table className="w-full text-sm mb-10">
  <thead className="text-gray-800">
    <tr>
      <th className="text-left py-2 text-lg">Services</th>
      <th className="text-right py-2 px-0 text-lg">Price</th>
      <th className="text-right py-2 px-0 text-lg">TAX (18%)</th>
      <th className="text-right py-2 px-0 text-lg">Total</th>
    </tr>
  </thead>
  <tbody>
    {Array.isArray(services) && Array.isArray(amount) &&
      services.map((service, idx) => {
        const price = parseFloat(amount[idx]) || 0;
        const gst = price * 0.18;
        const total = price + gst;
        return (
          <tr key={idx} className="border-gray-800">
            <td className="text-gray-800">
              {service.toUpperCase()}
            </td>
            <td className="py-3 text-right text-gray-800">₹{price.toFixed(2)}</td>
            <td className="py-3 text-right text-gray-800">₹{gst.toFixed(2)}</td>
            <td className="py-3 text-right text-gray-800">₹{total.toFixed(2)}</td>
          </tr>
        );
      })}
  </tbody>
</table>


          <div className="text-right text-gray-800">
            <p className="text-lg font-semibold">Overall Total</p>
            <p className="text-xl font-bold">
  ₹
  {Array.isArray(amount)
    ? amount.reduce((sum, val) => sum + parseFloat(val || 0), 0).toFixed(2)
    : "0.00"}
</p>
          </div>

          <div className="mt-10 pt-4 text-sm text-gray-800">
            <p className="font-semibold mb-1">Payment Details</p>
            <p>Account number 1692500100759601</p>
            <p>IFSC KARB0000169</p>
            <p>UPI ID : 9884521264@okbizaxis</p>
          </div>
        </div>
      </div>
              </div>
    </div>
  );
};

export default InvoicePreview;
