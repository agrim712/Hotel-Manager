import React from 'react';

const RoomWiseReportTable = ({ data }) => {
  const hasData = Object.keys(data).length > 0;

  return (
    <div className="overflow-x-auto">
      {hasData ? (
        <table className="min-w-full border text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Room No</th>
              <th className="border px-2 py-1 text-left">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([roomNo, amount]) => (
              <tr key={roomNo}>
                <td className="border px-2 py-1">{roomNo}</td>
                <td className="border px-2 py-1">₹{Number(amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-500">No data available for selected date range.</p>
      )}
    </div>
  );
};

export default RoomWiseReportTable;
