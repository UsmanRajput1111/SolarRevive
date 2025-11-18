"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AssignJobPage() {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const bookingsRes = await axios.get('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
            // Sirf 'Pending' status wali bookings filter karein
            setPendingBookings(bookingsRes.data.data.filter(b => b.status === 'Pending'));
            
            const techsRes = await axios.get('/api/users/technicians', { headers: { Authorization: `Bearer ${token}` } });
            setTechnicians(techsRes.data.data);
        } catch (error) {
            toast.error("Could not fetch data.");
        }
    };

    const handleAssignTechnician = async () => {
        if (!selectedTechnician) {
            toast.error("Please select a technician.");
            return;
        }
        const token = localStorage.getItem('token');
        const loadingToast = toast.loading("Assigning technician...");
        try {
            await axios.put(`/api/bookings/${selectedBooking._id}`, 
                { technician: selectedTechnician },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Technician assigned successfully!", { id: loadingToast });
            setSelectedBooking(null);
            setSelectedTechnician('');
            fetchData(); // Refresh data
        } catch (error) {
            toast.error("Assignment failed.", { id: loadingToast });
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Assign Jobs to Technicians</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                {/* Table for pending bookings */}
                <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3">Customer</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingBookings.map(booking => (
                            <tr key={booking._id} className="border-b">
                                <td className="p-3">{booking.customer?.name}</td>
                                <td className="p-3">{booking.serviceType}</td>
                                <td className="p-3">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <button onClick={() => setSelectedBooking(booking)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
                                        Assign
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Assign Technician Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4">Assign Technician</h3>
                        <p className="mb-4">For: <span className="font-semibold">{selectedBooking.customer?.name}</span>&apos;s booking</p>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Select Technician</label>
                            <p className="text-sm text-gray-600 mb-2">Service Type: <span className="font-semibold">{selectedBooking.serviceType}</span></p>
                            <select 
                                value={selectedTechnician} 
                                onChange={(e) => setSelectedTechnician(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Choose a technician</option>
                                {[...technicians]
                                    .sort((a, b) => {
                                        const aExpertise = a.profile?.expertise || 'Not Applicable';
                                        const bExpertise = b.profile?.expertise || 'Not Applicable';
                                        const aMatch = aExpertise === selectedBooking.serviceType;
                                        const bMatch = bExpertise === selectedBooking.serviceType;
                                        // Matching technicians first
                                        if (aMatch && !bMatch) return -1;
                                        if (!aMatch && bMatch) return 1;
                                        // Then sort alphabetically by name
                                        return a.name.localeCompare(b.name);
                                    })
                                    .map(tech => {
                                        const expertise = tech.profile?.expertise || 'Not Applicable';
                                        const isMatch = expertise === selectedBooking.serviceType;
                                        return (
                                            <option 
                                                key={tech._id} 
                                                value={tech._id}
                                            >
                                                {tech.name} - {expertise} {isMatch ? '✓' : ''}
                                            </option>
                                        );
                                    })}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Technicians with matching expertise are shown first with a ✓. You can assign any technician.
                            </p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-600">Cancel</button>
                            <button onClick={handleAssignTechnician} className="bg-blue-500 text-white px-6 py-2 rounded-lg">Confirm Assignment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}