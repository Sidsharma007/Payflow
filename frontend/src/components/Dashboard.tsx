import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await axios.get('/api/v1/dashboard/stats?api_key=sk_test_12345');
                setStats(statsRes.data);
                const txnsRes = await axios.get('/api/v1/dashboard/transactions?api_key=sk_test_12345');
                setTransactions(txnsRes.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000); // Live poll
        return () => clearInterval(interval);
    }, []);

    if (!stats) return <div className="p-8">Loading Analytics...</div>;

    const data = [
        { name: 'UPI', value: 400 },
        { name: 'Card', value: 300 },
        { name: 'NetBanking', value: 300 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Volume</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total_volume}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Success Rate (TSR)</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.success_rate}%</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${stats.success_rate > 90 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {stats.success_rate > 90 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Alerts</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.active_alerts}</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
                    <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Amount</th>
                                <th className="px-3 py-2">Method</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(txn => (
                                <tr key={txn.id} className="border-b">
                                    <td className="px-3 py-2 font-medium">#{txn.id}</td>
                                    <td className="px-3 py-2">₹{txn.amount}</td>
                                    <td className="px-3 py-2">{txn.method}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                txn.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
