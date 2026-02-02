
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { IMAGES } from '../constants';
import { LiveVoiceAssistant } from '../components/LiveVoiceAssistant';

// Screen 12: Dashboard
export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Alex';
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [weeklyStats, setWeeklyStats] = useState({ minutes: 0, sessions: 0 });
    const [tipIndex, setTipIndex] = useState(0);
    const [showVoice, setShowVoice] = useState(false);
    
    // Goals configuration
    const GOALS = { minutes: 150, sessions: 5 };

    const TIPS = [
        {
            title: "Stay Hydrated",
            content: "Drinking water helps your kidneys remove waste. Aim for small sips throughout the day.",
            image: IMAGES.tip
        },
        {
            title: "Limit Sodium",
            content: "Excess salt increases blood pressure. Try seasoning with herbs, lemon, or spices instead.",
            image: IMAGES.articleHero
        },
        {
            title: "Sun Safety",
            content: "Immunosuppressants increase skin sensitivity. Wear SPF 30+ and protective clothing outdoors.",
            image: IMAGES.hubHero
        },
         {
            title: "Medication Timing",
            content: "Taking meds at the same time daily maintains stable blood levels and prevents rejection.",
            image: IMAGES.goal
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 10000); // Rotate every 10 seconds
        return () => clearInterval(interval);
    }, [TIPS.length]);

    const currentTip = TIPS[tipIndex];

    useEffect(() => {
        const userKey = localStorage.getItem('userName') || 'User';
        const storageKey = `activities_${userKey}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setRecentActivities(stored.slice(0, 3)); // Get top 3

        // Calculate Weekly Stats
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const currentWeekActivities = stored.filter((a: any) => {
            // Handle both timestamp (ISO) and old date formats if necessary
            let aDate;
            if (a.timestamp) {
                aDate = new Date(a.timestamp);
            } else {
                aDate = new Date(a.date);
                if (isNaN(aDate.getTime())) aDate = new Date(); // fallback
            }
            return aDate >= startOfWeek;
        });

        const totalMinutes = currentWeekActivities.reduce((acc: number, curr: any) => acc + (parseInt(curr.duration) || 0), 0);
        
        setWeeklyStats({
            minutes: totalMinutes,
            sessions: currentWeekActivities.length
        });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userName');
        navigate('/');
    };

    // Calculate progress for circle (based on minutes)
    const progressPercent = Math.min(100, Math.round((weeklyStats.minutes / GOALS.minutes) * 100));
    const circumference = 264;
    const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

    return (
        <Layout>
            {showVoice && <LiveVoiceAssistant onClose={() => setShowVoice(false)} />}
            
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                        <div className="flex items-center justify-between w-full sm:w-auto">
                            <div>
                                <h2 className="text-3xl font-bold">Good Morning, {userName}</h2>
                                <p className="text-text-muted dark:text-gray-400 mt-1">Keep up the good work on your recovery journey.</p>
                            </div>
                             {/* Mobile Logout - Visible only on small screens */}
                            <button 
                                onClick={handleLogout}
                                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 text-text-muted hover:text-red-500 transition-colors"
                            >
                                 <span className="material-symbols-outlined">logout</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4 self-start sm:self-center">
                            <button
                                onClick={() => setShowVoice(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#102022] font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover hover:scale-105 transition-all group"
                            >
                                <span className="material-symbols-outlined group-hover:animate-pulse">mic</span>
                                <span>Talk to CareBot</span>
                            </button>
                            
                            <div className="hidden sm:block text-sm text-right">
                                <p className="font-semibold">Today</p>
                                <p className="text-text-muted">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                     <div className="col-span-1 lg:col-span-2 flex flex-col rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Weekly Activity Goal</h3>
                            <button onClick={() => navigate('/analytics')} className="text-sm font-medium text-primary-dark dark:text-primary">View Report</button>
                        </div>
                        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-around">
                            <div className="relative flex h-48 w-48 items-center justify-center shrink-0 mx-auto md:mx-0">
                                 <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                    <circle className="stroke-slate-100 dark:stroke-white/10" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
                                    <circle 
                                        className="stroke-primary transition-all duration-1000 ease-out" 
                                        cx="50" 
                                        cy="50" 
                                        fill="transparent" 
                                        r="42" 
                                        strokeDasharray={circumference} 
                                        strokeDashoffset={strokeDashoffset} 
                                        strokeLinecap="round" 
                                        strokeWidth="8"
                                    ></circle>
                                </svg>
                                <div className="absolute flex flex-col items-center text-center">
                                    <span className="text-3xl font-bold">{progressPercent}%</span>
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col justify-center gap-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 rounded-xl bg-background-light dark:bg-white/5 p-4">
                                         <p className="text-2xl font-bold">{weeklyStats.sessions} <span className="text-sm font-normal text-text-muted">/ {GOALS.sessions}</span></p>
                                         <p className="text-xs text-text-muted uppercase">Sessions</p>
                                    </div>
                                    <div className="flex-1 rounded-xl bg-background-light dark:bg-white/5 p-4">
                                         <p className="text-2xl font-bold">{weeklyStats.minutes} <span className="text-sm font-normal text-text-muted">/ {GOALS.minutes}</span></p>
                                         <p className="text-xs text-text-muted uppercase">Minutes</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/log-activity')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-text-main shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Log New Activity
                                </button>
                            </div>
                        </div>
                     </div>

                     <div className="col-span-1 flex flex-col rounded-2xl bg-gradient-to-br from-[#E0F7FA] to-white p-6 shadow-sm dark:from-[#153e45] dark:to-surface-dark border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                             <button onClick={() => setTipIndex((prev) => (prev + 1) % TIPS.length)} className="p-1 rounded-full bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 transition-colors">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                        <h3 className="font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-yellow-500">lightbulb</span> Daily Health Tip</h3>
                        
                        <div className="flex-1 flex flex-col animate-[fadeIn_0.5s_ease-in-out]" key={tipIndex}>
                            <h4 className="text-lg font-semibold mb-2">{currentTip.title}</h4>
                            <p className="text-sm text-text-muted dark:text-gray-300 mb-4 flex-1">{currentTip.content}</p>
                            <div className="h-32 w-full rounded-lg bg-cover bg-center transition-all duration-500 shadow-sm" style={{backgroundImage: `url("${currentTip.image}")`}}></div>
                        </div>

                        <div className="flex justify-center gap-1 mt-4">
                            {TIPS.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setTipIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === tipIndex ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`}
                                ></button>
                            ))}
                        </div>
                     </div>
                </div>

                 <div className="mt-6">
                    <div className="rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Recent Activities</h3>
                            <button onClick={() => navigate('/activity-history')} className="text-sm font-medium text-primary-dark dark:text-primary">View All</button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {recentActivities.length > 0 ? (
                                recentActivities.map(activity => (
                                    <div key={activity.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/5 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                             <div className={`flex h-12 w-12 items-center justify-center rounded-full ${activity.type === 'aerobic' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/20' : 'bg-orange-50 text-orange-500 dark:bg-orange-500/20'}`}>
                                                <span className="material-symbols-outlined">{activity.type === 'aerobic' ? 'directions_run' : 'fitness_center'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold capitalize">{activity.type} Activity</p>
                                                <p className="text-xs text-text-muted">{activity.date} • <span className="capitalize">{activity.intensity}</span></p>
                                            </div>
                                        </div>
                                        <p className="font-bold">{activity.duration} min</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-text-muted">
                                    <p>No activities logged yet.</p>
                                    <button onClick={() => navigate('/log-activity')} className="text-primary font-bold text-sm mt-2">Log your first activity</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Screen 14: Analytics
export const Analytics: React.FC = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState<{label: string, value: number, height: number}[]>([]);
    const [stats, setStats] = useState({ totalMinutes: 0, sessions: 0, avgDuration: 0 });

    useEffect(() => {
        const userName = localStorage.getItem('userName') || 'User';
        const storageKey = `activities_${userName}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Calculate last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        const data = last7Days.map(date => {
            const dayMinutes = stored.reduce((acc: number, curr: any) => {
                let actDate;
                if (curr.timestamp) {
                    actDate = new Date(curr.timestamp);
                } else {
                    const currentYear = new Date().getFullYear();
                    actDate = new Date(`${curr.date}, ${currentYear}`);
                }
                
                if (!isNaN(actDate.getTime()) && 
                    actDate.getDate() === date.getDate() && 
                    actDate.getMonth() === date.getMonth() && 
                    actDate.getFullYear() === date.getFullYear()) {
                    return acc + (parseInt(curr.duration) || 0);
                }
                return acc;
            }, 0);

            return {
                label: days[date.getDay()],
                value: dayMinutes,
                height: 0
            };
        });

        const maxValue = Math.max(...data.map(d => d.value), 60); 
        const finalData = data.map(d => ({
            ...d,
            height: Math.round((d.value / maxValue) * 100)
        }));

        setChartData(finalData);

        const totalMin = stored.reduce((acc: number, curr: any) => acc + (parseInt(curr.duration) || 0), 0);
        
        setStats({
            totalMinutes: totalMin,
            sessions: stored.length,
            avgDuration: stored.length ? Math.round(totalMin / stored.length) : 0
        });

    }, []);

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black">Activity Analytics</h1>
                        <p className="text-text-muted mt-1">Visualize your progress over time.</p>
                    </div>
                     <button onClick={() => navigate('/log-activity')} className="flex items-center gap-2 px-4 py-2 bg-primary text-[#102022] font-bold rounded-lg shadow-sm hover:bg-primary-hover transition-colors text-sm">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Log Activity
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#152325] p-6 rounded-xl shadow-sm border border-border-light dark:border-[#223032]">
                        <div className="flex items-center gap-4 mb-2">
                             <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                            <span className="text-sm font-bold text-text-muted uppercase">Total Time</span>
                        </div>
                        <p className="text-3xl font-black">{stats.totalMinutes} <span className="text-sm font-normal text-text-muted">mins</span></p>
                    </div>
                    <div className="bg-white dark:bg-[#152325] p-6 rounded-xl shadow-sm border border-border-light dark:border-[#223032]">
                        <div className="flex items-center gap-4 mb-2">
                             <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">fitness_center</span>
                            </div>
                            <span className="text-sm font-bold text-text-muted uppercase">Total Sessions</span>
                        </div>
                        <p className="text-3xl font-black">{stats.sessions}</p>
                    </div>
                    <div className="bg-white dark:bg-[#152325] p-6 rounded-xl shadow-sm border border-border-light dark:border-[#223032]">
                         <div className="flex items-center gap-4 mb-2">
                             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">avg_pace</span>
                            </div>
                            <span className="text-sm font-bold text-text-muted uppercase">Avg Duration</span>
                        </div>
                        <p className="text-3xl font-black">{stats.avgDuration} <span className="text-sm font-normal text-text-muted">mins/session</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#152325] p-8 rounded-2xl shadow-sm border border-border-light dark:border-[#223032]">
                    <h3 className="text-xl font-bold mb-8">Last 7 Days Activity</h3>
                    
                    <div className="h-64 w-full flex items-end justify-between gap-2 md:gap-4">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                                <div className="relative w-full max-w-[60px] flex items-end justify-center h-full bg-gray-50 dark:bg-white/5 rounded-t-xl overflow-hidden">
                                     <div 
                                        className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 relative min-h-[4px]"
                                        style={{ height: `${d.height}%` }}
                                     >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                                            {d.value} min
                                        </div>
                                     </div>
                                </div>
                                <span className="text-xs font-bold text-text-muted uppercase">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
