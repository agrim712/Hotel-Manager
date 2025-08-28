import React, { useState } from "react";

export default function SecurityManagement() {
  const [activeTab, setActiveTab] = useState("visitorLog");

  const tabs = [
    { id: "visitorLog", label: "Visitor Log" },
    { id: "incidentReports", label: "Incident Reports" },
    { id: "blacklist", label: "Blacklist" },
    { id: "staffAccess", label: "Staff Access" },
    { id: "roles", label: "Roles & Responsibilities" },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Security Management Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Monitor visitors, incidents, and restricted access
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-4">
        {activeTab === "visitorLog" && (
          <VisitorLog />
        )}
        {activeTab === "incidentReports" && (
          <IncidentReports />
        )}
        {activeTab === "blacklist" && (
          <Blacklist />
        )}
        {activeTab === "staffAccess" && (
          <StaffAccess />
        )}
        {activeTab === "roles" && (
          <RolesResponsibilities />
        )}
      </div>
    </div>
  );
}

// Visitor Log Component
function VisitorLog() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Visitor Log & ID Verification</h2>
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">ID Type</th>
            <th className="border p-2">Check-in Time</th>
            <th className="border p-2">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">John Doe</td>
            <td className="border p-2">Passport</td>
            <td className="border p-2">10:30 AM</td>
            <td className="border p-2">Meeting</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Incident Reports Component
function IncidentReports() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Incident Reports</h2>
      <form className="space-y-3">
        <input
          type="text"
          placeholder="Incident Title"
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full rounded"
        />
        <select className="border p-2 w-full rounded">
          <option>Security Breach</option>
          <option>Guest Misbehavior</option>
          <option>Other</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Report
        </button>
      </form>
    </div>
  );
}

// Blacklist Component
function Blacklist() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Blacklist / Flagged Guests</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Date Added</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Jane Smith</td>
            <td className="border p-2">Previous incident</td>
            <td className="border p-2">2025-08-01</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Staff Access Component
function StaffAccess() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Staff Entry Logs & Restricted Access</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Staff Name</th>
            <th className="border p-2">Access Area</th>
            <th className="border p-2">Entry Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Mike Johnson</td>
            <td className="border p-2">Server Room</td>
            <td className="border p-2">09:15 AM</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Roles & Responsibilities Component
function RolesResponsibilities() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Roles & Responsibilities</h2>
      <ul className="list-disc pl-5 mb-4 text-sm">
        <li>Surveillance & Patrolling</li>
        <li>Visitor Log Management</li>
        <li>Emergency Handling</li>
        <li>Lost & Found Security Verification</li>
      </ul>
      <h3 className="font-semibold mb-2">Common Designations</h3>
      <ul className="list-disc pl-5 text-sm">
        <li>Security Manager</li>
        <li>Security Supervisor</li>
        <li>Security Guard</li>
        <li>Fire Safety Officer</li>
      </ul>
    </div>
  );
}
