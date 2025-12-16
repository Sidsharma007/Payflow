import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Merchant: Demo Merchant</span>
                        <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                    </div>
                </header>

                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'checkout' && <Checkout />}
                {activeTab === 'transactions' && <Dashboard />} {/* Reusing dashboard list for now */}
                {activeTab === 'settings' && <div className="p-8 text-slate-500">Settings Page (Coming Soon)</div>}
            </main>
        </div>
    )
}

export default App
