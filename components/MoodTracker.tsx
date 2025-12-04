import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile, Frown, Meh, Sun, CloudRain } from 'lucide-react';
import { MoodLog } from '../types';

// Mock data
const INITIAL_DATA: MoodLog[] = [
    { date: 'Mon', score: 2 },
    { date: 'Tue', score: 3 },
    { date: 'Wed', score: 2 },
    { date: 'Thu', score: 4 },
    { date: 'Fri', score: 3 },
    { date: 'Sat', score: 5 },
];

const MoodTracker: React.FC = () => {
    const [data, setData] = useState<MoodLog[]>(INITIAL_DATA);
    const [todayLogged, setTodayLogged] = useState(false);

    const handleLog = (score: number) => {
        if (todayLogged) return;
        const newData = [...data, { date: 'Sun', score }];
        // Keep last 7 days
        if (newData.length > 7) newData.shift();
        setData(newData);
        setTodayLogged(true);
    };

    const moodIcons = [
        { score: 1, icon: CloudRain, color: 'text-slate-400 hover:text-slate-600', bg: 'hover:bg-slate-100' },
        { score: 2, icon: Frown, color: 'text-blue-400 hover:text-blue-600', bg: 'hover:bg-blue-50' },
        { score: 3, icon: Meh, color: 'text-green-400 hover:text-green-600', bg: 'hover:bg-green-50' },
        { score: 4, icon: Smile, color: 'text-orange-400 hover:text-orange-600', bg: 'hover:bg-orange-50' },
        { score: 5, icon: Sun, color: 'text-yellow-400 hover:text-yellow-600', bg: 'hover:bg-yellow-50' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sun size={20} className="text-orange-400" />
                기분 날씨
            </h3>
            
            <div className="flex-1 min-h-[150px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide domain={[0, 6]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#e2e8f0' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#0ea5e9" 
                            strokeWidth={3}
                            dot={{ fill: '#0ea5e9', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500 mb-3 text-center">오늘 하루는 어땠나요?</p>
                <div className="flex justify-between gap-1">
                    {moodIcons.map((m) => (
                        <button
                            key={m.score}
                            onClick={() => handleLog(m.score)}
                            disabled={todayLogged}
                            className={`p-3 rounded-xl transition-all ${m.color} ${m.bg} ${todayLogged ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer transform hover:scale-110'}`}
                        >
                            <m.icon size={28} />
                        </button>
                    ))}
                </div>
                {todayLogged && (
                    <p className="text-center text-xs text-brand-500 font-medium mt-3 animate-fade-in">
                        기록되었습니다. 내일 또 만나요!
                    </p>
                )}
            </div>
        </div>
    );
};

export default MoodTracker;