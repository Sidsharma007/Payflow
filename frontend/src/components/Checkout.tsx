import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Checkout = () => {
    const [amount, setAmount] = useState(500);
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
    const [result, setResult] = useState<any>(null);

    const handlePayment = async (method: 'UPI' | 'CARD') => {
        setStatus('PROCESSING');
        try {
            // 1. Initiate
            const initRes = await axios.post('/api/v1/pay/initiate?api_key=sk_test_12345', {
                order_id: `ord_${Date.now()}`,
                amount: Number(amount),
                currency: "INR",
                method: method,
                description: `Payment via ${method}`
            });

            const txnId = initRes.data.id;

            // 2. Poll for Status (Mocking the client polling)
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                const statusRes = await axios.get(`/api/v1/pay/status/${txnId}`);
                const currentStatus = statusRes.data.status;

                if (currentStatus === 'SUCCESS' || currentStatus === 'FAILED') {
                    clearInterval(poll);
                    setStatus(currentStatus);
                    setResult(statusRes.data);
                }

                if (attempts > 20) {
                    clearInterval(poll);
                    setStatus('FAILED');
                    setResult({ failure_reason: "Timeout" });
                }
            }, 1000);

        } catch (error) {
            console.error(error);
            setStatus('FAILED');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4">Simulate Checkout</h2>

            {status === 'IDLE' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (INR)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg p-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handlePayment('UPI')}
                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
                        >
                            <Smartphone size={20} /> Pay with UPI
                        </button>
                        <button
                            onClick={() => handlePayment('CARD')}
                            className="flex items-center justify-center gap-2 bg-slate-800 text-white p-3 rounded-lg hover:bg-slate-900"
                        >
                            <CreditCard size={20} /> Pay with Card
                        </button>
                    </div>
                </div>
            )}

            {status === 'PROCESSING' && (
                <div className="text-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-slate-600">Processing Payment...</p>
                </div>
            )}

            {status === 'SUCCESS' && (
                <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-green-700">Payment Successful</h3>
                    <p className="text-slate-500 text-sm">Txn ID: {result?.id}</p>
                    <button onClick={() => setStatus('IDLE')} className="mt-4 text-indigo-600 hover:underline">Make another payment</button>
                </div>
            )}

            {status === 'FAILED' && (
                <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-red-700">Payment Failed</h3>
                    <p className="text-red-600 text-sm">{result?.failure_reason || "Unknown Error"}</p>
                    <button onClick={() => setStatus('IDLE')} className="mt-4 text-indigo-600 hover:underline">Try Again</button>
                </div>
            )}
        </div>
    );
};

export default Checkout;
