import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';

interface Medication {
    id: string;
    name: string;
    dosage: string;
    time: string;
    reminderEnabled: boolean;
    icon?: string;
}

interface MedLog {
    medId: string;
    date: string; // YYYY-MM-DD
    takenAt: string; // ISO String
}

const MED_ICONS = [
    'medication', 
    'pill', 
    'vaccine', 
    'water_drop', 
    'healing', 
    'local_pharmacy', 
    'monitor_heart', 
    'medical_services',
    'bloodtype', 
    'nutrition'
];

export const MedicationTracker: React.FC = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [logs, setLogs] = useState<MedLog[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
    
    // New/Edit Med Form State
    const [newMedName, setNewMedName] = useState('');
    const [newMedDosage, setNewMedDosage] = useState('');
    const [newMedTime, setNewMedTime] = useState('08:00');
    const [newMedReminder, setNewMedReminder] = useState(true);
    const [newMedIcon, setNewMedIcon] = useState('medication');

    const userName = localStorage.getItem('userName') || 'User';

    useEffect(() => {
        const storedMeds = localStorage.getItem(`medications_${userName}`);
        const storedLogs = localStorage.getItem(`med_logs_${userName}`);
        if (storedMeds) setMedications(JSON.parse(storedMeds));
        if (storedLogs) setLogs(JSON.parse(storedLogs));
    }, [userName]);

    // Notification Checker
    useEffect(() => {
        if (!("Notification" in window)) return;

        const checkInterval = setInterval(() => {
            const now = new Date();
            const currentHour = String(now.getHours()).padStart(2, '0');
            const currentMinute = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${currentHour}:${currentMinute}`;
            const todayDate = now.toDateString();

            medications.forEach(med => {
                if (med.reminderEnabled && med.time === currentTime) {
                    const lastNotifiedKey = `last_notified_${med.id}`;
                    const lastNotified = localStorage.getItem(lastNotifiedKey);
                    
                    // Only notify if we haven't notified for this specific time today
                    if (lastNotified !== todayDate + currentTime) {
                        if (Notification.permission === "granted") {
                            new Notification(`Time to take ${med.name}`, {
                                body: `It's ${med.time}. Dosage: ${med.dosage || 'As prescribed'}.`,
                                icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKn52738O1XFYcCg3CurcoUoXIAxAx1i0VENCdaDqFkdCCI5kIDTARKaI6N5EIDp757J3ZCqJ_nQyC4il3vavWef6FJ3PLRf1QIcAJ4sbuYOcxKqKycRsz1rS6jz1IOABLVGfaxCgYbe5GiVW6vWEaxuK7XFT9kbtnyhsvgsxUy_YWq3gelHbGfCMz5FOlITKK3CqGI6RS9RdyTEjLn9x8YGKD5EGalOpwZd8BPuujBiL3pvJuWFLv1_uZIR6siX7KD9eSnuFFtp9b' // Using hero image as placeholder icon
                            });
                        }
                        localStorage.setItem(lastNotifiedKey, todayDate + currentTime);
                    }
                }
            });
        }, 2000); // Check every 2 seconds

        return () => clearInterval(checkInterval);
    }, [medications]);

    const saveMeds = (meds: Medication[]) => {
        setMedications(meds);
        localStorage.setItem(`medications_${userName}`, JSON.stringify(meds));
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return false;
        }
        if (Notification.permission === "granted") {
            return true;
        }
        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }
        return false;
    };

    const openAddModal = () => {
        setEditingId(null);
        setNewMedName('');
        setNewMedDosage('');
        setNewMedTime('08:00');
        setNewMedReminder(true);
        setNewMedIcon('medication');
        setShowAddModal(true);
    };

    const openEditModal = (med: Medication, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(med.id);
        setNewMedName(med.name);
        setNewMedDosage(med.dosage || '');
        setNewMedTime(med.time);
        setNewMedReminder(med.reminderEnabled);
        setNewMedIcon(med.icon || 'medication');
        setShowAddModal(true);
    };

    const handleSaveMedication = async () => {
        if (!newMedName || !newMedTime) return;

        let reminderEnabled = newMedReminder;
        if (reminderEnabled) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                alert("Notifications permission denied. Reminders will not be sent.");
                reminderEnabled = false;
            }
        }

        if (editingId) {
            // Update existing medication
            const updatedMeds = medications.map(med => {
                if (med.id === editingId) {
                    return {
                        ...med,
                        name: newMedName,
                        dosage: newMedDosage,
                        time: newMedTime,
                        reminderEnabled,
                        icon: newMedIcon
                    };
                }
                return med;
            });
            saveMeds(updatedMeds);
        } else {
            // Add new medication
            const newMed: Medication = {
                id: Date.now().toString(),
                name: newMedName,
                dosage: newMedDosage,
                time: newMedTime,
                reminderEnabled,
                icon: newMedIcon
            };
            saveMeds([...medications, newMed]);
        }

        setShowAddModal(false);
        setEditingId(null);
        setNewMedName('');
        setNewMedDosage('');
        setNewMedTime('08:00');
        setNewMedReminder(true);
        setNewMedIcon('medication');
    };

    const handleDeleteMedication = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedMeds = medications.filter(m => m.id !== id);
        saveMeds(updatedMeds);
        
        // Also remove logs for this medication using functional update
        setLogs(currentLogs => {
             const updatedLogs = currentLogs.filter(l => l.medId !== id);
             localStorage.setItem(`med_logs_${userName}`, JSON.stringify(updatedLogs));
             return updatedLogs;
        });
    };

    // Helper to get local date string YYYY-MM-DD
    const getLocalTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper to get friendly date labels (Today, Yesterday)
    const getFriendlyDate = (dateStr: string) => {
        const todayStr = getLocalTodayString();
        
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const yesterdayStr = `${year}-${month}-${day}`;

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';
        
        try {
            // Parse manual date components to avoid timezone issues
            const [y, m, dt] = dateStr.split('-').map(Number);
            const dateObj = new Date(y, m - 1, dt);
            return dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const toggleTaken = (medId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const today = getLocalTodayString();
        
        setLogs(currentLogs => {
            const existingLogIndex = currentLogs.findIndex(l => l.medId === medId && l.date === today);
            let updatedLogs;

            if (existingLogIndex >= 0) {
                // Untake: Remove the log entry
                updatedLogs = [...currentLogs];
                updatedLogs.splice(existingLogIndex, 1);
            } else {
                // Take: Add a new log entry
                const newLog: MedLog = {
                    medId,
                    date: today,
                    takenAt: new Date().toISOString()
                };
                updatedLogs = [...currentLogs, newLog];
            }
            
            // Persist to local storage
            localStorage.setItem(`med_logs_${userName}`, JSON.stringify(updatedLogs));
            return updatedLogs;
        });
    };

    const handleTakeAll = () => {
        const today = getLocalTodayString();
        const nowIso = new Date().toISOString();
        
        setLogs(currentLogs => {
            const newLogs: MedLog[] = [];
            
            medications.forEach(med => {
                // Check if already taken today
                const isTaken = currentLogs.some(l => l.medId === med.id && l.date === today);
                if (!isTaken) {
                    newLogs.push({
                        medId: med.id,
                        date: today,
                        takenAt: nowIso
                    });
                }
            });

            if (newLogs.length > 0) {
                const updatedLogs = [...currentLogs, ...newLogs];
                localStorage.setItem(`med_logs_${userName}`, JSON.stringify(updatedLogs));
                return updatedLogs;
            }
            return currentLogs;
        });
    };

    const sortedMeds = [...medications].sort((a, b) => a.time.localeCompare(b.time));
    
    // Stats for Progress
    const totalDoses = medications.length;
    const takenDoses = medications.filter(m => logs.some(l => l.medId === m.id && l.date === getLocalTodayString())).length;
    const progressPercent = totalDoses === 0 ? 0 : Math.round((takenDoses / totalDoses) * 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    const hasUntakenMeds = medications.length > 0 && takenDoses < totalDoses;

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-[1000px] mx-auto relative">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black">Medication Tracker</h1>
                        <p className="text-text-muted mt-1">Manage your schedule and stay on track.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {hasUntakenMeds && (
                            <button 
                                onClick={handleTakeAll}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                            >
                                <span className="material-symbols-outlined">done_all</span>
                                Take All Today
                            </button>
                        )}
                        <button 
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-[#102022] font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Add Medication
                        </button>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-8 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-y-auto">
                            <button 
                                onClick={() => setShowAddModal(false)} 
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-text-muted transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Medication' : 'Add New Medication'}</h2>
                            
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-text-muted">Medication Name</label>
                                    <input 
                                        type="text" 
                                        value={newMedName}
                                        onChange={e => setNewMedName(e.target.value)}
                                        placeholder="e.g. Tacrolimus"
                                        className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-text-muted">Dosage (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={newMedDosage}
                                        onChange={e => setNewMedDosage(e.target.value)}
                                        placeholder="e.g. 100mg"
                                        className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-text-muted">Reminder Time</label>
                                    <input 
                                        type="time" 
                                        value={newMedTime}
                                        onChange={e => setNewMedTime(e.target.value)}
                                        className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-text-muted">Icon</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {MED_ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => setNewMedIcon(icon)}
                                                className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                                                    newMedIcon === icon 
                                                    ? 'bg-primary/20 border-primary text-primary-dark dark:text-primary' 
                                                    : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 text-text-muted'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined">{icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reminder Toggle */}
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Push Notifications</span>
                                        <span className="text-xs text-text-muted">Receive a reminder on this device</span>
                                    </div>
                                    <button 
                                        onClick={() => setNewMedReminder(!newMedReminder)}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${newMedReminder ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${newMedReminder ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <button 
                                    onClick={handleSaveMedication}
                                    className="mt-4 w-full py-4 bg-primary text-[#102022] font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-colors"
                                >
                                    {editingId ? 'Save Changes' : 'Add Medication'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#152325] p-6 rounded-2xl shadow-sm border border-border-light dark:border-[#223032] sticky top-8">
                            <h3 className="font-bold text-lg mb-6">Today's Progress</h3>
                            <div className="flex flex-col items-center">
                                <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-gray-100 dark:text-white/5"
                                        />
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            className="text-primary transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-4xl font-black">{progressPercent}%</span>
                                        <span className="text-xs font-bold text-text-muted uppercase">Complete</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{takenDoses} / {totalDoses}</p>
                                    <p className="text-text-muted text-sm">Medications Taken</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule List */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {medications.length === 0 ? (
                            <div className="bg-white dark:bg-[#152325] p-12 rounded-2xl border border-dashed border-border-light dark:border-[#223032] flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 text-text-muted">
                                    <span className="material-symbols-outlined text-3xl">medication_liquid</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">No medications added</h3>
                                <p className="text-text-muted max-w-xs mb-6">Add your daily medications to start tracking your adherence.</p>
                                <button onClick={openAddModal} className="text-primary font-bold hover:underline">Add your first medication</button>
                            </div>
                        ) : (
                            sortedMeds.map(med => {
                                const todayStr = getLocalTodayString();
                                const isTaken = logs.some(l => l.medId === med.id && l.date === todayStr);
                                const logEntry = logs.find(l => l.medId === med.id && l.date === todayStr);
                                const takenTime = logEntry ? new Date(logEntry.takenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null;
                                const isExpanded = expandedMedId === med.id;

                                // Filter logs for this medication
                                const medHistory = logs
                                    .filter(l => l.medId === med.id)
                                    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
                                    .slice(0, 10); // Show last 10 entries
                                
                                const totalTracked = logs.filter(l => l.medId === med.id).length;

                                return (
                                    <div key={med.id} className={`group bg-white dark:bg-[#152325] rounded-xl shadow-sm border transition-all duration-300 flex flex-col overflow-hidden ${isTaken ? 'border-primary/30 bg-primary/5' : 'border-border-light dark:border-[#223032] hover:border-primary/50'}`}>
                                        
                                        {/* Main Card Content */}
                                        <div className="p-5 flex items-center justify-between gap-4">
                                            <div 
                                                className="flex items-center gap-4 md:gap-6 flex-1 cursor-pointer"
                                                onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                                            >
                                                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 border ${isTaken ? 'bg-white dark:bg-surface-dark border-primary text-primary' : 'bg-gray-50 dark:bg-white/5 border-transparent text-text-muted'}`}>
                                                    {med.icon ? (
                                                        <span className="material-symbols-outlined text-2xl">{med.icon}</span>
                                                    ) : (
                                                        <span className="text-xs font-bold uppercase tracking-wider">{med.time}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold text-text-muted dark:text-gray-400 border border-border-light dark:border-white/10 px-2 py-0.5 rounded-md">{med.time}</span>
                                                        <h4 className={`text-lg font-bold ${isTaken ? 'text-primary-dark dark:text-primary line-through opacity-70' : 'text-text-main dark:text-white'}`}>
                                                            {med.name}
                                                        </h4>
                                                        {med.dosage && (
                                                            <span className={`text-sm font-normal ${isTaken ? 'text-primary-dark/70 dark:text-primary/70' : 'text-text-muted'}`}>
                                                                ({med.dosage})
                                                            </span>
                                                        )}
                                                        <span className={`material-symbols-outlined text-text-muted text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            expand_more
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {isTaken && <p className="text-sm text-text-muted">Taken at {takenTime}</p>}
                                                        {med.reminderEnabled && !isTaken && (
                                                            <div className="flex items-center gap-1 text-primary text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                                                <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                                                                <span>Reminder On</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={(e) => toggleTaken(med.id, e)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${
                                                        isTaken 
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400' 
                                                            : 'bg-primary text-[#102022] hover:bg-primary-hover shadow-primary/20 hover:scale-105'
                                                    }`}
                                                    title={isTaken ? "Click to undo" : "Mark as taken"}
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        {isTaken ? 'check_circle' : 'check'}
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        {isTaken ? 'Taken' : 'Take'}
                                                    </span>
                                                </button>
                                                
                                                <button 
                                                    onClick={(e) => openEditModal(med, e)}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit Medication"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>

                                                <button 
                                                    onClick={(e) => handleDeleteMedication(med.id, e)}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Medication"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* History View */}
                                        {isExpanded && (
                                            <div className="border-t border-border-light dark:border-[#223032] bg-gray-50 dark:bg-black/20 p-5 animate-[fadeIn_0.2s_ease-out]">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-bold text-xs uppercase text-text-muted flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">history</span>
                                                        History
                                                    </h5>
                                                    <span className="text-xs text-text-muted font-medium">Total doses: {totalTracked}</span>
                                                </div>
                                                
                                                {medHistory.length > 0 ? (
                                                    <div className="flex flex-col gap-2">
                                                        {medHistory.map((log, idx) => (
                                                            <div key={`${log.medId}-${log.takenAt}`} className="flex items-center justify-between text-sm py-2 px-3 bg-white dark:bg-surface-dark rounded-lg border border-border-light dark:border-white/5">
                                                                <span className="font-medium text-text-main dark:text-gray-300">
                                                                    {getFriendlyDate(log.date)}
                                                                </span>
                                                                <span className="text-text-muted flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                                                    {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-text-muted italic">No history recorded yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};