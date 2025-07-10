import React, { useEffect, useState } from "react";
import axios from "axios";

const AddExpense = () => {
  const [form, setForm] = useState({
    date: "",
    amount: "",
    paymentMode: "CASH",
    description: "",
    categoryId: ""
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expense/category", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/expense/add", form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage("✅ Expense added successfully.");
      setForm({
        date: "",
        amount: "",
        paymentMode: "CASH",
        description: "",
        categoryId: ""
      });
    } catch (err) {
      console.error("Error adding expense:", err);
      setMessage("❌ Failed to add expense.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-tr from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Add a New Expense</h2>

      {message && (
        <div className={`mb-4 text-center font-semibold ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Category</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            placeholder="Enter amount"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Payment Mode</label>
          <select
            name="paymentMode"
            value={form.paymentMode}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="(Optional)"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            ➕ Add Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;