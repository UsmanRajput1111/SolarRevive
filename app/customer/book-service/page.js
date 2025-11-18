"use client";
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { 
    Calendar, 
    MapPin, 
    CreditCard, 
    Sparkles, 
    Wrench, 
    Layers, 
    Coins,
    Clock,
    AlertCircle,
    CheckCircle,
    Smartphone,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { calculateAmountDue, SERVICE_PRICING, SUBSCRIPTION_PRICE } from '../../../utils/pricing';

const SERVICE_INFO = {
    'Solar Panel Cleaning': {
        icon: Sparkles,
        description: 'Professional cleaning to maximize solar panel efficiency'
    },
    'Solar Panel Installation': {
        icon: Wrench,
        description: 'Expert installation with warranty and support'
    },
    'Solar Foundation': {
        icon: Layers,
        description: 'Complete foundation work for long-term stability'
    }
};

export default function BookServicePage() {
    const [serviceType, setServiceType] = useState('Solar Panel Cleaning');
    const [address, setAddress] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [wantsSubscription, setWantsSubscription] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateError, setDateError] = useState('');

    const router = useRouter();

    const allowSubscription = serviceType === 'Solar Panel Cleaning';

    const totalAmount = useMemo(
        () => calculateAmountDue(serviceType, wantsSubscription),
        [serviceType, wantsSubscription]
    );
    const formattedAmount = useMemo(() => `Rs ${totalAmount.toLocaleString()}`, [totalAmount]);

    useEffect(() => {
        if (!allowSubscription && wantsSubscription) {
            setWantsSubscription(false);
        }
    }, [allowSubscription, wantsSubscription]);

    const getMinDateTime = () => {
        const now = new Date();
        const oneMinuteLater = new Date(now.getTime() + 60000);
        return oneMinuteLater.toISOString().slice(0, 16);
    };

    const validateDate = (dateValue) => {
        if (!dateValue) {
            setDateError('');
            return;
        }

        const selectedDate = new Date(dateValue);
        const now = new Date();
        const oneMinuteFromNow = new Date(now.getTime() + 60000);

        if (selectedDate.getTime() <= oneMinuteFromNow.getTime()) {
            setDateError('Please select a date and time in the future. Past dates and times are not allowed.');
        } else {
            setDateError('');
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Validate booking date
        if (!bookingDate) {
            toast.error('Please select a date and time.');
            return;
        }

        const selectedDate = new Date(bookingDate);
        const now = new Date();
        const oneMinuteFromNow = new Date(now.getTime() + 60000);
        
        if (selectedDate.getTime() <= oneMinuteFromNow.getTime()) {
            toast.error('Please select a date and time in the future. Past dates and times are not allowed.');
            setDateError('Please select a date and time in the future. Past dates and times are not allowed.');
            return;
        }

        // Validate payment method is selected
        if (!paymentMethod) {
            toast.error('Please select a payment method to proceed.');
            return;
        }

        // Validate transaction ID for Easypaisa/Jazzcash
        if (paymentMethod === 'Easypaisa/Jazzcash' && !transactionId.trim()) {
            toast.error('Please enter your Transaction ID (TID) for Easypaisa/Jazzcash payment.');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Creating booking...');
        const token = localStorage.getItem('token');
        try {
            const bookingPayload = {
                serviceType,
                address: address.trim(),
                bookingDate,
                wantsSubscription: allowSubscription && wantsSubscription,
                payment: {
                    method: paymentMethod,
                    status: 'Pending',
                    ...(paymentMethod === 'Easypaisa/Jazzcash' && transactionId.trim() && { paymentId: transactionId.trim() })
                }
            };
            const { data } = await axios.post('/api/bookings',
                bookingPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (paymentMethod === 'Cash on Delivery') {
                toast.success('Booking created successfully! You will pay on delivery.', { id: loadingToast });
            } else {
                toast.success('Booking created! Admin will verify your payment shortly.', { id: loadingToast });
            }
            
            setTimeout(() => {
                router.push('/customer/dashboard');
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed', { id: loadingToast });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
                <Toaster position="top-center" />
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 lg:p-12">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Book Your Service</h1>
                            <p className="text-slate-600">Schedule your solar service appointment</p>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            {/* Service Type Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    Service Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.keys(SERVICE_PRICING).map((service) => {
                                        const ServiceIcon = SERVICE_INFO[service].icon;
                                        const isSelected = serviceType === service;
                                        return (
                                            <button
                                                key={service}
                                                type="button"
                                                onClick={() => setServiceType(service)}
                                                className={`p-5 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                                        <ServiceIcon className={`h-6 w-6 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-semibold mb-1 ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                            {service}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mb-2">
                                                            {SERVICE_INFO[service].description}
                                                        </p>
                                                        <p className="text-sm font-bold text-indigo-600">
                                                            Rs {SERVICE_PRICING[service].toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm mb-1">Total Amount</p>
                                        <p className="text-3xl font-bold">{formattedAmount}</p>
                                        {wantsSubscription && (
                                            <p className="text-xs text-indigo-200 mt-2">
                                                Includes Annual Subscription (Rs {SUBSCRIPTION_PRICE.toLocaleString()})
                                            </p>
                                        )}
                                    </div>
                                    <Coins className="h-12 w-12 text-indigo-200 opacity-50" />
                                </div>
                            </div>

                            {/* Address Input */}
                            <div>
                                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                    Service Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                    placeholder="Enter your complete service address (street, area, city, postal code)"
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Date & Time Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                    Preferred Date & Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={bookingDate}
                                        onChange={(e) => {
                                            setBookingDate(e.target.value);
                                            validateDate(e.target.value);
                                        }}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                            dateError ? 'border-red-500' : 'border-slate-300'
                                        }`}
                                        required
                                        min={getMinDateTime()}
                                    />
                                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                </div>
                                {dateError && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {dateError}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    <AlertCircle className="h-3 w-3 text-amber-600" />
                                    <span className="text-amber-800">Past dates and times are not allowed. Please select a future date and time (minimum 1 minute from now).</span>
                                </p>
                            </div>

                            {/* Subscription Option */}
                            {allowSubscription && (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="subscription"
                                            checked={wantsSubscription}
                                            onChange={(e) => setWantsSubscription(e.target.checked)}
                                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                                        />
                                        <label htmlFor="subscription" className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-slate-900">
                                                    Annual Cleaning Subscription
                                                </span>
                                                <span className="font-bold text-indigo-600">
                                                    Rs {SUBSCRIPTION_PRICE.toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Get unlimited solar panel cleaning for the entire year at a discounted rate!
                                            </p>
                                            <p className="text-xs text-amber-700 mt-2 font-medium">
                                                ⚠️ Only available for Solar Panel Cleaning service
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Payment Method Selection */}
                            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
                                    <CreditCard className="h-5 w-5 text-indigo-600" />
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
                                    <p className="text-sm text-slate-600">
                                        Total payable: <span className="font-bold text-slate-900 text-lg">{formattedAmount}</span>
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {/* Easypaisa/Jazzcash */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Easypaisa/Jazzcash')}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                            paymentMethod === 'Easypaisa/Jazzcash'
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${paymentMethod === 'Easypaisa/Jazzcash' ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                    <Smartphone className={`h-5 w-5 ${paymentMethod === 'Easypaisa/Jazzcash' ? 'text-green-600' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${paymentMethod === 'Easypaisa/Jazzcash' ? 'text-green-700' : 'text-slate-700'}`}>
                                                        Easypaisa / Jazzcash
                                                    </p>
                                                    <p className="text-sm text-slate-500">Pay online instantly</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'Easypaisa/Jazzcash' && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </button>

                                    {paymentMethod === 'Easypaisa/Jazzcash' && (
                                        <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                                            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm font-semibold text-slate-800 mb-2">Payment Instructions:</p>
                                                <p className="text-sm text-slate-700 mb-2">
                                                    Please send <strong className="text-green-700 text-lg">{formattedAmount}</strong> to
                                                </p>
                                                <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg">
                                                    <Smartphone className="h-4 w-4 text-green-700" />
                                                    <span className="text-xl font-bold text-green-900">0311-1155500</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-3">
                                                    After sending, enter the Transaction ID (TID/TRX ID) you receive via SMS:
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Transaction ID (TID) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                    placeholder="Enter Transaction ID (e.g., 1234567890)"
                                                    required={paymentMethod === 'Easypaisa/Jazzcash'}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Cash on Delivery */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod('Cash on Delivery');
                                            setTransactionId('');
                                        }}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                            paymentMethod === 'Cash on Delivery'
                                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                                : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${paymentMethod === 'Cash on Delivery' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                                                    <Coins className={`h-5 w-5 ${paymentMethod === 'Cash on Delivery' ? 'text-orange-600' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${paymentMethod === 'Cash on Delivery' ? 'text-orange-700' : 'text-slate-700'}`}>
                                                        Cash on Delivery
                                                    </p>
                                                    <p className="text-sm text-slate-500">Pay when service is completed</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'Cash on Delivery' && (
                                                <CheckCircle className="h-5 w-5 text-orange-600" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Booking...
                                    </>
                                ) : (
                                    <>
                                        Create Booking
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>

                            {/* Footer Note */}
                            <p className="text-center text-sm text-slate-500">
                                By confirming, you agree to our terms and conditions. Our team will contact you soon!
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
