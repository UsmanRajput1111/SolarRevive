"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TechniciansPage() {
    const [technicians, setTechnicians] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users/all', { headers: { Authorization: `Bearer ${token}` } });
                setTechnicians(res.data.data.filter(u => u.role === 'technician'));
            } catch (error) {
                toast.error("Could not fetch technicians.");
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">All Technicians</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Expertise</th> {/* New Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {technicians.map(user => (
                            <tr key={user._id} className="border-b">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.profile?.phone || 'N/A'}</td>
                                <td className="p-3">{user.profile?.expertise || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}