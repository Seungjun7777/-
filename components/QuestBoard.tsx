import React, { useState } from 'react';
import { CheckCircle2, Circle, RefreshCw, Trophy, Zap } from 'lucide-react';
import { Difficulty, Quest, UserStats } from '../types';
import { generateDailyQuests, generateEncouragement } from '../services/geminiService';

interface QuestBoardProps {
    onXpGain: (amount: number) => void;
    userStats: UserStats;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ onXpGain, userStats }) => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(false);
    const [interest, setInterest] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.TINY);
    const [encouragement, setEncouragement] = useState<string>('');

    const handleGenerate = async () => {
        setLoading(true);
        setEncouragement('');
        try {
            const newQuests = await generateDailyQuests(selectedDifficulty, interest);
            const questsWithIds = newQuests.map((q, idx) => ({
                ...q,
                id: Date.now().toString() + idx,
                completed: false
            }));
            setQuests(questsWithIds);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleQuest = async (id: string) => {
        const quest = quests.find(q => q.id === id);
        if (!quest) return;

        if (!quest.completed) {
            onXpGain(quest.xp);
            
            // Check if all complete
            const remaining = quests.filter(q => q.id !== id && !q.completed).length;
            if (remaining === 0) {
                 const msg = await generateEncouragement(quests.length);
                 setEncouragement(msg);
            }
        } else {
             // Logic for un-completing (optional: subtract XP or just disable unchecking)
             // simplified: allow toggle but don't remove XP to avoid abuse, or handle complex logic. 
             // For this MVP, let's just mark it.
        }

        setQuests(prev => prev.map(q => 
            q.id === id ? { ...q, completed: !q.completed } : q
        ));
    };

    const difficultyConfig = {
        [Difficulty.TINY]: { label: '아주 작게 시작하기', color: 'bg-green-100 text-green-700', desc: '침대에서 일어나기, 물 마시기 등' },
        [Difficulty.EASY]: { label: '가볍게 움직이기', color: 'bg-blue-100 text-blue-700', desc: '책상 정리, 5분 독서 등' },
        [Difficulty.NORMAL]: { label: '본격적으로 도전하기', color: 'bg-purple-100 text-purple-700', desc: '20분 공부, 강의 듣기 등' },
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
            <div className="bg-white p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">오늘의 퀘스트</h2>
                        <p className="text-slate-500 mt-1">작은 성공이 모여 큰 변화를 만듭니다.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        <Trophy size={16} className="text-yellow-600" />
                        <span className="font-bold text-yellow-700">{userStats.currentXp} XP</span>
                    </div>
                </div>

                {quests.length === 0 ? (
                    <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
                        <h3 className="font-semibold text-brand-900 mb-4">새로운 퀘스트 만들기</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">난이도 선택</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setSelectedDifficulty(diff)}
                                            className={`p-3 rounded-lg text-left text-sm transition-all border ${
                                                selectedDifficulty === diff 
                                                ? 'ring-2 ring-brand-400 border-transparent shadow-md' 
                                                : 'border-slate-200 hover:border-brand-300'
                                            } ${difficultyConfig[diff].color}`}
                                        >
                                            <div className="font-bold">{difficultyConfig[diff].label}</div>
                                            <div className="text-xs opacity-80 mt-1">{difficultyConfig[diff].desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">관심사 (선택사항)</label>
                                <input
                                    type="text"
                                    value={interest}
                                    onChange={(e) => setInterest(e.target.value)}
                                    placeholder="예: 코딩, 그림 그리기, 독서, 산책"
                                    className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" />
                                ) : (
                                    <Zap size={20} />
                                )}
                                퀘스트 생성하기
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">진행도</span>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand-500 transition-all duration-500"
                                    style={{ width: `${(quests.filter(q => q.completed).length / quests.length) * 100}%` }}
                                ></div>
                            </div>
                            <button 
                                onClick={() => setQuests([])}
                                className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> 새로고침
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {quests.length > 0 && (
                    <div className="space-y-3">
                        {quests.map((quest) => (
                            <div
                                key={quest.id}
                                onClick={() => toggleQuest(quest.id)}
                                className={`group p-4 rounded-xl border transition-all cursor-pointer select-none ${
                                    quest.completed
                                    ? 'bg-slate-100 border-slate-200 opacity-70'
                                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 transition-colors ${quest.completed ? 'text-green-500' : 'text-slate-300 group-hover:text-brand-400'}`}>
                                        {quest.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold text-lg ${quest.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800'}`}>
                                            {quest.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">{quest.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                quest.difficulty === Difficulty.TINY ? 'bg-green-100 text-green-700' :
                                                quest.difficulty === Difficulty.EASY ? 'bg-blue-100 text-blue-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {difficultyConfig[quest.difficulty].label}
                                            </span>
                                            <span className="text-xs font-bold text-yellow-600 flex items-center gap-0.5">
                                                <Trophy size={10} /> +{quest.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {encouragement && (
                    <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-start gap-3 animate-fade-in">
                        <div className="p-2 bg-white rounded-full shadow-sm text-brand-500">
                             <Zap size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-900">Coach Message</h4>
                            <p className="text-brand-700 text-sm mt-1">{encouragement}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestBoard;