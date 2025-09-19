"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#a4de6c",
  "#8dd1e1",
];
const allMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [monthFilter, setMonthFilter] = useState("All");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/expenses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExpenses(response.data.expenses);
        const date = new Date();
        const currentMonth = allMonths[date.getMonth()]; // "Sep" for September
        setMonthFilter(currentMonth);
      } catch (err) {
        setError("Failed to fetch expenses. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString("default", { month: "short" });
    return (
      year === yearFilter && (monthFilter === "All" || month === monthFilter)
    );
  });

  const getMonthlyExpenses = () => {
    const monthlyData = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "short" });

      if (year.toString() === yearFilter) {
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += expense.amount;
      }
    });

    return allMonths
      .filter((month) => monthlyData[month] !== undefined)
      .map((month) => ({
        name: month,
        total: monthlyData[month] || 0,
      }));
  };

  const getCategoryExpenses = () => {
    const categoryData = {};
    filteredExpenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += expense.amount;
    });

    const sortedCategories = Object.keys(categoryData)
      .map((category) => ({
        name: category,
        value: categoryData[category],
      }))
      .sort((a, b) => b.value - a.value);

    // For pie chart, limit to top categories and group others
    const topCategories = sortedCategories.slice(0, 6);
    const otherCategories = sortedCategories.slice(6);

    const chartData = [...topCategories];

    if (otherCategories.length > 0) {
      const otherTotal = otherCategories.reduce(
        (sum, cat) => sum + cat.value,
        0
      );
      chartData.push({
        name: `Others (${otherCategories.length})`,
        value: otherTotal,
        isOther: true,
        details: otherCategories,
      });
    }

    return { chartData, allCategories: sortedCategories };
  };

  const getTotalExpense = () =>
    filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const highestExpense = filteredExpenses.reduce(
    (max, curr) => (!max || curr.amount > max.amount ? curr : max),
    null
  );

  const availableYears = [
    ...new Set(expenses.map((exp) => new Date(exp.date).getFullYear())),
  ].sort((a, b) => b - a);
  const monthlyChartData = getMonthlyExpenses();
  const { chartData: categoryChartData, allCategories } = getCategoryExpenses();
  const totalExpense = getTotalExpense();

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.isOther) {
        return (
          <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-xs">
            <p className="font-semibold text-gray-800">{data.name}</p>
            <p className="text-sm text-gray-600">
              Total: Rs {data.value.toLocaleString()}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <p className="font-medium">Includes:</p>
              {data.details.slice(0, 5).map((cat, idx) => (
                <p key={idx}>
                  • {cat.name}: Rs {cat.value.toLocaleString()}
                </p>
              ))}
              {data.details.length > 5 && (
                <p>... and {data.details.length - 5} more</p>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="bg-white p-2 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Rs {data.value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {((data.value / totalExpense) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-1 container mx-auto p-2 md:p-6">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800">
              Expense Analytics
            </h2>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div>
                <label
                  htmlFor="yearFilter"
                  className="text-gray-700 font-medium"
                >
                  Select Year:
                </label>
                <select
                  id="yearFilter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="ml-2 p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="monthFilter"
                  className="text-gray-700 font-medium"
                >
                  Select Month:
                </label>
                <select
                  id="monthFilter"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="ml-2 p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="All">All</option>
                  {allMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Expense */}
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow">
                <div className="text-sm font-medium">Total Expense</div>
                <div className="text-2xl font-bold">
                  Rs {totalExpense.toLocaleString()}
                </div>
              </div>

              {/* Highest Expense */}
              <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow">
                <div className="text-sm font-medium">Highest Expense</div>
                {highestExpense ? (
                  <>
                    <div className="text-lg font-bold">
                      Rs {highestExpense.amount.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      {highestExpense.title || highestExpense.category}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(highestExpense.date).toDateString()}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">N/A</div>
                )}
              </div>

              {/* Number of Expenses */}
              <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow">
                <div className="text-sm font-medium">Number of Expenses</div>
                <div className="text-2xl font-bold">
                  {filteredExpenses.length}
                </div>
              </div>
            </div>

            {/* Charts */}
            {filteredExpenses.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">
                No expenses to display for the selected filter.
              </p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Monthly Chart */}
                <div className="bg-white p-2 md:p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Monthly Spending Trends ({yearFilter})
                  </h3>
                  {monthlyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={monthlyChartData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 20 }} // 👈 increased left margin
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" tick={{ fill: "#555" }} />
                        <YAxis
                          tickFormatter={(value) =>
                            `Rs${value.toLocaleString()}`
                          }
                          tick={{ fill: "#555" }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `Rs ${value.toLocaleString()}`,
                            "Total Expense",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="total"
                          fill="#4A90E2"
                          name="Total Expense"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">
                      No monthly data for {yearFilter}.
                    </p>
                  )}
                </div>

                {/* Category Charts */}
                <div className="bg-white p-2 md:p-6 rounded-lg shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
                      Expense Distribution by Category
                    </h3>
                    {allCategories.length > 6 && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        {showAllCategories
                          ? "Show Chart View"
                          : "Show All Categories"}
                      </button>
                    )}
                  </div>

                  {categoryChartData.length > 0 ? (
                    <>
                      {!showAllCategories ? (
                        <div className="space-y-4">
                          {/* Pie Chart */}
                          <div className="flex justify-center">
                            <ResponsiveContainer width="100%" height={350}>
                              <PieChart>
                                <Pie
                                  data={categoryChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={false}
                                >
                                  {categoryChartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {categoryChartData.map((entry, index) => (
                              <div
                                key={entry.name}
                                className="flex items-center space-x-2"
                              >
                                <div
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                <span className="text-gray-700 truncate">
                                  {entry.name}: Rs{" "}
                                  {entry.value.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Detailed List View */
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {allCategories.map((category, index) => (
                            <div
                              key={category.name}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                <span className="font-medium text-gray-700">
                                  {category.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">
                                  Rs {category.value.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(
                                    (category.value / totalExpense) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-gray-500">
                      No category data for selected filters.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Analytics;
