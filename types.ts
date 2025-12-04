export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    QUESTS = 'QUESTS',
    COACH = 'COACH',
    FOCUS = 'FOCUS',
    STATS = 'STATS'
}

export enum Difficulty {
    TINY = 'TINY', // Just getting out of bed, drinking water
    EASY = 'EASY', // Reading 1 page, cleaning desk
    NORMAL = 'NORMAL' // Studying 30 mins, going for a walk
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    completed: boolean;
    xp: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

export interface MoodLog {
    date: string; // ISO Date string YYYY-MM-DD
    score: number; // 1-5
    note?: string;
}

export interface UserStats {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streakDays: number;
    totalFocusMinutes: number;
}