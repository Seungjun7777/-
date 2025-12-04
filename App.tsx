import React, { useState } from 'react';
import { LayoutDashboard, MessageCircle, CheckSquare, Clock, Menu, X } from 'lucide-react';
import AICoach from './components/AICoach';
import QuestBoard from './components/QuestBoard';
import FocusTimer from './components/FocusTimer';
import MoodTracker from './components/MoodTracker';
import { ViewState, UserStats } from './types';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userStats, setUserStats] = useState<UserStats>({
        level: 1,
        currentXp: 0,
        nextLevelXp: 100,
        streakDays: 3,
        totalFocusMinutes: 0
    });

    const handleXpGain = (amount: number) => {
        setUserStats(prev => {
            const newXp = prev.currentXp + amount;
            // Simple level up logic
            if (newXp >= prev.nextLevelXp) {
                return {
                    ...prev,
                    level: prev.level + 1,
                    currentXp: newXp - prev.nextLevelXp,
                    nextLevelXp: Math.floor(prev.nextLevelXp * 1.2)
                };
            }
            return { ...prev, currentXp: newXp };
        });
    };

    const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: React.ElementType, label: string }) => (
        <button
            onClick={() => {
                setCurrentView(view);
                setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                currentView === view 
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-200' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-warm-50">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        H
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-slate-800 tracking-tight">HaruStep</h1>
                        <p className="text-xs text-slate-400">당신의 하루를 바꿉니다</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="대시보드" />
                    <NavItem view={ViewState.QUESTS} icon={CheckSquare} label="오늘의 퀘스트" />
                    <NavItem view={ViewState.COACH} icon={MessageCircle} label="AI 코치" />
                    <NavItem view={ViewState.FOCUS} icon={Clock} label="집중 타이머" />
                </nav>

                <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Level {userStats.level}</span>
                        <span className="font-bold text-brand-600">{userStats.currentXp}/{userStats.nextLevelXp} XP</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${(userStats.currentXp / userStats.nextLevelXp) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">H</div>
                    <span className="font-bold text-slate-800">HaruStep</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-6 space-y-4">
                     <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="대시보드" />
                    <NavItem view={ViewState.QUESTS} icon={CheckSquare} label="오늘의 퀘스트" />
                    <NavItem view={ViewState.COACH} icon={MessageCircle} label="AI 코치" />
                    <NavItem view={ViewState.FOCUS} icon={Clock} label="집중 타이머" />
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col pt-16 md:pt-0">
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto h-full">
                        {currentView === ViewState.DASHBOARD && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full pb-20 md:pb-0">
                                <div className="md:col-span-8 flex flex-col gap-6">
                                    <div className="h-[500px]">
                                        <QuestBoard onXpGain={handleXpGain} userStats={userStats} />
                                    </div>
                                    <div className="h-[300px]">
                                         <AICoach />
                                    </div>
                                </div>
                                <div className="md:col-span-4 flex flex-col gap-6">
                                    <div className="h-[300px]">
                                        <MoodTracker />
                                    </div>
                                    <div className="h-[300px]">
                                        <FocusTimer />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentView === ViewState.QUESTS && (
                             <div className="h-full pb-20 md:pb-0">
                                <QuestBoard onXpGain={handleXpGain} userStats={userStats} />
                             </div>
                        )}

                        {currentView === ViewState.COACH && (
                             <div className="h-full pb-20 md:pb-0">
                                <AICoach />
                             </div>
                        )}

                        {currentView === ViewState.FOCUS && (
                            <div className="h-full max-w-md mx-auto py-10">
                                <FocusTimer />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;