"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ApprovePaymentsPage() {
    const [pendingPayments, setPendingPayments] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const bookingsRes = await axios.get('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
            
            // ✅ Show both Easypaisa/Jazzcash and Cash on Delivery if status = Pending
            // Also show COD payments that were confirmed by technician (status = Paid but received by technician)
            const filteredPayments = bookingsRes.data.data.filter(b => 
                b.payment &&
                (
                    // Pending payments (online or COD)
                    ((b.payment.method === 'Easypaisa/Jazzcash' || b.payment.method === 'Cash on Delivery') &&
                     b.payment.status === 'Pending')
                    ||
                    // COD payments confirmed by technician (needs admin awareness)
                    (b.payment.method === 'Cash on Delivery' && 
                     b.payment.status === 'Paid' && 
                     b.payment.paymentReceivedBy === 'technician')
                )
            );

            setPendingPayments(filteredPayments);
        } catch (error) {
            toast.error("Could not fetch payment data.");
        }
    };

    const handleApprovePayment = async (bookingId) => {
        const token = localStorage.getItem('token');
        const loadingToast = toast.loading("Approving payment...");
        try {
            await axios.put(
                `/api/bookings/${bookingId}`,
                { 
                    payment: { 
                        status: 'Paid',
                        paymentReceivedBy: 'admin'
                    } 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Payment approved!", { id: loadingToast });
            fetchData(); // Refresh list
        } catch (error) {
            toast.error("Approval failed.", { id: loadingToast });
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">Payment Management</h2>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>📋 Note:</strong> Payments highlighted in orange are COD payments confirmed by technicians. 
                    These payments have been received and do not require approval, but are shown here for your records.
                </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                {pendingPayments.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3">Customer</th>
                                <th className="p-3">Payment Method</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Transaction ID</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Received By</th>
                                <th className="p-3">Booking Date</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPayments.map(booking => {
                                const isTechnicianConfirmed = booking.payment?.paymentReceivedBy === 'technician' && booking.payment?.status === 'Paid';
                                const isPending = booking.payment?.status === 'Pending';
                                return (
                                <tr key={booking._id} className={`border-b hover:bg-gray-50 ${isTechnicianConfirmed ? 'bg-orange-50' : ''}`}>
                                    <td className="p-3">{booking.customer?.name || "N/A"}</td>
                                    <td className="p-3">{booking.payment?.method || "N/A"}</td>
                                    <td className="p-3">
                                        {booking.amountDue ? (
                                            <span className="font-bold text-purple-700">
                                                Rs {booking.amountDue.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-3">{booking.payment?.paymentId || "-"}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {booking.payment?.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {isTechnicianConfirmed ? (
                                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                Technician ({booking.technician?.name || 'N/A'})
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-3">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        {isPending ? (
                                            <button
                                                onClick={() => handleApprovePayment(booking._id)}
                                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                        ) : isTechnicianConfirmed ? (
                                            <div className="text-sm">
                                                <p className="text-green-700 font-semibold">✓ Payment Received</p>
                                                <p className="text-xs text-gray-600">
                                                    {booking.payment?.paymentReceivedAt ? 
                                                        new Date(booking.payment.paymentReceivedAt).toLocaleString() : 
                                                        'Confirmed by Technician'
                                                    }
                                                </p>
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600 text-center">No pending payments to approve.</p>
                )}
            </div>
        </div>
    );
}
