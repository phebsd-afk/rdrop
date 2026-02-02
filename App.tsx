import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingWelcome, PersonalizationIntake, GoalSetting } from './pages/Onboarding';
import { Dashboard, Analytics } from './pages/Dashboard';
import { LogActivity, MedReflection, ReflectionSummary, ActivityHistory } from './pages/Activity';
import { EducationalHub, ArticleView, Achievements } from './pages/Education';
import { Settings, Notifications } from './pages/Settings';
import { MedicationTracker } from './pages/Medication';
import { Admin } from './pages/Admin';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    const isAuthenticated = localStorage.getItem('userName') !== null;
    
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<OnboardingWelcome />} />
                
                <Route path="/personalization" element={
                    <ProtectedRoute>
                        <PersonalizationIntake />
                    </ProtectedRoute>
                } />
                <Route path="/goal-setting" element={
                    <ProtectedRoute>
                        <GoalSetting />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/log-activity" element={
                    <ProtectedRoute>
                        <LogActivity />
                    </ProtectedRoute>
                } />
                <Route path="/activity-history" element={
                    <ProtectedRoute>
                        <ActivityHistory />
                    </ProtectedRoute>
                } />
                <Route path="/medications" element={
                    <ProtectedRoute>
                        <MedicationTracker />
                    </ProtectedRoute>
                } />
                <Route path="/med-reflection" element={
                    <ProtectedRoute>
                        <MedReflection />
                    </ProtectedRoute>
                } />
                <Route path="/reflection-summary" element={
                    <ProtectedRoute>
                        <ReflectionSummary />
                    </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                } />
                <Route path="/achievements" element={
                    <ProtectedRoute>
                        <Achievements />
                    </ProtectedRoute>
                } />
                <Route path="/hub" element={
                    <ProtectedRoute>
                        <EducationalHub />
                    </ProtectedRoute>
                } />
                <Route path="/article" element={
                    <ProtectedRoute>
                        <ArticleView />
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <Admin />
                    </ProtectedRoute>
                } /> 
            </Routes>
        </HashRouter>
    );
};

export default App;