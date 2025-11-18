"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Users, Book } from 'lucide-react';

export default function AdminDashboard() {
  const [latestBookings, setLatestBookings] = useState([]);
  const [stats, setStats] = useState({ customers: 0, technicians: 0, totalBookings: 0 });
  const router = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const bookingsRes = await axios.get('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
      const sortedBookings = bookingsRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLatestBookings(sortedBookings.slice(0, 5));
      
      const allUsersRes = await axios.get('/api/users/all', { headers: { Authorization: `Bearer ${token}` } });
      const customersCount = allUsersRes.data.data.filter(u => u.role === 'customer').length;
      const techniciansCount = allUsersRes.data.data.filter(u => u.role === 'technician').length;
      setStats({ customers: customersCount, technicians: techniciansCount, totalBookings: sortedBookings.length });

    } catch (error) {
      toast.error("Could not fetch dashboard data.");
    }
  };

  return (
    <div>
        <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-gray-500 flex items-center"><Users className="mr-2"/> Total Customers</h4>
                <p className="text-3xl font-bold">{stats.customers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-gray-500 flex items-center"><Users className="mr-2"/> Total Technicians</h4>
                <p className="text-3xl font-bold">{stats.technicians}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-gray-500 flex items-center"><Book className="mr-2"/> Total Bookings</h4>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">Latest 5 Bookings</h3>
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3">Customer</th>
                            <th className="p-3">Subscription</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Job Status</th>
                            <th className="p-3">Payment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestBookings.map(booking => (
                            <tr key={booking._id} className="border-b">
                                <td className="p-3">{booking.customer?.name || 'N/A'}</td>
                                <td className="p-3">
                                    {/* Updated logic to check the booking itself */}
                                    {booking.isSubscriptionBooking ? 
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Yes</span> : 
                                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">No</span>
                                    }
                                </td>
                                <td className="p-3">{booking.serviceType}</td>
                                <td className="p-3">{booking.status}</td>
                                <td className="p-3">{booking.payment.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}