import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';

// Screen 8: Onboarding Welcome
export const OnboardingWelcome: React.FC = () => {
    const navigate = useNavigate();
    
    // State for the authentication modal
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authName, setAuthName] = useState("");

    const openLoginModal = () => {
        setAuthMode('login');
        setAuthName("");
        setShowAuthModal(true);
    };
    
    const openRegisterModal = () => {
        setAuthMode('register');
        setAuthName("");
        setShowAuthModal(true);
    }

    const handleAuthSubmit = () => {
        if (authName.trim()) {
            localStorage.setItem('userName', authName.trim());
        } else {
            // Default name if empty for prototype purposes
            localStorage.setItem('userName', 'User');
        }

        setShowAuthModal(false);

        if (authMode === 'login') {
            navigate('/dashboard');
        } else {
            // New users go through personalization
            navigate('/personalization');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 lg:px-40 bg-background-light dark:bg-background-dark relative">
            
            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102022]/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-[440px] rounded-2xl p-8 shadow-2xl border border-white/20 relative animate-[fadeIn_0.2s_ease-out]">
                        <button 
                            onClick={() => setShowAuthModal(false)} 
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-text-muted transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <div className="flex flex-col gap-6 text-center">
                            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <span className="material-symbols-outlined text-2xl">{authMode === 'login' ? 'lock' : 'person_add'}</span>
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-[#111718] dark:text-white">
                                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-text-muted text-sm">
                                    {authMode === 'login' ? 'Enter your details to access your dashboard.' : 'Join Rain Drop to start your health journey.'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 text-left">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Username</label>
                                    <input 
                                        type="text" 
                                        value={authName}
                                        onChange={(e) => setAuthName(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full px-4 py-3.5 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-base"
                                        autoFocus
                                    />
                                </div>
                                
                                <button 
                                    onClick={handleAuthSubmit} 
                                    className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-[#102022] font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2 active:scale-[0.98]"
                                >
                                    {authMode === 'login' ? 'Log In' : 'Create Account'}
                                </button>
                            </div>

                            <div className="pt-4 border-t border-border-light dark:border-border-dark mt-2">
                                <p className="text-sm text-text-muted mb-3">
                                    {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                                </p>
                                <button 
                                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                    className="px-6 py-2 rounded-lg border border-border-light dark:border-border-dark font-bold text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors w-full sm:w-auto"
                                >
                                    {authMode === 'login' ? 'Register Now' : 'Log In Instead'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute top-6 right-6 lg:top-10 lg:right-10 z-10">
                <button 
                    onClick={openLoginModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[#111718] dark:text-white hover:bg-[#e0e6e7] dark:hover:bg-[#1a2c30] transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">login</span>
                    Log In
                </button>
            </div>

            <div className="w-full max-w-[1200px] flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center">
                <div className="flex flex-col gap-8 flex-1 w-full lg:max-w-[540px]">
                    <div className="flex flex-col gap-4 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 w-fit">
                            <span className="material-symbols-outlined text-primary text-sm">health_and_safety</span>
                            <span className="text-primary-dark dark:text-primary text-xs font-bold uppercase tracking-wide">Renal Health Companion</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black leading-[1.15] tracking-[-0.033em]">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#20b8c5]">Rain Drop</span>
                        </h1>
                        <p className="text-text-muted dark:text-gray-300 text-lg lg:text-xl font-light leading-relaxed">
                            Protect your kidney health, one step at a time. Discover how tracking your physical activity can improve medication adherence and support your transplant recovery.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={openRegisterModal} className="group flex min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-lg h-14 px-8 bg-primary hover:bg-primary-dark text-[#102022] text-base font-bold transition-all shadow-lg hover:shadow-primary/40 transform hover:-translate-y-0.5">
                                <span>Get Started</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                             <button onClick={openLoginModal} className="flex min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-lg h-14 px-8 border-2 border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary text-text-muted hover:text-text-main dark:hover:text-white text-base font-bold transition-all bg-transparent">
                                <span>I have an account</span>
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="w-full lg:w-1/2 flex justify-center relative">
                    <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-[#a5f3fc]/20 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-20"></div>
                    <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-[600px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/50 dark:border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                        <div className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url("${IMAGES.hero}")`}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Screen 9: Personalization Intake
export const PersonalizationIntake: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <header className="flex items-center justify-between px-10 py-3 bg-surface-light dark:bg-surface-dark border-b border-[#f0f4f4] dark:border-[#1e2e30]">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-2xl text-primary">nephrology</span>
                    <h2 className="text-lg font-bold">RenalCare Health</h2>
                </div>
            </header>
            <div className="flex-1 flex justify-center py-8 px-4">
                <div className="w-full max-w-[800px] flex flex-col gap-8">
                     <div className="flex flex-col gap-3">
                        <div className="flex gap-6 justify-between items-center">
                            <p className="text-base font-medium">Step 2 of 5: Personalization</p>
                            <span className="text-sm font-medium text-text-sub dark:text-gray-400">40%</span>
                        </div>
                        <div className="rounded-full bg-[#dbe5e6] dark:bg-[#1e2e30] h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{width: '40%'}}></div>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black">Let's personalize your plan</h1>
                    
                    <div className="flex flex-col gap-4 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm">
                        <label className="text-xl font-bold">Current Activity Level</label>
                        <div className="grid grid-cols-1 gap-4">
                             {['Inactive', 'Lightly Active', 'Moderately Active'].map((label, i) => (
                                <label key={i} className="group relative flex items-center p-4 rounded-xl border-2 border-[#e6e8eb] dark:border-[#2A3C40] cursor-pointer hover:border-primary/50">
                                    <input type="radio" name="activity" className="sr-only peer" />
                                    <div className="peer-checked:bg-primary/5 absolute inset-0 rounded-xl pointer-events-none"></div>
                                    <div className="flex items-center justify-center size-12 rounded-full bg-[#f0f4f4] dark:bg-[#1e2e30] mr-4 text-text-sub peer-checked:bg-primary peer-checked:text-black">
                                        <span className="material-symbols-outlined">{['weekend', 'directions_walk', 'fitness_center'][i]}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">{label}</span>
                                    </div>
                                </label>
                             ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button onClick={() => navigate('/goal-setting')} className="flex min-w-[140px] h-12 items-center justify-center rounded-lg bg-primary text-[#111718] font-bold shadow-md hover:bg-primary-hover transition-colors">Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Screen 6: Guided Goal Setting
export const GoalSetting: React.FC = () => {
    const navigate = useNavigate();
    return (
         <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark items-center">
            <div className="w-full max-w-[720px] px-4 py-8 lg:py-12 flex flex-col gap-6">
                 <div className="flex flex-col gap-3">
                    <div className="flex gap-6 justify-between items-end">
                        <p className="text-base font-medium">Step 3 of 4</p>
                        <p className="text-text-muted text-sm">Goal Setting</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#dbe5e6] dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-primary" style={{width: '75%'}}></div>
                    </div>
                </div>
                <h1 className="text-[28px] font-bold text-center pt-4">We've found a starting point for you.</h1>
                
                <div className="relative overflow-hidden rounded-xl shadow-lg group h-[320px] bg-cover bg-center flex flex-col justify-end p-6" style={{backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%), url("${IMAGES.goal}")`}}>
                     <div className="flex flex-col gap-2 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-xl">verified</span>
                            <p className="text-primary text-sm font-bold tracking-wider uppercase">Recommended Goal</p>
                        </div>
                        <p className="text-4xl font-bold">2 Sessions / Week</p>
                    </div>
                </div>

                 <div className="flex flex-col items-center gap-4 mt-8 w-full">
                    <button onClick={() => navigate('/dashboard')} className="w-full md:w-auto md:min-w-[320px] bg-primary hover:bg-primary-dark text-[#102022] font-bold text-lg py-4 px-8 rounded-lg shadow-md transition-all">Confirm My Goal</button>
                </div>
            </div>
         </div>
    );
};