
import React from "react";

const PoliceEnquiryReport = ({ data = [] }) => {
  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">Room No.</th>
            <th className="px-3 py-2 border">Guest Name</th>
            <th className="px-3 py-2 border">Mobile</th>
            <th className="px-3 py-2 border">E-Mail</th>
            <th className="px-3 py-2 border">Gender</th>
            <th className="px-3 py-2 border">DOB</th>
            <th className="px-3 py-2 border">City</th>
            <th className="px-3 py-2 border">Country</th>
            <th className="px-3 py-2 border">Address</th>
            <th className="px-3 py-2 border">Checkin</th>
            <th className="px-3 py-2 border">Checkout</th>
            <th className="px-3 py-2 border">ID Type</th>
            <th className="px-3 py-2 border">ID Link</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="13" className="text-center py-3 text-gray-500">
                No data found.
              </td>
            </tr>
          ) : (
            data.map((entry, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 border text-center">{entry.roomNo}</td>
                <td className="px-3 py-2 border">{entry.guestName}</td>
                <td className="px-3 py-2 border">{entry.phone}</td>
                <td className="px-3 py-2 border">{entry.email}</td>
                <td className="px-3 py-2 border">{entry.gender}</td>
                <td className="px-3 py-2 border">{entry.dob}</td>
                <td className="px-3 py-2 border">{entry.city}</td>
                <td className="px-3 py-2 border">{entry.country}</td>
                <td className="px-3 py-2 border">{entry.address}</td>
                <td className="px-3 py-2 border whitespace-nowrap">{entry.checkIn}</td>
                <td className="px-3 py-2 border whitespace-nowrap">{entry.checkOut}</td>
                <td className="px-3 py-2 border">{entry.identity || '-'}</td>
                <td className="px-3 py-2 border text-blue-600 underline text-center">
                  {entry.photoIdPath ? (
                    <a
                      href={`http://localhost:5000${entry.photoIdPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PoliceEnquiryReport;
