"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookCheck, DollarSign, Users, History, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const navLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/assign', label: 'Job Assignment', icon: BookCheck },
        { href: '/admin/payments', label: 'Approve Payments', icon: DollarSign },
        { href: '/admin/customers', label: 'Customers', icon: Users },
        { href: '/admin/technicians', label: 'Technicians', icon: Users },
        { href: '/admin/history', label: 'History', icon: History },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Toaster />
            <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">Admin Panel</h1>
                <nav className="space-y-2 flex-grow">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}>
                            <span className={`flex items-center p-3 rounded-lg transition-colors ${pathname === link.href ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                                <link.icon className="mr-3 h-5 w-5"/>
                                {link.label}
                            </span>
                        </Link>
                    ))}
                </nav>
                <button onClick={handleLogout} className="w-full mt-8 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                </button>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}