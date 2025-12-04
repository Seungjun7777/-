import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const FOCUS_MINUTES = 25;

const FocusTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionType, setSessionType] = useState<'FOCUS' | 'BREAK'>('FOCUS');

    useEffect(() => {
        let interval: any = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // In a real app, play sound here
            if (sessionType === 'FOCUS') {
                setSessionType('BREAK');
                setTimeLeft(5 * 60);
            } else {
                setSessionType('FOCUS');
                setTimeLeft(FOCUS_MINUTES * 60);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, sessionType]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setSessionType('FOCUS');
        setTimeLeft(FOCUS_MINUTES * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = sessionType === 'FOCUS' 
        ? ((FOCUS_MINUTES * 60 - timeLeft) / (FOCUS_MINUTES * 60)) * 100
        : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center h-full relative overflow-hidden">
             {/* Background decorative circles */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-slate-100`}>
                <div 
                    className={`h-full transition-all duration-1000 ${sessionType === 'FOCUS' ? 'bg-brand-500' : 'bg-green-500'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="text-center mb-8 relative z-10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-2 ${
                    sessionType === 'FOCUS' ? 'bg-brand-100 text-brand-700' : 'bg-green-100 text-green-700'
                }`}>
                    {sessionType === 'FOCUS' ? 'FOCUS TIME' : 'BREAK TIME'}
                </span>
                <div className="text-6xl font-mono font-bold text-slate-800 tracking-tighter">
                    {formatTime(timeLeft)}
                </div>
                <p className="text-slate-500 mt-2 text-sm">
                    {sessionType === 'FOCUS' ? '작은 집중이 큰 결과를 만듭니다.' : '잠시 뇌를 쉬게 해주세요.'}
                </p>
            </div>

            <div className="flex gap-4 relative z-10">
                <button
                    onClick={toggleTimer}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                        isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-500 hover:bg-brand-600'
                    }`}
                >
                    {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                    <RotateCcw size={24} />
                </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs text-center">
                 <div className="p-3 bg-slate-50 rounded-xl">
                     <div className="text-xs text-slate-400 font-medium uppercase">세션 완료</div>
                     <div className="text-xl font-bold text-slate-700">0</div>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-xl">
                     <div className="text-xs text-slate-400 font-medium uppercase">총 집중</div>
                     <div className="text-xl font-bold text-slate-700">0m</div>
                 </div>
            </div>
        </div>
    );
};

export default FocusTimer;