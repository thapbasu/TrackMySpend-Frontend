"use client";
import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, Menu, X,Receipt } from "lucide-react";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const pathname = usePathname();

    const navItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
        },
        {
            name: "Analytics",
            href: "/analytics",
            icon: <BarChart2 className="w-5 h-5 mr-2" />,
        },
        { name: "Expense Overview",
            href: "/expense-categories",
            icon: <Receipt className="w-5 h-5 mr-2" />,}
    ];

    // Close sidebar when clicking outside (only for small screens)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(e.target) &&
                sidebarOpen &&
                window.innerWidth < 768 // only close on small screens
            ) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed z-30 inset-y-0 left-0 w-64 transform bg-white shadow-lg border-r
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:static md:inset-0
                `}
            >
                <div className="h-full p-4 flex flex-col">
                    <div className="text-2xl font-bold mb-4">
                        <Link href="/dashboard">
                            <img
                                className="w-40 cursor-pointer"
                                src="/logo.png"
                                alt="Logo"
                            />
                        </Link>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-2 rounded-md transition
                                        ${isActive
                                        ? "bg-blue-100 text-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-blue-100"
                                    }
                                    `}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* Header with toggle button */}
                <header className="flex items-center  bg-white shadow-md md:shadow-none">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden text-gray-600 p-2 rounded-md hover:bg-gray-200"
                    >
                        {sidebarOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                    <Header />
                </header>

                <main className="p-3 md:p-4">
                    {children}
                </main>

                <footer className="bg-gray-100 text-center p-4 mt-auto text-sm text-gray-500">
                    © 2025 TrackMySpend
                </footer>
            </div>
        </div>
    );
}
