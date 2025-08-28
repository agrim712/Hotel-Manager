// src/components/EmployeeDirectory.jsx
import React, { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async (params = {}) => {
    setLoading(true);
    try {
      // Example GET endpoint; accepts query params: q, department, status
      const resp = await api.get("/hr/employees", { params });
      setEmployees(resp.data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setEmployees([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = () => {
    fetchEmployees({ q, department: dept, status });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Employee Directory</h2>

      <div className="flex gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, department, designation..."
          className="flex-1 rounded-md border-gray-200 p-2"
        />
        <input
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          placeholder="Department"
          className="w-48 rounded-md border-gray-200 p-2"
        />
        <select className="w-40 rounded-md border-gray-200 p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Resigned">Resigned</option>
        </select>

        <button onClick={handleSearch} className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {employees.length === 0 && <div className="text-gray-500">No employees found</div>}

          {employees.map((emp) => (
            <div key={emp.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-4">
                <img src={emp.photoUrl || "/placeholder-avatar.png"} alt="photo" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{emp.firstName} {emp.lastName}</div>
                  <div className="text-sm text-gray-600">{emp.department} • {emp.designation}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{emp.mobilePrimary}</div>
                <div className={`px-2 py-1 rounded text-sm ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {emp.status || "Unknown"}
                </div>
                <button
                  className="px-3 py-1 bg-gray-50 border rounded text-sm"
                  onClick={() => {
                    // open profile route or modal
                    window.location.href = `/hr/employee/${emp.id}`;
                  }}
                >
                  View/Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
