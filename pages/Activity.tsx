//import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { Layout } from '../components/Layout';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
 import.meta.env.VITE_GEMINI_API_KEY as string
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
// Screen 1: Log Activity
export const LogActivity: React.FC = () => {
     const navigate = useNavigate();
     const [activityType, setActivityType] = useState<'aerobic' | 'resistance'>('aerobic');
     const [duration, setDuration] = useState(30);
     const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');

     const handleSave = () => {
        const userName = localStorage.getItem('userName') || 'User';
        const newActivity = {
            id: Date.now(),
            type: activityType,
            duration: duration,
            intensity: intensity,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            timestamp: new Date().toISOString()
        };

        const storageKey = `activities_${userName}`;
        const existingActivities = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedActivities = [newActivity, ...existingActivities];
        localStorage.setItem(storageKey, JSON.stringify(updatedActivities));

        navigate('/activity-history');
     };

     return (
        <Layout>
            <div className="w-full max-w-[800px] mx-auto px-6 py-10 md:py-16">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Log Your Activity</h1>
                    <p className="text-[#618689] dark:text-[#9aabbd] text-base font-normal max-w-xl">Keep track of your movement to support your kidney health.</p>
                </div>
                <div className="bg-white dark:bg-[#152325] rounded-xl shadow-sm border border-[#e6e8eb] dark:border-[#223032] p-6 md:p-10 space-y-8">
                    <div className="space-y-3">
                        <label className="block text-sm font-bold uppercase tracking-wide opacity-80">Activity Type</label>
                        <div className="flex bg-[#f0f4f4] dark:bg-[#1a2c2e] p-1.5 rounded-lg w-full md:w-fit">
                            <button 
                                onClick={() => setActivityType('aerobic')}
                                className={`px-8 py-2.5 rounded-md text-sm font-medium transition-all text-center flex items-center gap-2 ${activityType === 'aerobic' ? 'bg-white dark:bg-[#25383a] shadow-sm text-[#111718] dark:text-white' : 'text-[#618689] hover:text-[#111718] dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-lg">directions_run</span> Aerobic
                            </button>
                            <button 
                                onClick={() => setActivityType('resistance')}
                                className={`px-8 py-2.5 rounded-md text-sm font-medium transition-all text-center flex items-center gap-2 ${activityType === 'resistance' ? 'bg-white dark:bg-[#25383a] shadow-sm text-[#111718] dark:text-white' : 'text-[#618689] hover:text-[#111718] dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-lg">fitness_center</span> Resistance
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold uppercase tracking-wide opacity-80">Duration</label>
                        <div className="flex items-center gap-2 bg-[#f0f4f4] dark:bg-[#1a2c2e] px-3 py-2 rounded-lg w-fit">
                            <span className="font-bold text-lg">{duration}</span> <span className="text-sm text-[#618689]">min</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="120" 
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full accent-primary" 
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-bold uppercase tracking-wide opacity-80">How did it feel?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button 
                                onClick={() => setIntensity('light')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${intensity === 'light' ? 'border-2 border-primary bg-primary/5' : 'border-[#dbe5e6] dark:border-[#2a3c3e] hover:border-primary'}`}
                            >
                                <span className="text-2xl mb-2">🙂</span>
                                <span className={`font-medium text-sm ${intensity === 'light' ? 'font-bold' : ''}`}>Light</span>
                            </button>
                            <button 
                                onClick={() => setIntensity('moderate')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${intensity === 'moderate' ? 'border-2 border-primary bg-primary/5' : 'border-[#dbe5e6] dark:border-[#2a3c3e] hover:border-primary'}`}
                            >
                                <span className="text-2xl mb-2">😅</span>
                                <span className={`font-bold text-sm ${intensity === 'moderate' ? 'font-bold' : ''}`}>Moderate</span>
                            </button>
                             <button 
                                onClick={() => setIntensity('vigorous')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${intensity === 'vigorous' ? 'border-2 border-primary bg-primary/5' : 'border-[#dbe5e6] dark:border-[#2a3c3e] hover:border-primary'}`}
                             >
                                <span className="text-2xl mb-2">🥵</span>
                                <span className={`font-medium text-sm ${intensity === 'vigorous' ? 'font-bold' : ''}`}>Vigorous</span>
                            </button>
                        </div>
                    </div>
                    <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
                        <button onClick={handleSave} className="w-full md:w-auto flex-1 bg-primary hover:bg-[#20c5d5] text-[#102022] font-bold text-base py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">save</span> Save Activity
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// New Screen: Activity History
export const ActivityHistory: React.FC = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const userName = localStorage.getItem('userName') || 'User';
        const storageKey = `activities_${userName}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setActivities(stored);
    }, []);

    // Calendar Helper Functions
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Group activities by day for the current month view
    const activitiesByDay = activities.reduce((acc, activity) => {
        let d;
        if (activity.timestamp) {
            d = new Date(activity.timestamp);
        } else if (activity.date) {
            // Fallback for dates stored as strings without year
            d = new Date(`${activity.date}, ${new Date().getFullYear()}`);
        }

        if (d && !isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            if (!acc[day]) acc[day] = [];
            acc[day].push(activity);
        }
        return acc;
    }, {} as Record<number, any[]>);

    return (
        <Layout>
            <div className="w-full max-w-[800px] mx-auto px-6 py-10">
                 <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black">Activity History</h1>
                    <button onClick={() => navigate('/log-activity')} className="text-primary font-bold flex items-center gap-1 hover:text-primary-dark transition-colors">
                        <span className="material-symbols-outlined">add_circle</span> Log New
                    </button>
                 </div>

                 {/* Calendar Component */}
                 <div className="bg-white dark:bg-[#152325] p-6 rounded-xl shadow-sm border border-[#e6e8eb] dark:border-[#223032] mb-8 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-[#618689] dark:text-white">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <h2 className="text-lg font-bold text-[#111718] dark:text-white">{monthNames[month]} {year}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-[#618689] dark:text-white">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-[#618689] uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells for padding start of month */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10 md:h-12"></div>
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayActivities = activitiesByDay[day] || [];
                            const hasAerobic = dayActivities.some(a => a.type === 'aerobic');
                            const hasResistance = dayActivities.some(a => a.type === 'resistance');
                            
                            // Check if this date is today
                            const now = new Date();
                            const isToday = now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;

                            return (
                                <div key={day} className={`h-10 md:h-12 rounded-lg flex flex-col items-center justify-center relative transition-colors ${isToday ? 'bg-primary/10 font-bold text-primary-dark dark:text-primary ring-1 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-[#111718] dark:text-gray-300'}`}>
                                    <span className="text-sm">{day}</span>
                                    <div className="flex gap-1 mt-1 h-1.5">
                                        {hasAerobic && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                        {hasResistance && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[#f0f4f4] dark:border-[#2a3c3e] text-xs font-medium text-[#618689]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>Aerobic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span>Resistance</span>
                        </div>
                    </div>
                 </div>

                 <h2 className="text-xl font-bold mb-4">All Entries</h2>

                 {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center">
                        <span className="material-symbols-outlined text-6xl mb-4 text-[#dbe5e6] dark:text-[#2a3c3e]">history</span>
                        <h3 className="text-xl font-bold mb-2">No activities yet</h3>
                        <p className="max-w-xs">Start logging your daily movements to see your progress here.</p>
                    </div>
                 ) : (
                    <div className="flex flex-col gap-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="bg-white dark:bg-[#152325] p-6 rounded-xl shadow-sm border border-[#e6e8eb] dark:border-[#223032] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'aerobic' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' : 'bg-orange-50 text-orange-500 dark:bg-orange-900/20'}`}>
                                        <span className="material-symbols-outlined text-2xl">{activity.type === 'aerobic' ? 'directions_run' : 'fitness_center'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg capitalize text-[#111718] dark:text-white">{activity.type} Activity</h3>
                                        <div className="flex items-center gap-2 text-sm text-[#618689]">
                                            <span>{activity.date}</span>
                                            <span>•</span>
                                            <span className="capitalize flex items-center gap-1">
                                                {activity.intensity === 'vigorous' && '🔥'}
                                                {activity.intensity} Intensity
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[#f0f4f4] dark:border-[#2a3c3e] pt-4 sm:pt-0">
                                    <div className="text-right">
                                        <span className="block text-2xl font-black text-[#111718] dark:text-white">{activity.duration}</span>
                                        <span className="text-xs text-[#618689] uppercase font-bold tracking-wider">Minutes</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
                 
                 <div className="mt-8 flex justify-center">
                    <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-transparent border-2 border-[#e6e8eb] dark:border-[#2a3c3e] text-[#618689] dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Return to Dashboard
                    </button>
                 </div>
            </div>
        </Layout>
    );
}

// Screen 5: Med Reflection Survey
export const MedReflection: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4 md:px-20 lg:px-40 flex flex-col items-center">
            <div className="w-full max-w-[800px] flex flex-col gap-8">
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                    <div className="p-8 pb-4 border-b border-border-light/50">
                        <h1 className="text-3xl font-black mb-2">How are things going with your medications?</h1>
                        <p className="text-text-secondary text-lg">Weekly Reflection: Step 1 of 3</p>
                    </div>
                    <div className="flex flex-col gap-10 p-8">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-bold">In the last week, how often did you take your medication on time?</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 rounded-lg border p-4 bg-primary/5 border-primary">
                                    <span className="material-symbols-outlined text-primary">radio_button_checked</span>
                                    <span className="font-medium">Always</span>
                                </div>
                                 <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <span className="material-symbols-outlined text-gray-400">radio_button_unchecked</span>
                                    <span className="font-medium">Most of the time</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                             <button onClick={() => navigate('/reflection-summary')} className="px-8 py-3 rounded-lg bg-primary font-bold shadow-sm flex items-center gap-2">
                                <span>Submit Reflection</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Screen 4: Reflection Summary (Success)
export const ReflectionSummary: React.FC = () => {
     const navigate = useNavigate();
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[640px] flex flex-col gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary text-[48px]">check_circle</span>
                    </div>
                    <h2 className="text-[32px] font-bold">Reflection Complete!</h2>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#2a3b3d]">
                    <p className="text-xl font-medium">"Great job reflecting on your routine! Self-awareness is a key step in health management."</p>
                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <span className="font-medium">Medication</span>
                            <span className="text-emerald-600 font-bold">Taken</span>
                        </div>
                         <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                            <span className="font-medium">Activity</span>
                            <span className="text-blue-600 font-bold">Logged</span>
                        </div>
                    </div>
                </div>
                 <button onClick={() => navigate('/dashboard')} className="w-full bg-primary text-[#0e3f45] text-lg font-bold py-4 px-6 rounded-xl shadow-lg">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};