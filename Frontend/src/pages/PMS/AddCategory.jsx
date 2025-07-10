import React, { useState } from "react";
import axios from "axios";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Category name is required." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/expense/category",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({ type: "success", text: "✅ Category added successfully!" });
      setName("");
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error?.response?.data?.message || "❌ Failed to add category." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-tr from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
      <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">➕ Add Expense Category</h3>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm font-medium text-center ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Utilities, Maintenance"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;