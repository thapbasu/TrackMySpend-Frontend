"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filterMonth, setFilterMonth] = useState(""); // State for month filter
  const [filterDay, setFilterDay] = useState(""); // State for specific day filter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showFilter, setShowFilter] = useState(true);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedExpense?.category) {
      setCategoryInput(selectedExpense.category);
    } else {
      setCategoryInput("");
    }
  }, [selectedExpense]);

  useEffect(() => {
    const categories = [
      ...new Set(expenses.map((expense) => expense.category).filter(Boolean)),
    ];
    setCategorySuggestions(categories);
  }, [expenses]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/expenses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenses(response.data.expenses);
        const date = new Date();
        const currentMonth = date.getMonth() + 1; // 1-12
        setFilterMonth(currentMonth);

        setFilteredExpenses(response.data.expenses);
        console.log(response.data.expenses);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    // Filter expenses whenever filterMonth or filterDay changes
    let filtered = expenses;
    if (filterMonth) {
      filtered = filtered.filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() + 1; // Months are 0-based
        return expenseMonth === parseInt(filterMonth);
      });
    }
    if (filterDay) {
      filtered = filtered.filter((expense) => {
        const expenseDay = new Date(expense.date).getDate();
        return expenseDay === parseInt(filterDay);
      });
    }

    setFilteredExpenses(filtered);
  }, [filterMonth, filterDay, expenses, showFilter]);

  const handleOpenModal = (expense) => {
    setSelectedExpense(expense || null);
    if (expense) {
      // Editing: pre-fill category
      setCategoryInput(expense.category || "");
    } else {
      // Adding new expense: clear input
      setCategoryInput("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = (value) => {
    setIsModalOpen(false);
    setSelectedExpense(null);
    console.log("value", value);
    if (value !== "close") {
      toast.success(`Expense ${value} Successfully`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const expenseData = {
      title: formData.get("title"),
      amount: formData.get("amount"),
      date: formData.get("date") || getTodaysDate(),
      category: categoryInput,
      description: formData.get("description"),
    };

    try {
      const token = localStorage.getItem("token");
      if (selectedExpense) {
        // Edit existing expense
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/expenses/${selectedExpense._id}`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExpenses(
          expenses.map((expense) =>
            expense._id === selectedExpense._id
              ? { ...expense, ...expenseData }
              : expense
          )
        );
      } else {
        // Add new expense
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/expenses/create`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenses([...expenses, expenseData]);
      }
      if (selectedExpense) {
        handleCloseModal("Updated");
      } else {
        handleCloseModal("Added");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  function getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Month options
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day options
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Toaster />
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main>
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              {/* Left section: Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800">
                  Your Recent Expenses
                </h2>
              </div>

              {/* Right section: Button */}
              <button
                onClick={() => handleOpenModal(null)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full sm:w-auto"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Expense
              </button>
            </div>

            <button
              onClick={() => {
                setShowFilter(!showFilter);
              }}
              className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filter</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showFilter ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showFilter && (
              <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
                <div className="flex gap-6">
                  {/* Month Filter */}
                  <div className="flex-1">
                    <label
                      htmlFor="filterMonth"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Filter by Month
                    </label>
                    <div className="relative">
                      <select
                        id="filterMonth"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Month</option>
                        {months.map((month, index) => (
                          <option key={index + 1} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Day Filter */}
                  <div className="flex-1">
                    <label
                      htmlFor="filterDay"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Filter by Day
                    </label>
                    <div className="relative">
                      <select
                        id="filterDay"
                        value={filterDay}
                        onChange={(e) => setFilterDay(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Day</option>
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No expenses found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Add your first expense to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                            {expense.title}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold text-green-600">
                              Rs. {expense.amount}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium text-gray-800">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium text-purple-600">
                              {expense.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-gray-600">Description:</span>
                            <span className="font-medium text-gray-800">
                              {expense.description}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleOpenModal(expense)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit expense"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete expense"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        {/* Modal for Add/Edit Expense */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6 md:px-8 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal("close");
            }}
          >
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg relative mt-8 mb-8">
              <button
                onClick={() => handleCloseModal("close")}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <span className="text-3xl">&times;</span>
              </button>

              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                {selectedExpense ? "Edit Expense" : "Add New Expense"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700">
                    Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    defaultValue={selectedExpense?.title || ""}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="amount" className="block text-gray-700">
                    Amount *
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    defaultValue={selectedExpense?.amount || ""}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="date" className="block text-gray-700">
                    Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={selectedExpense?.date?.split("T")[0] || ""}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-sm text-gray-400">
                    Note: Leave Blank to choose today's date
                  </p>
                </div>

                <div className="mb-4 relative">
                  <label htmlFor="category" className="block text-gray-700">
                    Category *
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onFocus={() => setIsCategoryFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsCategoryFocused(false), 100)
                    }
                    autoComplete="off"
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  {isCategoryFocused && categorySuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-200 w-full max-h-40 overflow-y-auto z-10 shadow">
                      {categorySuggestions
                        .filter((cat) =>
                          categoryInput.trim() === ""
                            ? true
                            : cat
                                .toLowerCase()
                                .includes(categoryInput.toLowerCase())
                        )
                        .map((cat, idx) => (
                          <li
                            key={idx}
                            onMouseDown={() => setCategoryInput(cat)}
                            className="p-2 hover:bg-blue-100 cursor-pointer"
                          >
                            {cat}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={selectedExpense?.description || ""}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  {selectedExpense ? "Update Expense" : "Add Expense"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
