"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { Star } from 'lucide-react'; // Star icon import karein
const StarRating = ({ rating }) => {
    if (!rating) return <span className="text-slate-400 text-xs">Not Rated</span>;
    return (
        <div className="flex items-center">
            {[...Array(rating)].map((_, i) => <Star key={i} size={16} className="text-amber-400" fill="currentColor"/>)}
            {[...Array(5 - rating)].map((_, i) => <Star key={i} size={16} className="text-slate-300"/>)}
        </div>
    );
};
export default function HistoryPage() {
    const [allBookings, setAllBookings] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchBookings = async () => {
            try {
                const res = await axios.get('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
                setAllBookings(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                toast.error("Could not fetch booking history.");
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = allBookings.filter(booking => {
        if (filter === 'All') return true;
        return booking.status === filter;
    });

    const statuses = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Booking History</h2>
            
            {/* Filter Buttons */}
            <div className="mb-4 flex space-x-2">
                {statuses.map(status => (
                    <button 
                        key={status} 
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === status ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3">Customer</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Job Status</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Technician</th>
                                <th className="p-3">Rating</th> {/* New Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => (
                            <tr key={booking._id} className="border-b">
                                <td className="p-3">{booking.customer?.name}</td>
                                <td className="p-3">{booking.serviceType}</td>
                                <td className="p-3">{booking.status}</td>
                                <td className="p-3">{booking.payment.status}</td>
                                <td className="p-3">{booking.technician?.name || 'N/A'}</td>
                                <td className="p-3"><StarRating rating={booking.rating} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}