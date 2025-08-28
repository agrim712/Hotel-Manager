import React, { useState } from "react";

const Folio = () => {
  const [entries, setEntries] = useState([
    {
      date: "2025-08-22",
      description: "Room Charge - Deluxe Room",
      debit: 5000,
      credit: 0,
      type: "Room Charge",
      reference: "RES123",
      status: "Posted",
    },
    {
      date: "2025-08-22",
      description: "Advance Payment - UPI",
      debit: 0,
      credit: 2000,
      type: "Payment",
      reference: "TXN789",
      status: "Posted",
    },
  ]);

  const calculateBalance = () => {
    let balance = 0;
    return entries.map((entry) => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });
  };

  const folioData = calculateBalance();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Guest Folio</h2>
      <div className="overflow-x-auto rounded-lg shadow-lg border">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-right">Debit</th>
              <th className="border px-4 py-2 text-right">Credit</th>
              <th className="border px-4 py-2 text-right">Balance</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Reference</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {folioData.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{entry.date}</td>
                <td className="border px-4 py-2">{entry.description}</td>
                <td className="border px-4 py-2 text-right">{entry.debit}</td>
                <td className="border px-4 py-2 text-right">{entry.credit}</td>
                <td className="border px-4 py-2 text-right">{entry.balance}</td>
                <td className="border px-4 py-2">{entry.type}</td>
                <td className="border px-4 py-2">{entry.reference}</td>
                <td className="border px-4 py-2">{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Folio;
