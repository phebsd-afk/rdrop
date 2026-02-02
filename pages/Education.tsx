
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { IMAGES } from '../constants';

// Screen 16: Educational Hub
export const EducationalHub: React.FC = () => {
     const navigate = useNavigate();
     const [selectedTip, setSelectedTip] = useState<{title: string, icon: string, content: string} | null>(null);
     const [featuredTip, setFeaturedTip] = useState<{title: string, image: string, category: string, content: string} | null>(null);

     const QUICK_TIPS = [
        {
            title: 'Habit Stacking',
            icon: 'alarm_on',
            content: 'Link your new habit to an existing one. For example, take your medication immediately after brushing your teeth in the morning. This creates a strong mental association that makes sticking to your routine effortless.'
        },
        {
            title: 'Hydration First',
            icon: 'water_drop',
            content: 'Your kidneys love water. Drinking a glass of water right when you wake up helps kickstart your metabolism and flush out toxins. Keep a water bottle by your bedside as a visual reminder.'
        },
        {
            title: 'Walking Breaks',
            icon: 'directions_walk',
            content: 'Short walks are better than no walks. If you have a sedentary job or lifestyle, try to get up and move for 5 minutes every hour. This improves circulation and reduces stiffness without exhausting you.'
        },
        {
            title: 'Set Reminders',
            icon: 'notifications_active',
            content: 'Mental energy is a finite resource. Offload the burden of remembering by using phone alarms or app notifications for your medication and water intake. Consistency is key to long-term recovery.'
        }
     ];

     const FEATURED_TIPS = [
        {
            title: "Post-Transplant Nutrition: The Basics",
            image: IMAGES.articleHero,
            category: "Nutrition",
            content: "Your nutritional needs change after a transplant. Focus on food safety—wash all fruits and vegetables thoroughly. Avoid grapefruit and starfruit as they interfere with immunosuppressants. A balanced diet low in salt and sugar protects your new kidney and helps manage blood pressure."
        },
        {
            title: "The Healing Power of Sleep",
            image: IMAGES.goal,
            category: "Wellness",
            content: "Sleep is when your body repairs itself. Aim for 7-9 hours of quality sleep. Establish a calming bedtime routine and avoid screens 1 hour before bed to improve sleep quality, which directly boosts immune function and mood stability."
        },
        {
            title: "Safe Exercise Guidelines",
            image: IMAGES.hubHero,
            category: "Fitness",
            content: "Start slow. Walking is the best activity for early recovery. Avoid heavy lifting (over 10lbs) for at least 6-8 weeks post-surgery to prevent hernias. Always listen to your body—if it hurts, stop immediately and consult your doctor."
        },
        {
            title: "Managing Stress & Anxiety",
            image: IMAGES.tip,
            category: "Mental Health",
            content: "It's normal to feel overwhelmed. Practice deep breathing exercises: inhale for 4 counts, hold for 4, exhale for 4. This activates your parasympathetic nervous system, reducing stress hormones that can strain your kidney."
        },
        {
            title: "Medication Adherence Strategies",
            image: IMAGES.articleHero,
            category: "Medication",
            content: "Taking immunosuppressants exactly as prescribed is crucial for preventing rejection. Use pillboxes, set phone alarms, and link doses to daily habits like meals or brushing teeth to ensure you never miss a dose."
        },
        {
            title: "Understanding Your Lab Results",
            image: IMAGES.hubHero,
            category: "Medical",
            content: "Creatinine and GFR are key indicators of your kidney function. Learning to track these numbers helps you advocate for your health. Always ask your transplant team to explain trends in your bloodwork."
        },
        {
            title: "Hydration for Kidney Health",
            image: IMAGES.hero,
            category: "Nutrition",
            content: "Water helps your kidneys remove waste from your blood in the form of urine. For transplant recipients, staying well-hydrated is essential for maintaining graft function, especially during hot weather or exercise."
        }
    ];

    const openRandomFeatured = () => {
        const randomIndex = Math.floor(Math.random() * FEATURED_TIPS.length);
        setFeaturedTip(FEATURED_TIPS[randomIndex]);
    };

     return (
        <Layout>
            <div className="p-6 lg:px-20 max-w-[1200px] mx-auto flex flex-col gap-8 relative">
                
                {/* Quick Tip Modal */}
                {selectedTip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedTip(null)}>
                        <div 
                            className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-8 shadow-2xl relative border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setSelectedTip(null)} 
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-text-muted transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-4xl">{selectedTip.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{selectedTip.title}</h3>
                                    <p className="text-text-muted dark:text-gray-300 leading-relaxed text-lg">
                                        {selectedTip.content}
                                    </p>
                                </div>
                                <div className="w-full flex flex-col gap-3">
                                    <button 
                                        onClick={() => setSelectedTip(null)}
                                        className="w-full py-3.5 rounded-xl bg-primary text-[#102022] font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Tip Modal (Rich Content) */}
                {featuredTip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setFeaturedTip(null)}>
                        <div 
                            className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl relative border border-white/10 overflow-hidden flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                             <button 
                                onClick={() => setFeaturedTip(null)} 
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                            >
                                <span className="material-symbols-outlined shadow-sm">close</span>
                            </button>

                            <div className="w-full md:w-2/5 h-64 md:h-auto bg-cover bg-center relative" style={{backgroundImage: `url("${featuredTip.image}")`}}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                                <span className="absolute bottom-4 left-4 md:top-4 md:left-4 md:bottom-auto bg-primary text-[#102022] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                    {featuredTip.category}
                                </span>
                            </div>

                            <div className="w-full md:w-3/5 p-8 flex flex-col justify-center gap-4">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-2xl font-black leading-tight">{featuredTip.title}</h3>
                                    </div>
                                    <div className="w-12 h-1 bg-primary rounded-full mb-4"></div>
                                    <p className="text-text-muted dark:text-gray-300 leading-relaxed text-base">
                                        {featuredTip.content}
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => { setFeaturedTip(null); openRandomFeatured(); }}
                                            className="flex-1 py-3 rounded-lg border-2 border-primary text-primary-dark dark:text-primary font-bold hover:bg-primary/5 transition-colors"
                                        >
                                            Next Tip
                                        </button>
                                         <button 
                                            onClick={() => setFeaturedTip(null)}
                                            className="flex-1 py-3 rounded-lg bg-primary text-[#102022] font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <section className="w-full rounded-2xl overflow-hidden shadow-sm relative min-h-[400px] flex flex-col justify-end p-8 md:p-12 transition-all group" style={{backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, rgba(0,0,0,0) 100%), url("${IMAGES.hubHero}")`}}>
                    <div className="flex flex-col gap-4 text-left max-w-2xl relative z-10">
                        <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase text-white border border-white/30">
                            <span className="material-symbols-outlined text-sm mr-1">auto_awesome</span>
                            Health Insights
                        </span>
                        <h1 className="text-white text-4xl font-black drop-shadow-md">Explore Daily Wisdom for Your Recovery Journey</h1>
                        <p className="text-white/80 text-lg max-w-xl mb-2">Discover tips on nutrition, sleep, mental health, and safe exercise tailored for transplant recipients.</p>
                        <button 
                            onClick={openRandomFeatured} 
                            className="mt-2 flex items-center justify-center gap-2 rounded-lg h-14 px-8 bg-primary text-[#111718] font-bold w-fit hover:bg-white hover:scale-105 transition-all shadow-lg shadow-primary/30"
                        >
                            <span className="material-symbols-outlined">shuffle</span>
                            Inspire Me
                        </button>
                    </div>
                </section>
                
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">lightbulb</span> Quick Tips</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {QUICK_TIPS.map((tip, i) => (
                            <button 
                                key={i} 
                                onClick={() => setSelectedTip(tip)}
                                className="bg-[#e0f2f1] dark:bg-[#1a2c30] p-5 rounded-xl border-2 border-transparent hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all text-left group h-full flex flex-col items-start"
                            >
                                <div className="rounded-full bg-white dark:bg-[#102022] p-2 text-primary w-fit mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">{tip.icon}</span>
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-primary-dark dark:group-hover:text-primary transition-colors">{tip.title}</h3>
                                <p className="text-sm text-text-muted mt-2 line-clamp-2">{tip.content}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Screen 13: Article View
export const ArticleView: React.FC = () => {
     const navigate = useNavigate();

     return (
         <Layout>
            <div className="max-w-3xl mx-auto px-6 py-10">
                <button onClick={() => navigate('/hub')} className="group flex items-center gap-2 mb-6 text-text-muted hover:text-primary">
                    <span className="material-symbols-outlined">arrow_back</span> Back to Hub
                </button>
                <div className="flex flex-col gap-4 mb-6">
                    <h1 className="text-3xl md:text-4xl font-black">Understanding Cardiorespiratory Fitness: The Key to Post-Transplant Health</h1>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                            <span>By Dr. Sarah Jenkins</span> • <span>8 min read</span>
                        </div>
                    </div>
                </div>
                
                <div className="w-full h-[300px] bg-cover bg-center rounded-xl mb-10" style={{backgroundImage: `url("${IMAGES.articleHero}")`}}></div>
                
                <div className="prose dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-bold mb-4">What is Cardiorespiratory Fitness (CRF)?</h2>
                    <p className="text-lg leading-relaxed mb-6">Cardiorespiratory fitness (CRF) refers to the ability of your circulatory and respiratory systems to supply oxygen to skeletal muscles during sustained physical activity. For renal transplant recipients, CRF is not just a measure of athletic ability—it is a critical vital sign that correlates directly with graft survival.</p>
                    
                    <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg mb-8">
                        <h3 className="font-bold text-lg mb-2">Key Takeaway</h3>
                        <p>Research indicates that patients who engage in moderate aerobic activity within the first year post-transplant see a 24% reduction in hospital readmission rates.</p>
                    </div>
                </div>
            </div>
         </Layout>
     );
};

// Screen 17: Achievements
export const Achievements: React.FC = () => {
    const navigate = useNavigate();
    
    const achievements = [
        { id: 1, title: 'Day One', desc: 'Started your health journey', icon: 'flag', earned: true },
        { id: 2, title: 'Hydrator', desc: 'Log water intake 7 days in a row', icon: 'water_drop', earned: false },
        { id: 3, title: 'Power Walker', desc: 'Completed 5 aerobic sessions', icon: 'directions_run', earned: true },
        { id: 4, title: 'Knowledge Seeker', desc: 'Read 5 educational articles', icon: 'auto_stories', earned: false },
        { id: 5, title: 'Pill Pro', desc: '100% medication adherence for a week', icon: 'medication', earned: true },
        { id: 6, title: 'Steady Pace', desc: 'Logged activity for 3 consecutive weeks', icon: 'timeline', earned: false },
    ];

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-black">My Achievements</h1>
                    <p className="text-text-muted">Milestones on your path to better health.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {achievements.map((ach) => (
                        <div 
                            key={ach.id} 
                            className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center group ${
                                ach.earned 
                                ? 'bg-white dark:bg-surface-dark border-primary/20 shadow-sm hover:shadow-md' 
                                : 'bg-gray-50/50 dark:bg-white/5 border-transparent opacity-60 grayscale'
                            }`}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                                ach.earned 
                                ? 'bg-primary/10 text-primary-dark dark:text-primary ring-4 ring-primary/5' 
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                            }`}>
                                <span className="material-symbols-outlined text-4xl">{ach.icon}</span>
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${ach.earned ? 'text-[#111718] dark:text-white' : 'text-text-muted'}`}>
                                {ach.title}
                            </h3>
                            <p className="text-xs text-text-muted leading-tight">
                                {ach.desc}
                            </p>
                            {ach.earned && (
                                <span className="mt-3 px-3 py-1 bg-primary/10 text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Unlocked
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-[#102022] shrink-0">
                        <span className="material-symbols-outlined text-3xl font-bold">trophy</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold mb-1">Rank: Health Novice</h3>
                        <p className="text-text-muted text-sm">You've unlocked 3 out of 6 achievements. Complete more daily tasks to reach the next level!</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-primary text-[#102022] font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-colors whitespace-nowrap"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </Layout>
    );
};
