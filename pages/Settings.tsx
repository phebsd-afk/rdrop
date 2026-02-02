import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { IMAGES } from '../constants';
import { useNavigate } from 'react-router-dom';

// Screen 3: Settings
export const Settings: React.FC = () => {
    const userName = localStorage.getItem('userName') || 'phebsd';
    
    // Initialize frequency from localStorage, default to 'daily'
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>(() => {
        return (localStorage.getItem('notificationFrequency') as 'daily' | 'weekly') || 'daily';
    });

    const handleFrequencyChange = (newFreq: 'daily' | 'weekly') => {
        setFrequency(newFreq);
        localStorage.setItem('notificationFrequency', newFreq);
    };

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-[1000px] mx-auto flex flex-col gap-6">
                
                {/* Profile Header Card */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white dark:bg-[#152325] p-8 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                     <div className="h-24 w-24 rounded-full bg-[#E0F2F1] dark:bg-[#1A2C2E] flex items-center justify-center shrink-0 overflow-hidden border-4 border-white dark:border-[#152325] shadow-sm">
                        <img src={IMAGES.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2">
                        <h2 className="text-2xl font-bold text-[#111718] dark:text-white">Hello, {userName}</h2>
                        <p className="text-[#618689] font-medium mt-1 text-base">Manage your profile, health data settings, and preferences.</p>
                     </div>
                </div>
                
                {/* Preferences Section */}
                <section className="bg-white dark:bg-[#152325] rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                     <div className="px-8 py-5 border-b border-border-light dark:border-border-dark">
                        <h3 className="font-bold text-lg text-[#111718] dark:text-white">Preferences</h3>
                     </div>
                     <div className="p-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <h4 className="font-bold text-base text-[#111718] dark:text-white">Notification Frequency</h4>
                                <p className="text-sm text-[#618689] mt-1">How often do you want reports?</p>
                            </div>
                            <div className="flex bg-[#f3f4f6] dark:bg-[#1e2e30] rounded-lg p-1">
                                <button 
                                    onClick={() => handleFrequencyChange('daily')}
                                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${frequency === 'daily' ? 'bg-white dark:bg-[#2A3C3E] shadow-sm text-[#111718] dark:text-white' : 'text-[#618689] hover:text-[#111718] dark:hover:text-white'}`}
                                >
                                    Daily
                                </button>
                                <button 
                                    onClick={() => handleFrequencyChange('weekly')}
                                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${frequency === 'weekly' ? 'bg-white dark:bg-[#2A3C3E] shadow-sm text-[#111718] dark:text-white' : 'text-[#618689] hover:text-[#111718] dark:hover:text-white'}`}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>
                     </div>
                </section>
            </div>
        </Layout>
    );
};

// Types for Notification System
interface NotificationItem {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
    style: 'blue' | 'slate' | 'green' | 'red';
    content: string;
    detail: string;
    isVisible: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        title: "{goal_status_title}",
        subtitle: "{goal_status_subtitle}",
        icon: 'directions_walk',
        style: 'blue',
        content: "You have completed {weeklyMinutes} minutes so far, which is {percentage}% of your weekly goal. Keep pushing—consistent activity is key to post-transplant health!",
        detail: "The World Health Organization and transplant specialists recommend at least 150 minutes of moderate-intensity aerobic activity per week. This level of activity helps control blood pressure, improves cardiovascular health, and can even help reduce the side effects of immunosuppressant medications like weight gain and bone density loss.",
        isVisible: true
    },
    {
        id: 2,
        title: "Start your journey today",
        subtitle: "Log your first activity to see progress.",
        icon: 'rocket_launch',
        style: 'slate',
        content: "Tracking your activity is the first step to understanding your health patterns. Try logging a simple 10-minute walk to get the ball rolling.",
        detail: "Logging activity consistently allows you to visualize trends over time. Early post-transplant patients who track their activity are 40% more likely to reach their rehabilitation goals within the first 6 months. Tap 'Learn More' to visit the activity logger.",
        isVisible: true
    },
    {
        id: 3,
        title: "Quick Tip: Hydration",
        subtitle: "Water supports your new kidney.",
        icon: 'water_drop',
        style: 'slate',
        content: "Proper hydration helps your kidneys filter waste from your blood. Aim to drink water consistently throughout the day.",
        detail: "Dehydration can concentrate nephrotoxic drugs in your system, potentially harming your graft. Carry a water bottle and aim for clear or light yellow urine as a simple indicator of good hydration status.",
        isVisible: true
    },
    {
        id: 4,
        title: "Medication Review",
        subtitle: "Check your adherence stats.",
        icon: 'medication',
        style: 'slate',
        content: "Reviewing your medication history helps identify patterns. You can view your detailed adherence report in the Analytics tab.",
        detail: "Missing even a single dose of immunosuppressants can increase the risk of rejection. If you are struggling with your schedule, consider using our built-in reminders or speaking with your transplant coordinator about simplified dosing options.",
        isVisible: true
    }
];

// Screen 15: Notifications
export const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [weeklyMinutes, setWeeklyMinutes] = useState(0);
    const [expandedId, setExpandedId] = useState<number | null>(1);
    const [detailsOpen, setDetailsOpen] = useState<Set<number>>(new Set());
    
    // Derived state
    const GOAL = 150;
    const remaining = Math.max(0, GOAL - weeklyMinutes);
    const percentage = Math.min(100, Math.round((weeklyMinutes / GOAL) * 100));

    // Dynamic strings for Goal Status
    const goalStatusTitle = percentage >= 100 ? "You've reached your weekly goal!" : "You're on your way to your goal!";
    const goalStatusSubtitle = percentage >= 100 ? "Great job maintaining your health!" : `${remaining} mins remaining this week.`;

    useEffect(() => {
        // Load Notifications
        const stored = localStorage.getItem('app_notifications');
        if (stored) {
            setNotifications(JSON.parse(stored));
        } else {
            setNotifications(DEFAULT_NOTIFICATIONS);
            localStorage.setItem('app_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        }

        // Calculate Weekly Minutes
        const userName = localStorage.getItem('userName') || 'User';
        const storageKey = `activities_${userName}`;
        const storedActivities = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const currentWeekActivities = storedActivities.filter((a: any) => {
            let aDate;
            if (a.timestamp) {
                aDate = new Date(a.timestamp);
            } else {
                aDate = new Date(a.date);
                if (isNaN(aDate.getTime())) aDate = new Date();
            }
            return aDate >= startOfWeek;
        });

        const totalMinutes = currentWeekActivities.reduce((acc: number, curr: any) => acc + (parseInt(curr.duration) || 0), 0);
        setWeeklyMinutes(totalMinutes);
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleDetail = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setDetailsOpen(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Helper to process placeholders
    const processText = (text: string) => {
        return text
            .replace('{weeklyMinutes}', weeklyMinutes.toString())
            .replace('{percentage}', percentage.toString())
            .replace('{remaining}', remaining.toString())
            .replace('{goal_status_title}', goalStatusTitle)
            .replace('{goal_status_subtitle}', goalStatusSubtitle);
    };

    // Style Mappings
    const getStyleClasses = (style: string) => {
        switch (style) {
            case 'blue':
                return {
                    color: 'text-primary-dark dark:text-primary',
                    bgColor: 'bg-[#E0F7FA] dark:bg-primary/20',
                    borderColor: 'border-l-4 border-l-primary'
                };
            case 'green':
                return {
                    color: 'text-emerald-700 dark:text-emerald-400',
                    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                    borderColor: 'border-l-4 border-l-emerald-500'
                };
            case 'red':
                return {
                    color: 'text-red-700 dark:text-red-400',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-l-4 border-l-red-500'
                };
            case 'slate':
            default:
                return {
                    color: 'text-slate-500',
                    bgColor: 'bg-slate-100 dark:bg-slate-800',
                    borderColor: 'border-l-4 border-l-transparent'
                };
        }
    };

    const visibleNotifications = notifications.filter(n => n.isVisible);

    return (
         <Layout>
            <div className="max-w-[800px] mx-auto w-full min-h-full bg-white dark:bg-[#1A2C2E] shadow-sm border-x border-border-light dark:border-border-dark">
                <header className="sticky top-0 z-10 bg-white dark:bg-[#1A2C2E] flex items-center gap-4 border-b border-border-light dark:border-border-dark px-6 py-6 md:px-8">
                    <span className="material-symbols-outlined text-3xl text-text-main dark:text-white">notifications_active</span>
                    <div>
                        <h2 className="text-2xl font-bold text-text-main dark:text-white">Message Center</h2>
                        <p className="text-sm text-text-muted mt-0.5">{visibleNotifications.length} Active Notifications</p>
                    </div>
                </header>
                
                <div className="p-6 md:p-8 flex flex-col gap-4 bg-[#f8f9fa] dark:bg-[#152325] min-h-[calc(100vh-100px)]">
                    {visibleNotifications.map((note) => {
                        const isExpanded = expandedId === note.id;
                        const isDetailOpen = detailsOpen.has(note.id);
                        const style = getStyleClasses(note.style);

                        // Process dynamic text
                        const title = processText(note.title);
                        const subtitle = processText(note.subtitle);
                        const content = processText(note.content);
                        const detail = processText(note.detail);

                        return (
                            <div 
                                key={note.id} 
                                className={`bg-white dark:bg-[#1A2C2E] rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? `shadow-md ${style.borderColor}` : 'border-border-light dark:border-border-dark hover:border-primary/50 border-l-4 border-l-transparent'}`}
                            >
                                <div 
                                    className="flex items-start gap-4 p-5 cursor-pointer relative"
                                    onClick={() => toggleExpand(note.id)}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.bgColor} ${style.color}`}>
                                        <span className="material-symbols-outlined text-2xl">{note.icon}</span>
                                    </div>
                                    
                                    <div className="flex-1 pt-0.5">
                                        <h3 className="font-bold text-lg text-text-main dark:text-white leading-tight">{title}</h3>
                                        <p className="text-sm text-text-muted mt-1 font-medium">{subtitle}</p>
                                    </div>

                                    <button className={`transform transition-transform duration-200 text-text-muted mt-2 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 pb-6 pt-0 animate-[fadeIn_0.2s_ease-out]">
                                        <hr className="border-border-light dark:border-border-dark mb-4 mx-1" />
                                        <p className="text-text-main dark:text-gray-300 leading-relaxed px-1 text-base">
                                            {content}
                                        </p>
                                        
                                        <div className="mt-4">
                                            <button 
                                                onClick={(e) => toggleDetail(e, note.id)}
                                                className="text-primary font-bold text-sm hover:text-primary-dark transition-colors flex items-center gap-1"
                                            >
                                                {isDetailOpen ? 'Show Less' : 'Learn More'} 
                                                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isDetailOpen ? 'rotate-180' : ''}`}>chevron_right</span>
                                            </button>

                                            {isDetailOpen && (
                                                <div className="mt-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-sm text-text-secondary dark:text-gray-400 italic animate-[fadeIn_0.3s_ease-out]">
                                                    {detail}
                                                    {/* Specific Logic for "Log Activity" link if title mentions "journey" or similar - simplified to check if id matches original 2 */}
                                                    {note.id === 2 && (
                                                        <button 
                                                            onClick={() => navigate('/log-activity')}
                                                            className="mt-3 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary-dark dark:text-primary rounded-lg font-bold transition-colors"
                                                        >
                                                            Go to Log Activity
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {visibleNotifications.length === 0 && (
                        <div className="text-center py-10 text-text-muted">
                            <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                            <p>No new messages.</p>
                        </div>
                    )}
                </div>
            </div>
         </Layout>
     );
};