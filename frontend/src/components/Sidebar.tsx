import React from 'react';
import { LayoutDashboard, CreditCard, Settings, Activity } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'checkout', label: 'Simulator', icon: CreditCard },
        { id: 'transactions', label: 'Transactions', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">P</div>
                <h1 className="text-xl font-bold">PayFlow</h1>
            </div>
            <nav className="space-y-1">
                {menu.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === item.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
