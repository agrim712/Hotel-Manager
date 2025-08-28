import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** =========================
 *  Axios instance (token + baseURL)
 *  ========================= */
const API_BASE_URL =
  import.meta?.env?.VITE_API_URL || 
  ""; // e.g. "http://localhost:5000"
const api = axios.create({
  baseURL: API_BASE_URL,
});
  const token = localStorage.getItem("token");

/** =========================
 *  Main Sales Module
 *  ========================= */
export default function SalesMarketing() {
  const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedLead, setSelectedLead] = useState(null);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "leads", label: "Leads" },
    { id: "enquiries", label: "Enquiries" },
    { id: "quotations", label: "Quotations" },
    { id: "bookings", label: "Bookings" },
    { id: "corporateSales", label: "Corporate Sales" },
    { id: "travelAgents", label: "Travel Agent Sales" },
    { id: "groupBooking", label: "Group Booking" },
    { id: "targets", label: "Targets & Incentives" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Sales & Marketing
            </h1>
            <p className="text-gray-500 text-sm">
              Leads, Enquiries, Quotations, Bookings & more
            </p>
          </div>
          <EnvBadge />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              activeTab === tab.id
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 hover:bg-green-50 border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow p-5">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "leads" && <Leads activeTab={activeTab}/>}
                {activeTab === "enquiries" && (
          <Enquiries onConvertToQuotation={(lead) => {
            setSelectedLead(lead);
            setActiveTab("quotations");
          }} /> )}
          {activeTab === "quotations" && <Quotations lead={selectedLead}/>}
        {activeTab === "bookings" && <Bookings />}
        {activeTab === "corporateSales" && <CorporateSales />}
        {activeTab === "travelAgents" && <TravelAgents />}
        {activeTab === "groupBooking" && <GroupBooking />}
        {activeTab === "targets" && <Targets />}
        {activeTab === "reports" && <Reports />}
      </div>
    </div>
  );
}

/** =========================
 *  Dashboard (overview)
 *  ========================= */
function Dashboard() {
  const cards = [
    { title: "Today’s Enquiries", value: "—" },
    { title: "Follow-up Reminders", value: "—" },
    { title: "Bookings This Week", value: "—" },
    { title: "Revenue (MTD)", value: "—" },
    { title: "Performance by Agent", value: "—" },
    { title: "Pipeline by Stage", value: "—" },
  ];
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Sales Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
          >
            <p className="text-sm text-gray-500">{c.title}</p>
            <p className="text-2xl font-semibold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateQuotationPdf(form, savedData) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("Hotel Quotation", 14, 20);

  // Guest info
  doc.setFontSize(12);
  doc.text(`Guest Name: ${form.guestName}`, 14, 30);
  doc.text(`Email: ${form.contactEmail}`, 14, 36);
  doc.text(`Phone: ${form.contactPhone}`, 14, 42);
  doc.text(`Source: ${form.source}`, 14, 48);

  // Room details table
  const roomRows = form.rooms.map((r) => [
    r.roomType,
    r.rateType,
    r.noOfRooms,
    r.rate,
    r.checkIn,
    r.checkOut,
    r.nights,
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Room Type", "Rate Type", "No. Rooms", "Rate", "Check-In", "Check-Out", "Nights"]],
    body: roomRows,
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  // Inclusions & Exclusions
  doc.text("Inclusions:", 14, finalY);
  doc.text(form.inclusions || "-", 14, finalY + 6);

  doc.text("Exclusions:", 105, finalY);
  doc.text(form.exclusions || "-", 105, finalY + 6);

  finalY += 25;

  // Taxes & Discount
  doc.text(`Tax: ${form.tax || 0}%`, 14, finalY);
  doc.text(`Discount: ${form.discount || 0}%`, 105, finalY);

  finalY += 10;

  // Payment & Terms
  doc.text("Payment Policy:", 14, finalY);
  doc.text(form.paymentPolicy || "-", 14, finalY + 6);

  doc.text("Terms & Conditions:", 14, finalY + 20);
  doc.text(form.terms || "-", 14, finalY + 26);

  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for considering us!", 14, 280);

  // Save
  doc.save(`Quotation_${savedData.id}.pdf`);
}

/** =========================
 *  Leads (Fully Functional)
 *  ========================= */
function Leads({activeTab}) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    source: "",
    assignedTo: "",
    status: "Open",
    notes: "",
  });

  const statusOptions = ["Open", "In Discussion", "Quoted", "Won", "Lost"];
  const sourceOptions = ["Website", "OTA", "Walk-in", "Call Center", "Other"];


const fetchLeads = async () => {
  setLoading(true);
  setError("");
  try {
    const { data } = await api.get("/api/hotel/leads", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeads(Array.isArray(data) ? data : []);
  } catch (e) {
    setError("Failed to fetch leads");
  } finally {
    setLoading(false);
  }
};
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this lead?")) return;
    try {
      await api.delete(`/api/hotel/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("Failed to remove lead");
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const payload = {
      name: form.name.trim(),
      source: form.source,
      staff: form.assignedTo,
      status: form.status,
      contactEmail: form.contactEmail?.trim() || undefined,
      contactPhone: form.contactPhone?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    const { data } = await api.post("http://localhost:5000/api/hotel/leads", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setLeads((prev) => [data, ...prev]);
    setForm({
      name: "",
      contactEmail: "",
      contactPhone: "",
      source: "",
      assignedTo: "",
      status: "Open",
      notes: "",
    });
  } catch (e) {
    console.log(e)
    setError("Failed to create lead");
  }
};
useEffect(() => {
  if (activeTab === "leads" && leads.length === 0) {
    fetchLeads();
  }
}, [activeTab]);
const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Lead Management</h2>
        <p className="text-sm text-gray-500">
          Capture leads, auto-tag by source, assign to staff, track aging &
          follow-ups.
        </p>
      </div>

      {/* Lead Form */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-4 border border-gray-200 rounded-xl p-4"
      >
        <TextField
          label="Lead Name"
          placeholder="Guest / Company Name"
          value={form.name}
          onChange={(v) => handleChange("name", v)}
          required
        />
        <SelectField
          label="Source"
          value={form.source}
          onChange={(v) => handleChange("source", v)}
          options={sourceOptions}
          placeholder="Select Source"
          required
        />
        <TextField
          label="Contact Email"
          type="email"
          placeholder="email@example.com"
          value={form.contactEmail}
          onChange={(v) => handleChange("contactEmail", v)}
        />
        <TextField
          label="Contact Phone"
          type="tel"
          placeholder="+91-XXXXXXXXXX"
          value={form.contactPhone}
          onChange={(v) => handleChange("contactPhone", v)}
        />
        <TextField
          label="Assigned To"
          placeholder="Staff Name"
          value={form.assignedTo}
          onChange={(v) => handleChange("assignedTo", v)}
          required
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(v) => handleChange("status", v)}
          options={statusOptions}
          placeholder="Select Status"
          required
        />
        <TextAreaField
          label="Notes"
          placeholder="Any remarks or context…"
          value={form.notes}
          onChange={(v) => handleChange("notes", v)}
          className="md:col-span-2"
        />

        <div className="md:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg border border-green-600 hover:opacity-90"
          >
            Save Lead
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </form>

      {/* Table + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold">All Leads</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="px-3 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-xl">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Name",
                "Source",
                "Assigned To",
                "Status",
                "Email",
                "Phone",
                "Created",
                "Actions",
              ].map((h) => (
                <th key={h} className="border-b px-3 py-2 text-left text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : leads.length ? (
              leads.map((lead) => (
                <tr key={lead.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{lead.name}</td>
                  <td className="px-3 py-2 border-b">{lead.source}</td>
                  <td className="px-3 py-2 border-b">
                    {lead.staff || lead.assignedTo || "-"}
                  </td>
                  <td className="px-3 py-2 border-b">{lead.status || "Open"}</td>
                  <td className="px-3 py-2 border-b">
                    {lead.contactEmail || "—"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {lead.contactPhone || "—"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex gap-2">
                      <button onClick={() => handleRemove(lead.id)} className="px-2 py-1 border rounded hover:bg-red-50 text-red-600">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3" colSpan={8}>
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Tip: Add actions to convert a Lead → Enquiry/Quotation when your backend
        is ready.
      </p>
    </div>
  );
}

/** =========================
 *  Enquiries (UI placeholder with filters + table)
 *  ========================= */
function Enquiries({ onConvertToQuotation }) {
  const [filters, setFilters] = useState({
    source: "",
    assigned: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statuses = ["Open", "In Discussion", "Quoted", "Won", "Lost"];
  const sources = ["Website", "OTA", "Walk-in", "Call Center", "Other"];

  const fetchEnquiries = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/hotel/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Enquiries API Response:", data);

      // use as-is since backend already returns array of leads
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching enquiries", e);
      setError("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this enquiry?")) return;
    try {
      await api.delete(`/api/hotel/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert("Failed to delete enquiry");
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // filter logic
  const filtered = enquiries.filter((e) => {
    return (
      (!filters.source || e.source === filters.source) &&
      (!filters.assigned ||
        e.staff?.toLowerCase().includes(filters.assigned.toLowerCase())) &&
      (!filters.status || e.status === filters.status) &&
      (!filters.dateFrom ||
        new Date(e.createdAt) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo ||
        new Date(e.createdAt) <= new Date(filters.dateTo))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Enquiry Management</h2>
        <p className="text-sm text-gray-500">
          Centralized board with filters and quick actions.
        </p>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-5 gap-3 border border-gray-200 rounded-xl p-4">
        <SelectField
          label="Source"
          value={filters.source}
          onChange={(v) => setFilters((p) => ({ ...p, source: v }))}
          options={sources}
          placeholder="Any"
        />
        <TextField
          label="Assigned Agent"
          value={filters.assigned}
          onChange={(v) => setFilters((p) => ({ ...p, assigned: v }))}
          placeholder="Type name"
        />
        <SelectField
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
          options={statuses}
          placeholder="Any"
        />
        <TextField
          label="From"
          type="date"
          value={filters.dateFrom}
          onChange={(v) => setFilters((p) => ({ ...p, dateFrom: v }))}
        />
        <TextField
          label="To"
          type="date"
          value={filters.dateTo}
          onChange={(v) => setFilters((p) => ({ ...p, dateTo: v }))}
        />
      </div>

      {/* Table */}
      <div className="overflow-auto border border-gray-200 rounded-xl">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : error ? (
          <p className="p-4 text-red-500">{error}</p>
        ) : (
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Enquiry ID",
                  "Guest Name",
                  "Source",
                  "Status",
                  "Assigned",
                  "Email",
                  "Phone",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b px-3 py-2 text-left text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((enq) => (
                <tr key={enq.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{enq.enquiryId}</td>
                  <td className="px-3 py-2 border-b">{enq.name}</td>
                  <td className="px-3 py-2 border-b">{enq.source}</td>
                  <td className="px-3 py-2 border-b">{enq.status}</td>
                  <td className="px-3 py-2 border-b">{enq.staff}</td>
                  <td className="px-3 py-2 border-b">
                    {enq.contactEmail || "—"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {enq.contactPhone || "—"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {new Date(enq.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded hover:bg-gray-50">
                        View
                      </button>
                      <button
  className="px-2 py-1 border rounded hover:bg-gray-50"
  onClick={() => onConvertToQuotation(enq)}
>
  Convert to Quotation
</button>

                      <button
                        className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                        onClick={() => handleRemove(enq.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="px-3 py-3 text-center" colSpan={9}>
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}



/** =========================
 *  Quotations (UI placeholder with builder)
 *  ========================= */
function Quotations({ lead }) {
  const [form, setForm] = useState({
    leadId: lead?.id || "",
    guestName: lead?.name || "",
    contactEmail: lead?.contactEmail || "",
    contactPhone: lead?.contactPhone || "",
    source: lead?.source || "",

    // Multiple room types supported
    rooms: [
      {
        roomType: "",
        rateType: "",
        rate: "",
        noOfRooms: 1,
        checkIn: "",
        checkOut: "",
        nights: 0,
      },
    ],

    inclusions: "",
    exclusions: "",
    discount: "",
    tax: "",
    paymentPolicy: "",
    terms: "",
    addons: [{ name: "", price: "" }],
  });

  // Handle changes for rooms
  const handleRoomChange = (idx, key, val) => {
    setForm((prev) => {
      const rooms = [...prev.rooms];
      rooms[idx] = { ...rooms[idx], [key]: val };

      // auto calc nights
      if (key === "checkIn" || key === "checkOut") {
        rooms[idx].nights = calcNights(rooms[idx].checkIn, rooms[idx].checkOut);
      }

      return { ...prev, rooms };
    });
  };

  const addRoom = () =>
    setForm((prev) => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        {
          roomType: "",
          rateType: "",
          rate: "",
          noOfRooms: 1,
          checkIn: "",
          checkOut: "",
          nights: 0,
        },
      ],
    }));

  const removeRoom = (idx) =>
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (generatePdf = false) => {
  try {
    const { data } = await api.post("/api/hotel/quotations", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Quotation created successfully!");
    console.log("Quotation saved:", data);

    if (generatePdf) {
      generateQuotationPdf(form, data); // ✅ download PDF
    }
  } catch (e) {
    console.error(e);
    alert("Failed to create quotation");
  }
};

  // If no lead, show empty
  if (!lead) {
    return (
      <p className="text-gray-500">
        Select a lead from Enquiries to create a quotation.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Generate Quotation</h2>

      {/* Lead Info */}
      <div className="grid md:grid-cols-2 gap-4 border p-4 rounded-xl bg-gray-50">
        <TextField label="Guest Name" value={form.guestName} disabled />
        <TextField label="Contact Email" value={form.contactEmail} disabled />
        <TextField label="Contact Phone" value={form.contactPhone} disabled />
        <TextField label="Source" value={form.source} disabled />
      </div>

      {/* Room Types */}
      <div className="border p-4 rounded-xl space-y-4">
        <h3 className="font-semibold text-gray-700">Room Details</h3>
        {form.rooms.map((room, idx) => (
          <div
            key={idx}
            className="grid md:grid-cols-3 gap-4 border p-3 rounded-lg"
          >
            <TextField
              label="Room Type"
              value={room.roomType}
              onChange={(v) => handleRoomChange(idx, "roomType", v)}
              required
            />
            <SelectField
              label="Rate Type"
              value={room.rateType}
              onChange={(v) => handleRoomChange(idx, "rateType", v)}
              options={["CP", "AP", "UAI"]}
            />
            <TextField
              label="Rate/Night/Room(Tax Exclusive)"
              type="number"
              value={room.rate}
              onChange={(v) => handleRoomChange(idx, "rate", v)}
            />
            <TextField
              label="No. of Rooms"
              type="number"
              value={room.noOfRooms}
              onChange={(v) => handleRoomChange(idx, "noOfRooms", v)}
            />
            <TextField
              label="Check-in"
              type="date"
              value={room.checkIn}
              onChange={(v) => handleRoomChange(idx, "checkIn", v)}
              required
            />
            <TextField
              label="Check-out"
              type="date"
              value={room.checkOut}
              onChange={(v) => handleRoomChange(idx, "checkOut", v)}
              required
            />
            <TextField
              label="Nights"
              type="number"
              value={room.nights}
              disabled
            />
            <div className="md:col-span-3 text-right">
              {form.rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(idx)}
                  className="text-red-600 text-sm"
                >
                  Remove Room
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addRoom}
          className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          + Add Room Type
        </button>
      </div>

      {/* Inclusions / Exclusions */}
      <div className="grid md:grid-cols-2 gap-4 border p-4 rounded-xl">
        <TextAreaField
          label="Inclusions"
          value={form.inclusions}
          onChange={(v) => setForm((p) => ({ ...p, inclusions: v }))}
        />
        <TextAreaField
          label="Exclusions"
          value={form.exclusions}
          onChange={(v) => setForm((p) => ({ ...p, exclusions: v }))}
        />
      </div>

      {/* Taxes, Discounts, Policy, Terms */}
      <div className="grid md:grid-cols-2 gap-4 border p-4 rounded-xl">
        <TextField
          label="Tax %"
          value={form.tax}
          onChange={(v) => setForm((p) => ({ ...p, tax: v }))}
        />
        <TextField
          label="Discount %"
          value={form.discount}
          onChange={(v) => setForm((p) => ({ ...p, discount: v }))}
        />
        <TextAreaField
          label="Payment Policy"
          value={form.paymentPolicy}
          onChange={(v) => setForm((p) => ({ ...p, paymentPolicy: v }))}
        />
        <TextAreaField
          label="Terms & Conditions"
          value={form.terms}
          onChange={(v) => setForm((p) => ({ ...p, terms: v }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
  <button
    className="px-4 py-2 bg-green-600 text-white rounded-lg"
    onClick={() => handleSubmit(false)} // only backend
  >
    Save Draft
  </button>
  <button
    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    onClick={() => handleSubmit(true)} // backend + PDF
  >
    Generate Quotation
  </button>
</div>

    </div>
  );
}


/** =========================
 *  Bookings (UI placeholder)
 *  ========================= */
function Bookings() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Booking Conversion</h2>
      <p className="text-sm text-gray-500">
        View confirmed bookings and conversion from quotations. Integrate with
        room inventory for availability.
      </p>
      <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        No bookings to display.
      </div>
    </div>
  );
}

/** =========================
 *  Corporate Sales (UI placeholder)
 *  ========================= */
function CorporateSales() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Corporate Sales</h2>
      <p className="text-sm text-gray-500">
        Company profiles, contracts, invoice & credit tracking, renewal alerts.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <TextField label="Company Name" placeholder="e.g., ABC Corp" />
        <TextField label="Contact Person" placeholder="e.g., Ravi Kumar" />
        <TextField label="Agreement Date" type="date" />
        <SelectField
          label="Status"
          options={["Active", "Pending", "Expired"]}
          placeholder="Select"
        />
      </div>
    </div>
  );
}

/** =========================
 *  Travel Agents (UI placeholder)
 *  ========================= */
function TravelAgents() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Travel Agent Sales</h2>
      <p className="text-sm text-gray-500">
        Track commissions, agency profiles, and special tariffs.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <TextField label="Agency Name" />
        <TextField label="Agent Name" />
        <TextField label="Contact Number" type="tel" />
      </div>
      <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        Commission slabs & approvals will appear here.
      </div>
    </div>
  );
}

/** =========================
 *  Group Booking (UI placeholder with tabs)
 *  ========================= */
function GroupBooking() {
  const [tab, setTab] = useState("rooming");
  const subTabs = [
    { id: "rooming", label: "Rooming List" },
    { id: "guests", label: "Guest Details" },
    { id: "events", label: "Event Schedule" },
    { id: "payments", label: "Payment Plan" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Group Booking</h2>

      <div className="flex gap-2 flex-wrap">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === t.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        {tab === "rooming" && <p>Editable room blocks appear here.</p>}
        {tab === "guests" && <p>Add/Import guest details here.</p>}
        {tab === "events" && <p>Banquet & meal schedule builder here.</p>}
        {tab === "payments" && <p>Milestone-wise payment plan here.</p>}
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
          Export Itinerary
        </button>
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
          Export Invoice
        </button>
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
          Export Contract
        </button>
      </div>
    </div>
  );
}

/** =========================
 *  Targets & Incentives (UI placeholder)
 *  ========================= */
function Targets() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Targets & Incentives</h2>
      <p className="text-sm text-gray-500">
        Track target vs achievement; auto-calc incentives.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <TextField label="Sales Target (Month)" type="number" />
        <TextField label="Achieved (Month)" type="number" />
        <TextField label="Achievement %" disabled placeholder="Auto" />
      </div>
      <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        Department-wise performance graphs will appear here.
      </div>
    </div>
  );
}

/** =========================
 *  Reports (UI placeholder)
 *  ========================= */
function Reports() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Reports & Forecasting</h2>
      <p className="text-sm text-gray-500">
        Generate daily/weekly/monthly booking reports, occupancy forecasts, and
        compare revenue vs target. Export to PDF/Excel.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="Report Type"
          options={[
            "Daily Bookings",
            "Weekly Bookings",
            "Monthly Bookings",
            "Occupancy Forecast",
            "Revenue vs Target",
            "Lead Source Performance",
          ]}
          placeholder="Choose report"
        />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="From" type="date" />
          <TextField label="To" type="date" />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
          Generate
        </button>
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
          Export PDF
        </button>
        <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
          Export Excel
        </button>
      </div>
      <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        Report results table/chart will render here.
      </div>
    </div>
  );
}

/** =========================
 *  Small UI helpers
 *  ========================= */
function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="border w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 disabled:bg-gray-100"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="border w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  required,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="border w-full rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function EnvBadge() {
  return (
    <div className="px-3 py-1.5 text-xs rounded-full border border-gray-300 bg-gray-50 text-gray-600">
      API: <span className="font-mono">{API_BASE_URL || "same-origin"}</span>
    </div>
  );
}

/** =========================
 *  Utils
 *  ========================= */
function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
