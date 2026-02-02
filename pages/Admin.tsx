
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { GoogleGenAI } from "@google/genai";

// Fix for process is not defined in browser/vite context for TS
declare var process: {
  env: {
    API_KEY: string;
  };
};

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

export const Admin: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState<Omit<NotificationItem, 'id'>>({
        title: '',
        subtitle: '',
        icon: '',
        style: 'slate',
        content: '',
        detail: '',
        isVisible: true
    });

    useEffect(() => {
        const stored = localStorage.getItem('app_notifications');
        if (stored) {
            setNotifications(JSON.parse(stored));
        } else {
            setNotifications(DEFAULT_NOTIFICATIONS);
            localStorage.setItem('app_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        }
    }, []);

    const saveToStorage = (items: NotificationItem[]) => {
        setNotifications(items);
        localStorage.setItem('app_notifications', JSON.stringify(items));
    };

    const toggleVisibility = (id: number) => {
        const updated = notifications.map(n => n.id === id ? { ...n, isVisible: !n.isVisible } : n);
        saveToStorage(updated);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId !== null) {
            const updated = notifications.filter(n => n.id !== deleteId);
            saveToStorage(updated);
            setDeleteId(null);
        }
    };

    const handleEdit = (item: NotificationItem) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            subtitle: item.subtitle,
            icon: item.icon,
            style: item.style,
            content: item.content,
            detail: item.detail,
            isVisible: item.isVisible
        });
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            title: '',
            subtitle: '',
            icon: 'info',
            style: 'slate',
            content: '',
            detail: '',
            isVisible: true
        });
        setIsFormOpen(true);
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Using gemini-3-pro-preview for Search Grounding
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Find a recent, important, or interesting fact/tip specifically related to kidney transplant recovery, renal health maintenance, or immunosuppressant medication management. 
                
                The information should be current and from a reputable health source.

                Return ONLY a JSON object with the following structure:
                {
                    "title": "Short, catchy headline (max 40 chars)",
                    "subtitle": "Very brief summary (max 60 chars)",
                    "content": "One or two sentences summarizing the tip.",
                    "detail": "A detailed explanation (3-4 sentences) providing context and advice.",
                    "icon": "Material Symbol name (e.g., water_drop, healing, science, monitor_heart, restaurant)",
                    "style": "One of: 'blue', 'green', 'slate', 'red'"
                }
                
                Ensure the tone is encouraging and educational for a patient app.`,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            // Extract text and grounding
            let jsonString = response.text || '';
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

            // Clean markdown code blocks if present
            jsonString = jsonString.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();

            const parsedData = JSON.parse(jsonString);

            // Construct Source List from Grounding Metadata
            let sourceText = "";
            if (groundingChunks.length > 0) {
                const uniqueLinks = new Map();
                groundingChunks.forEach((chunk: any) => {
                    if (chunk.web?.uri && chunk.web?.title) {
                        uniqueLinks.set(chunk.web.uri, chunk.web.title);
                    }
                });
                
                if (uniqueLinks.size > 0) {
                    sourceText = "\n\nSources:";
                    uniqueLinks.forEach((title, uri) => {
                        sourceText += `\n• ${title}: ${uri}`;
                    });
                }
            }

            setFormData({
                title: parsedData.title || 'Health Tip',
                subtitle: parsedData.subtitle || 'Daily health insight',
                content: parsedData.content || '',
                detail: (parsedData.detail || '') + sourceText,
                icon: parsedData.icon || 'info',
                style: (parsedData.style as any) || 'slate',
                isVisible: true
            });

        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            // Update
            const updated = notifications.map(n => n.id === editingId ? { ...n, ...formData } : n);
            saveToStorage(updated);
        } else {
            // Create
            const newId = Math.max(0, ...notifications.map(n => n.id)) + 1;
            const newItem: NotificationItem = {
                id: newId,
                ...formData
            };
            saveToStorage([...notifications, newItem]);
        }
        setIsFormOpen(false);
    };

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black">Admin: Message Center</h1>
                        <p className="text-text-muted mt-1">Manage notifications dynamically.</p>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-[#102022] font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Notification
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteId !== null && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-white/10 relative">
                             <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4">
                                <span className="material-symbols-outlined text-2xl">delete</span>
                            </div>
                            <h2 className="text-xl font-bold mb-2">Delete Notification?</h2>
                            <p className="text-text-muted text-sm mb-6">
                                This action cannot be undone. Are you sure you want to remove this notification permanently?
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-border-light dark:border-border-dark font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl p-8 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-y-auto">
                            <button 
                                onClick={() => setIsFormOpen(false)} 
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-text-muted transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Notification' : 'Create Notification'}</h2>
                            
                            {/* AI Generator Button */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-primary-dark dark:text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                        Generate with AI
                                    </h3>
                                    <p className="text-xs text-text-muted mt-1">
                                        Fetch trending renal health tips from the web.
                                    </p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating}
                                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary-dark dark:text-primary font-bold rounded-lg text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait whitespace-nowrap"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                            Searching Web...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">search_spark</span>
                                            Auto-Fill from Web
                                        </>
                                    )}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-text-muted">Title</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none"
                                            placeholder="Notification Title"
                                        />
                                        <p className="text-xs text-text-muted">Supports placeholders: {'{goal_status_title}'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-text-muted">Subtitle</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.subtitle}
                                            onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                            className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none"
                                            placeholder="Short description"
                                        />
                                         <p className="text-xs text-text-muted">Supports placeholders: {'{goal_status_subtitle}'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-text-muted">Icon Name</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.icon}
                                                onChange={e => setFormData({...formData, icon: e.target.value})}
                                                className="flex-1 px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none"
                                                placeholder="e.g. water_drop"
                                            />
                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-lg border border-border-light dark:border-border-dark">
                                                <span className="material-symbols-outlined">{formData.icon || 'help'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-text-muted">Style</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'slate', label: 'Default', className: 'bg-slate-100 text-slate-500 border-transparent' },
                                                { value: 'blue', label: 'Highlight', className: 'bg-[#E0F7FA] text-primary-dark border-primary' },
                                                { value: 'green', label: 'Success', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                                                { value: 'red', label: 'Urgent', className: 'bg-red-50 text-red-500 border-red-200' }
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, style: option.value as any})}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                                        formData.style === option.value 
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                                        : 'border-border-light dark:border-border-dark hover:border-primary/50'
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${option.className}`}>
                                                        <span className="material-symbols-outlined text-xl">{formData.icon || 'palette'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-sm ${formData.style === option.value ? 'text-text-main dark:text-white' : 'text-text-muted'}`}>
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-text-muted">Main Content</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={formData.content}
                                        onChange={e => setFormData({...formData, content: e.target.value})}
                                        className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none resize-none"
                                        placeholder="The main message body..."
                                    />
                                    <p className="text-xs text-text-muted">Supports: {'{weeklyMinutes}, {percentage}, {remaining}'}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-text-muted">Extended Detail (Learn More)</label>
                                    <textarea 
                                        rows={4}
                                        value={formData.detail}
                                        onChange={e => setFormData({...formData, detail: e.target.value})}
                                        className="px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary outline-none resize-none"
                                        placeholder="Additional details shown when expanded..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-border-light dark:border-border-dark cursor-pointer" onClick={() => setFormData({...formData, isVisible: !formData.isVisible})}>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isVisible ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${formData.isVisible ? 'left-7' : 'left-1'}`}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Post to Message Center</span>
                                        <span className="text-xs text-text-muted">If disabled, this will be saved as a draft (hidden).</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 py-3 rounded-xl border border-border-light dark:border-border-dark font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-primary text-[#102022] font-bold shadow-lg hover:bg-primary-hover transition-colors"
                                    >
                                        {editingId ? 'Save Changes' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {notifications.map(note => (
                        <div key={note.id} className={`bg-white dark:bg-[#152325] p-6 rounded-xl shadow-sm border ${note.isVisible ? 'border-border-light dark:border-[#223032]' : 'border-dashed border-gray-300 opacity-70'} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border 
                                    ${note.style === 'blue' ? 'bg-[#E0F7FA] text-primary-dark border-primary' : ''}
                                    ${note.style === 'slate' ? 'bg-slate-100 text-slate-500 border-transparent' : ''}
                                    ${note.style === 'green' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}
                                    ${note.style === 'red' ? 'bg-red-50 text-red-500 border-red-200' : ''}
                                `}>
                                    <span className="material-symbols-outlined">{note.icon}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{note.title}</h3>
                                        {!note.isVisible && <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-600 uppercase">Hidden</span>}
                                    </div>
                                    <p className="text-text-muted text-sm line-clamp-1">{note.subtitle}</p>
                                    <p className="text-text-muted text-xs mt-1 line-clamp-1 opacity-70 italic">{note.content}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <button 
                                    onClick={() => toggleVisibility(note.id)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${note.isVisible ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                >
                                    {note.isVisible ? 'Hide' : 'Show'}
                                </button>
                                <button 
                                    onClick={() => handleEdit(note)}
                                    className="p-2 rounded-lg text-text-muted hover:bg-gray-100 hover:text-primary transition-colors"
                                    title="Edit"
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(note.id)}
                                    className="p-2 rounded-lg text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {notifications.length === 0 && (
                        <div className="text-center py-12 text-text-muted">
                            <p>No notifications found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
