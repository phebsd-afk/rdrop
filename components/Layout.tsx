import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChatBot } from './ChatBot';

interface NavLinkProps {
    to: string;
    icon: string;
    label: string;
    active: boolean;
    onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active, onClick }) => {
    const baseClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group";
    const activeClass = "bg-primary/10 dark:bg-primary/20 text-[#102022] dark:text-primary";
    const inactiveClass = "text-[#618689] dark:text-[#9aabbd] hover:bg-[#f0f4f4] dark:hover:bg-[#1a2c2e]";
    
    return (
        <Link to={to} onClick={onClick} className={`${baseClass} ${active ? activeClass : inactiveClass}`}>
            <span className={`material-symbols-outlined ${active ? 'fill-1 text-primary' : 'group-hover:text-[#111718] dark:group-hover:text-white'}`}>{icon}</span>
            <span className={`text-sm font-medium ${active ? 'font-bold text-[#111718] dark:text-white' : 'group-hover:text-[#111718] dark:group-hover:text-white'}`}>{label}</span>
        </Link>
    );
};

const NAV_ITEMS = [
    { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { to: "/log-activity", icon: "edit_calendar", label: "Log Activity" },
    { to: "/medications", icon: "medication", label: "Medications" },
    { to: "/analytics", icon: "analytics", label: "Analytics" },
    { to: "/achievements", icon: "trophy", label: "Achievements" },
    { to: "/hub", icon: "school", label: "Education" },
    { to: "/settings", icon: "settings", label: "Settings" },
    { to: "/notifications", icon: "notifications", label: "Messages" },
];

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "", onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const p = location.pathname;
    const userName = localStorage.getItem('userName') || 'Alex Morgan';

    const handleLogout = () => {
        localStorage.removeItem('userName');
        if (onClose) onClose();
        navigate('/');
    };

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-[#152325] p-6 justify-between ${className}`}>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-[#102022]">
                            <span className="material-symbols-outlined text-xl font-bold">water_drop</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#111718] dark:text-white">Rain Drop</span>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="md:hidden p-1 text-text-muted hover:text-text-main dark:hover:text-white transition-colors">
                             <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    )}
                </div>
                
                <nav className="flex flex-col gap-2">
                    {NAV_ITEMS.map(item => (
                        <NavLink 
                            key={item.to}
                            to={item.to} 
                            icon={item.icon} 
                            label={item.label} 
                            active={p === item.to}
                            onClick={onClose}
                        />
                    ))}
                </nav>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
                 <Link 
                    to="/admin" 
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[#618689] dark:text-[#9aabbd] hover:bg-gray-100 dark:hover:bg-[#1a2c2e] group w-full text-left"
                >
                    <span className="material-symbols-outlined group-hover:text-[#111718] dark:group-hover:text-white">admin_panel_settings</span>
                    <span className="text-sm font-medium group-hover:text-[#111718] dark:group-hover:text-white">Admin Panel</span>
                </Link>

                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[#618689] dark:text-[#9aabbd] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 group w-full text-left"
                >
                    <span className="material-symbols-outlined group-hover:text-red-600 dark:group-hover:text-red-400">logout</span>
                    <span className="text-sm font-medium">Log Out</span>
                </button>

                <div className="flex items-center gap-3 px-3 py-2 border-t border-[#e6e8eb] dark:border-[#223032] pt-4">
                    <Link to="/profile" onClick={onClose} className="flex items-center gap-3 w-full">
                        <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <span className="material-symbols-outlined text-gray-400 w-full h-full flex items-center justify-center text-lg">person</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-[#111718] dark:text-white truncate max-w-[140px]">{userName}</p>
                            <p className="text-xs text-[#618689]">Patient</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

interface LayoutProps {
    children: React.ReactNode;
    hideSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideSidebar = false }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-text-main dark:text-white">
            {/* Desktop Sidebar */}
            {!hideSidebar && (
                <div className="hidden md:flex w-64 shrink-0 border-r border-[#e6e8eb] dark:border-[#223032] sticky top-0 h-full">
                    <Sidebar />
                </div>
            )}

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                 {/* Mobile Header */}
                 {!hideSidebar && (
                    <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-[#152325] border-b border-[#e6e8eb] dark:border-[#223032] shrink-0">
                        <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-[#102022]">
                                <span className="material-symbols-outlined text-xl font-bold">water_drop</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-[#111718] dark:text-white">Rain Drop</span>
                        </div>
                        <button 
                            onClick={() => setMobileMenuOpen(true)} 
                            className="p-1 rounded-md text-[#111718] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl">menu</span>
                        </button>
                    </header>
                 )}

                <main className="flex-1 h-full overflow-y-auto relative">
                    {children}
                </main>

                {/* Mobile Menu Overlay */}
                {!hideSidebar && mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div 
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                            onClick={() => setMobileMenuOpen(false)}
                        ></div>
                        <div className="absolute inset-y-0 left-0 w-[85%] max-w-[300px] shadow-xl transform transition-transform animate-slide-in">
                            <Sidebar onClose={() => setMobileMenuOpen(false)} />
                        </div>
                    </div>
                )}
                
                <ChatBot />
            </div>
        </div>
    );
};