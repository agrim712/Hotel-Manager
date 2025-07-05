import React, { useState, useEffect } from "react";
import Pmss from "./Pmss";

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [previousStays, setPreviousStays] = useState([]);

  useEffect(() => {
    fetchGuests();
  }, [page, searchTerm]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/hotel/guests?search=${encodeURIComponent(
          searchTerm
        )}&page=${page}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch guests");
      }

      const data = await response.json();
      setGuests(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching guests:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousStays = async (email) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/hotel/reservations/previous-stays/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      setPreviousStays(data);
      setSelectedGuest(email);
    } catch (error) {
      console.error("Failed to fetch previous stays:", error);
      alert("Failed to fetch previous stays");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#e3efff] to-[#f6f9ff]">
      <Pmss />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
          <div className="mb-6 text-center">
          <h1 class="text-4xl font-extrabold mb-8 text-center text-indigo-800 drop-shadow-lg uppercase tracking-wider border-b-4 border-indigo-300 pb-2">Guests History & Record</h1>
  <p className="text-gray-600 mt-1 text-sm">Search and review all guest stays and lifetime value</p>
</div>
            <input
              type="text"
              placeholder="Search by name, email, phone or ID..."
              className="w-full p-3 border border-gray-300 rounded shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 border-b">Room Numbers</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Phone</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b text-right">Total Value</th>
                  <th className="py-3 px-4 border-b text-center">Previous Stays</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center">
                      No guests found
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{guest.roomNo || "N/A"}</td>
                      <td className="py-3 px-4 border-b">{guest.guestName}</td>
                      <td className="py-3 px-4 border-b">{guest.phone}</td>
                      <td className="py-3 px-4 border-b">{guest.email}</td>
                      <td className="py-3 px-4 border-b text-right">
                        {formatCurrency(guest.totalAmount)}
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          onClick={() => fetchPreviousStays(guest.email)}
                          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {selectedGuest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Previous Stays for {selectedGuest}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedGuest(null);
                      setPreviousStays([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {previousStays.length === 0 ? (
                  <p>No previous stays found</p>
                ) : (
                  <div className="space-y-4">
                    {previousStays.map((stay) => (
                      <div key={stay.id} className="border-b pb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">Hotel:</p>
                            <p>{stay.hotel.name}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Room:</p>
                            <p>
                              {stay.roomNo} ({stay.roomType})
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Check-in:</p>
                            <p>{formatDate(stay.checkIn)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Check-out:</p>
                            <p>{formatDate(stay.checkOut)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Nights:</p>
                            <p>{stay.nights}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Total:</p>
                            <p>{formatCurrency(stay.totalAmount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestList;
