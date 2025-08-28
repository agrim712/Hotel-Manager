import React, { useState, useEffect } from "react";
import { useRoom } from "../../context/RoomContext";
import { useReservationContext } from "../../context/ReservationContext";

const statusColors = {
  CLEANED: "bg-green-500",
  CLEANING: "bg-blue-500",
  EMERGENCY_CLEANING: "bg-red-700",
  MAINTENANCE: "bg-yellow-500",
};

const allStatuses = [
  { label: "Cleaned", value: "CLEANED" },
  { label: "Cleaning", value: "CLEANING" },
  { label: "Emergency Cleaning", value: "EMERGENCY_CLEANING" },
  { label: "Maintenance", value: "MAINTENANCE" },
];

const StatusLegend = () => (
  <div className="flex flex-wrap gap-4 mb-4">
    {Object.entries(statusColors).map(([key, color]) => (
      <div key={key} className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded ${color}`} />
        <span className="text-sm">
          {allStatuses.find((s) => s.value === key)?.label}
        </span>
      </div>
    ))}
  </div>
);

export default function HousekeepingDashboard() {
  const { rooms, loading, error, refreshRooms } = useRoom();
  const { reservations } = useReservationContext();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [pendingStatus, setPendingStatus] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");

  const openStatusModal = (room) => {
    setSelectedRoom(room);
    setPendingStatus(room.cleaningStatus || "CLEANED");
  };

  const handleDone = async () => {
  if (!selectedRoom) return;
  try {
    await fetch(`http://localhost:5000/api/hotel/room-units/${selectedRoom.id}/cleaning-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cleaningStatus: pendingStatus,
      }),
    });
    if (typeof refreshRooms === "function") {
      await refreshRooms();
    } else {
      console.error("refreshRooms is not a function");
    }
  } catch (err) {
    console.error("Failed to update cleaning status", err);
  }
  setSelectedRoom(null);
};


  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const needsCleaning = rooms.filter((room) => {
    const reservation = reservations.find((r) => r.roomUnitId === room.id);
    if (!reservation) return false;
    const checkOut = new Date(reservation.checkOut);
    return (
      checkOut <= now && room.cleaningStatus && room.cleaningStatus !== "CLEANED"
    );
  });

  const cleanedRooms = rooms.filter((room) => room.cleaningStatus === "CLEANED");
  const emergencyCleaningRooms = rooms.filter(
    (room) => room.cleaningStatus === "EMERGENCY_CLEANING"
  );
  const maintenanceRooms = rooms.filter(
    (room) => room.cleaningStatus === "MAINTENANCE"
  );

  // Auto-generate daily housekeeping tasks
  useEffect(() => {
    if (!rooms.length || !reservations.length) return;
    const tasks = [];

    reservations.forEach((res) => {
      const room = rooms.find((r) => r.id === res.roomUnitId);
      if (!room) return;

      const checkInDate = new Date(res.checkIn).toISOString().split("T")[0];
      const checkOutDate = new Date(res.checkOut).toISOString().split("T")[0];

      if (checkOutDate === today) {
        tasks.push({
          task: `Clean room ${room.roomNumber} after checkout`,
          time: "11:00",
        });
      }

      if (checkInDate === today) {
        tasks.push({
          task: `Prepare room ${room.roomNumber} for guest`,
          time: "14:00",
        });
      }
    });

    emergencyCleaningRooms.forEach((room) => {
      tasks.push({
        task: `Emergency cleaning for room ${room.roomNumber}`,
        time: "ASAP",
      });
    });

    setTodos(tasks);
  }, [rooms, reservations, emergencyCleaningRooms, today]);

  const addTodo = () => {
    if (!newTask.trim() || !newTime.trim()) return;
    setTodos((prev) => [...prev, { task: newTask, time: newTime }]);
    setNewTask("");
    setNewTime("");
  };

  const removeTodo = (index) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Housekeeping Dashboard</h1>
        <StatusLegend />

        {loading && <p>Loading rooms...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-6">
            {/* Rooms Grid */}
            <div className="col-span-2 bg-white p-4 rounded shadow">
              <h2 className="font-bold text-lg mb-4">Rooms Assigned</h2>
              <div className="grid grid-cols-4 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 rounded ${
                      statusColors[room.cleaningStatus || "CLEANED"]
                    } text-white cursor-pointer`}
                    onClick={() => openStatusModal(room)}
                  >
                    <div className="text-xl font-bold">{room.roomNumber}</div>
                    <div className="text-sm">
                      {
                        allStatuses.find(
                          (s) => s.value === room.cleaningStatus
                        )?.label
                      }
                    </div>
                    {room.room?.name && (
                      <div className="text-xs mt-1">{room.room.name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold text-lg mb-4">Notifications</h2>

              <div className="mb-4">
                <h3 className="font-semibold">🧹 Needs Cleaning on Checkout</h3>
                {needsCleaning.length > 0 ? (
                  needsCleaning.map((room) => (
                    <p key={room.id} className="text-sm">
                      Room {room.roomNumber}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No rooms</p>
                )}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-green-600">✅ Cleaned</h3>
                {cleanedRooms.length > 0 ? (
                  cleanedRooms.map((room) => (
                    <p key={room.id} className="text-sm">
                      Room {room.roomNumber}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No rooms</p>
                )}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-red-600">
                  🚨 Emergency Cleaning
                </h3>
                {emergencyCleaningRooms.length > 0 ? (
                  emergencyCleaningRooms.map((room) => (
                    <p key={room.id} className="text-sm">
                      Room {room.roomNumber}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No rooms</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-yellow-600">🛠 Maintenance</h3>
                {maintenanceRooms.length > 0 ? (
                  maintenanceRooms.map((room) => (
                    <p key={room.id} className="text-sm">
                      Room {room.roomNumber}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No rooms</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* To-Do List */}
        <div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="font-bold text-lg mb-4">📝 Housekeeping To-Do List</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Task description"
              className="flex-1 border px-2 py-1 rounded"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <input
              type="time"
              className="border px-2 py-1 rounded"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={addTodo}
            >
              Add
            </button>
          </div>

          {todos.length > 0 ? (
            <ul className="space-y-2">
              {todos.map((todo, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    ⏰ {todo.time} – {todo.task}
                  </span>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => removeTodo(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks yet</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">
              Update Status - Room {selectedRoom.roomNumber}
            </h2>
            <div className="flex flex-col gap-2">
              {allStatuses.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`status-${selectedRoom.id}`}
                    value={status.value}
                    checked={pendingStatus === status.value}
                    onChange={() => setPendingStatus(status.value)}
                  />
                  {status.label}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setSelectedRoom(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={handleDone}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
