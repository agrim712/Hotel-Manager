import React, { useState } from "react";
import AddExpense from "./AddExpense";
import AddCategory from "./AddCategory";
import ShowExpenses from "./ShowExpenses";

const ExpenseManager = () => {
  const [view, setView] = useState("show");

  const tabs = [
    { label: "Show Expenses", value: "show" },
    { label: "Add Expense", value: "add-expense" },
    { label: "Add Category", value: "add-category" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-800 tracking-wide uppercase flex items-center justify-center gap-2">
          <span role="img" aria-label="money">💸</span>
          Expenses Dashboard
        </h1>
        <div className="h-1 w-24 bg-indigo-500 mx-auto mt-2 rounded-full shadow" />
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setView(tab.value)}
            className={`px-6 py-2 rounded-full text-sm font-semibold shadow transition-all duration-200 ${
              view === tab.value
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View Content */}
      <div className="bg-white p-6 rounded-xl shadow-inner border">
        {view === "show" && <ShowExpenses />}
        {view === "add-expense" && <AddExpense />}
        {view === "add-category" && <AddCategory />}
      </div>
    </div>
  );
};

export default ExpenseManager;