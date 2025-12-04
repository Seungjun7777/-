import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Quest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// System instruction for the friendly coach
const COACH_SYSTEM_INSTRUCTION = `
당신은 '하루스텝'이라는 앱의 AI 라이프 코치입니다.
주 사용자층은 은둔형 외톨이(히키코모리), 니트족, 혹은 무기력함을 느끼는 사람들입니다.
당신의 역할은 사용자가 아주 작은 성취감을 느끼도록 돕고, 비판보다는 따뜻한 격려를 하는 것입니다.
절대로 강요하거나 훈계하지 마세요. 사용자의 감정에 깊이 공감해주고, 대화는 짧고 부담스럽지 않게 이끌어가세요.
한국어로 대답하세요.
`;

export const chatWithCoach = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
    try {
        const chat = ai.chats.create({
            model: MODEL_NAME,
            config: {
                systemInstruction: COACH_SYSTEM_INSTRUCTION,
            },
            history: history
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat error:", error);
        return "죄송해요, 잠시 연결이 불안정하네요. 조금 뒤에 다시 이야기해 줄래요?";
    }
};

export const generateDailyQuests = async (difficulty: Difficulty, interests: string): Promise<Omit<Quest, 'id' | 'completed'>[]> => {
    try {
        let prompt = "";
        let xp = 10;
        
        if (difficulty === Difficulty.TINY) {
            prompt = `Create 3 extremely easy, "micro-habit" tasks for someone who finds it hard to even start the day. 
            Examples: "Drink a cup of warm water", "Open the curtains", "Stretch for 10 seconds".
            The user is interested in: ${interests || 'General well-being'}.
            Tasks should take less than 2 minutes.`;
            xp = 10;
        } else if (difficulty === Difficulty.EASY) {
            prompt = `Create 3 easy tasks for someone trying to build a routine.
            Examples: "Read 2 pages of a book", "Organize the desk", "Listen to one song completely".
            The user is interested in: ${interests || 'Self-improvement'}.
            Tasks should take about 5-10 minutes.`;
            xp = 25;
        } else {
            prompt = `Create 3 moderate tasks for someone building momentum to study or work.
            Examples: "Study for 25 minutes", "Watch an educational video", "Write a plan for tomorrow".
            The user is interested in: ${interests || 'Learning'}.
            Tasks should take about 20-30 minutes.`;
            xp = 50;
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "Short title of the quest" },
                            description: { type: Type.STRING, description: "Gentle explanation of how to do it" },
                        },
                        required: ["title", "description"]
                    }
                }
            }
        });

        const rawQuests = JSON.parse(response.text || "[]");
        
        // Map to our Quest interface structure (without ID which handles in UI)
        return rawQuests.map((q: any) => ({
            title: q.title,
            description: q.description,
            difficulty: difficulty,
            xp: xp
        }));

    } catch (error) {
        console.error("Quest generation error:", error);
        // Fallback quests if API fails
        return [
            { title: "심호흡 3번 하기", description: "눈을 감고 깊게 숨을 들이마시고 내쉬어보세요.", difficulty, xp: 10 },
            { title: "물 한 잔 마시기", description: "시원한 물 한 잔으로 몸을 깨워보세요.", difficulty, xp: 10 },
            { title: "창문 열기", description: "신선한 공기를 1분만 쐬어보세요.", difficulty, xp: 10 },
        ];
    }
};

export const generateEncouragement = async (completedCount: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `The user just completed ${completedCount} tasks today. Give them a very short, warm compliment in Korean. One sentence max.`,
        });
        return response.text || "정말 잘했어요! 한 걸음 더 나아갔군요.";
    } catch (error) {
        return "수고했어요! 오늘도 멋진 하루네요.";
    }
}