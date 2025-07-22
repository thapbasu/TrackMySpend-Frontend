"use client";

import { useEffect, useState } from "react";
import {
    ShoppingCart,
    Car,
    Home,
    Utensils,
    Heart,
    Gamepad2,
    GraduationCap,
    CreditCard,
    TrendingUp,
    Search,
    Calendar,
    DollarSign,
    AlertCircle,
    Loader2,
    Receipt,
    Clipboard,
    PieChart
} from "lucide-react";
import axios from "axios";
import Layout from "@/app/Layout/Layout";

// Category icon mapping
const getCategoryIcon = (category) => {
    const iconMap = {
        'Food': Utensils,
        'Transportation': Car,
        'Housing': Home,
        'Shopping': ShoppingCart,
        'Healthcare': Heart,
        'Entertainment': Gamepad2,
        'Education': GraduationCap,
        'Bills': CreditCard,
        'Investment': TrendingUp,
        'Other': Receipt
    };

    const IconComponent = iconMap[category] || Receipt;
    return <IconComponent className="w-6 h-6" />;
};

// Loading skeleton component
const LoadingSkeleton = () => (
    <div className="space-y-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="space-y-3">
                    {[1, 2].map((j) => (
                        <div key={j} className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

// Empty state component
const EmptyState = () => (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-lg">Loading analytics...</p>
            </div>
        </div>
);

// Error state component
const ErrorState = ({ error, onRetry }) => (
    <div className="text-center py-16">
        <div className="w-32 h-32 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
            Try again
        </button>
    </div>
);

export default function ExpenseCategories() {
    const [groupedExpenses, setGroupedExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedText, setCopiedText] = useState(""); // for showing copied message

    const fetchGroupedExpenses = async () => {
        try {
            setLoading(true);
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/expenses/grouped/categories`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setGroupedExpenses(response.data.data); // Expecting { success, message, data }
        } catch (err) {
            setError("Failed to fetch expenses. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchGroupedExpenses();
    }, []);

    // Filter expenses based on search term
    const filteredExpenses = groupedExpenses.filter(group =>
        group.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.expenses.some(expense =>
            expense.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Calculate total amount
    const totalAmount = groupedExpenses.reduce((total, group) =>
        total + group.expenses.reduce((sum, expense) => sum + expense.amount, 0), 0
    );

    // Copy handler
    const handleCopy = async (group) => {
        try {
            let textToCopy = `${group.category}\n`;
            group.expenses.forEach(expense => {
                textToCopy += `${expense.title} - Rs. ${expense.amount.toLocaleString()}\n`;
            });
            await navigator.clipboard.writeText(textToCopy.trim());
            setCopiedText("Copied!");
            setTimeout(() => {
                setCopiedText("");
            }, 2000);
        } catch (e) {
            console.error("Failed to copy!", e);
        }
    };


    if (isLoading) {
        return (
            <Layout>
                <div
                    className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 text-lg">Loading analytics...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Expense Categories
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Track and analyze your spending patterns
                                    </p>
                                </div>
                            </div>

                            {/* Stats Card */}
                            {!loading && !error && groupedExpenses.length > 0 && (
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white min-w-fit">
                                    <div className="flex items-center space-x-2">
                                        <div>
                                            <p className="text-sm opacity-90">Total Expenses</p>
                                            <p className="text-xl font-bold">Rs. {totalAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Bar */}
                        {!loading && !error && groupedExpenses.length > 0 && (
                            <div className="mt-6 relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search categories or expenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading && <LoadingSkeleton />}

                    {error && (
                        <ErrorState error={error} onRetry={fetchGroupedExpenses} />
                    )}

                    {!loading && !error && groupedExpenses.length === 0 && <EmptyState />}

                    {!loading && !error && filteredExpenses.length === 0 && searchTerm && (
                        <div className="text-center py-12">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-500">
                                Try adjusting your search terms or clear the search to see all categories.
                            </p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    {/* Copied fixed message */}
                    {copiedText && (
                        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-md shadow-lg z-50 select-none pointer-events-none">
                            {copiedText}
                        </div>
                    )}

                    {/* Expense Categories Grid */}
                    {!loading && !error && filteredExpenses.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredExpenses.map((group) => {
                                const categoryTotal = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

                                return (
                                    <div
                                        key={group.category}
                                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 border border-gray-100/50 hover:scale-[1.02]"
                                    >
                                        {/* Category Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                                    {getCategoryIcon(group.category)}
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900 flex items-start space-x-2">
                                                        <span className="whitespace-pre-wrap">{group.category}</span>
                                                        <Clipboard
                                                            className="w-5 h-5 cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors mt-1"
                                                            title="Copy category and expenses"
                                                            onClick={() => handleCopy(group)}
                                                        />
                                                    </h2>

                                                    <p className="text-sm text-gray-500">
                                                        {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    Rs. {categoryTotal.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Expense List */}
                                        <div className="space-y-3">
                                            {group.expenses.map((expense, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
                                                        <span className="text-gray-700 font-medium">
                                                            {expense.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-gray-900">
                                                            Rs. {expense.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
