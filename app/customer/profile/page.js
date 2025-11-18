"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUserData = async () => {
            try {
                const { data } = await axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` }});
                setFormData({ name: data.data.name, email: data.data.email, phone: data.data.profile?.phone || '' });
            } catch (error) {
                toast.error("Could not fetch profile data.");
            }
        };
        if (token) fetchUserData();
        else router.push('/login');
    }, [router]);

    const handleInfoChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleInfoUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const loadingToast = toast.loading("Updating profile...");
        try {
            await axios.put('/api/users/profile', formData, { headers: { Authorization: `Bearer ${token}` }});
            toast.success("Profile updated successfully!", { id: loadingToast });
        } catch (error) {
            toast.error("Update failed.", { id: loadingToast });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const loadingToast = toast.loading("Changing password...");
        try {
            await axios.put('/api/users/profile', passwordData, { headers: { Authorization: `Bearer ${token}` }});
            toast.success("Password changed successfully!", { id: loadingToast });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password.", { id: loadingToast });
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700">Update Information</h3>
                    <form onSubmit={handleInfoUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInfoChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-semibold">Save Changes</button>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-semibold">Update Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
}