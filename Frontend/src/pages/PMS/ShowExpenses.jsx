import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ShowExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, categoryFilter, dateRange]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expense", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(res.data.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expense/category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const deleteExpense = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/expense/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const applyFilters = () => {
    let filteredData = expenses;

    if (categoryFilter) {
      filteredData = filteredData.filter(
        (exp) => exp.category?.id === categoryFilter
      );
    }

    if (startDate && endDate) {
      filteredData = filteredData.filter((exp) => {
        const expenseDate = new Date(exp.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    setFiltered(filteredData);
  };

  const totalAmount = filtered.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-tr from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">📊 Expense Summary</h2>

      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setDateRange([date, endDate])}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="border p-2 rounded shadow-sm"
            placeholderText="Start date"
            isClearable
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setDateRange([startDate, date])}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="border p-2 rounded shadow-sm"
            placeholderText="End date"
            isClearable
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-md">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Payment Mode</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Created By</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp) => (
              <tr key={exp.id} className="text-center text-sm">
                <td className="py-2 px-4 border">{dayjs(exp.date).format("DD MMM YYYY")}</td>
                <td className="py-2 px-4 border">{exp.category?.name}</td>
                <td className="py-2 px-4 border">₹{exp.amount}</td>
                <td className="py-2 px-4 border">{exp.paymentMode}</td>
                <td className="py-2 px-4 border">{exp.description || "-"}</td>
                <td className="py-2 px-4 border">{exp.createdBy?.email}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-semibold text-sm text-gray-800">
              <td colSpan="2" className="py-2 px-4 border text-right">
                Total:
              </td>
              <td className="py-2 px-4 border">₹{totalAmount}</td>
              <td colSpan="4" className="border"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ShowExpenses;