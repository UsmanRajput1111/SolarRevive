"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, User, LogOut, Sun, Menu, X, Briefcase } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function TechnicianLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const navLinks = [
        { href: '/technician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/technician/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Toaster position="top-right" />
            
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white shadow-lg p-4 flex-col hidden md:flex">
                <div className="flex items-center mb-10">
                    <Sun className="h-8 w-8 text-amber-500" />
                    <h1 className="text-2xl font-bold ml-2 text-slate-800">Solar Revive</h1>
                </div>
                <nav className="space-y-2 flex-grow">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className={`flex items-center p-3 rounded-lg font-semibold transition-colors ${pathname === link.href ? 'bg-indigo-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <link.icon className="mr-3 h-5 w-5"/>{link.label}
                        </Link>
                    ))}
                </nav>
                <button onClick={handleLogout} className="w-full mt-8 bg-slate-100 text-slate-600 py-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center font-semibold">
                    <LogOut className="mr-2 h-5 w-5"/> Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                    <div className="flex items-center">
                        <Sun className="h-7 w-7 text-amber-500" />
                        <h1 className="text-xl font-bold ml-2 text-slate-800">Technician Panel</h1>
                    </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                    </button>
                </header>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <nav className="md:hidden bg-white shadow-lg">
                        <div className="flex flex-col space-y-2 p-4">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className={`flex items-center p-3 rounded-lg font-semibold transition-colors ${pathname === link.href ? 'bg-indigo-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    <link.icon className="mr-3 h-5 w-5"/>{link.label}
                                </Link>
                            ))}
                            <button onClick={handleLogout} className="w-full mt-4 bg-slate-100 text-slate-600 py-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center font-semibold">
                                <LogOut className="mr-2 h-5 w-5"/> Logout
                            </button>
                        </div>
                    </nav>
                )}

                <main className="flex-1 p-4 sm:p-6 md:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}