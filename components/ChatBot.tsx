
//import React, { useState, useRef, useEffect } from 'react';

// OLD import { ... } from "@google/genai";
// NEW 
import { GoogleGenerativeAI } from "@google/generative-ai";
//import { LiveVoiceAssistant } from './LiveVoiceAssistant';
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Fix for process is not defined in browser/vite context for TS
//declare var process: {
 // env: {
   // API_KEY: string;
 // };
//};

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showVoice, setShowVoice] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Hi! I\'m Rain Drop, your health companion. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && !chatSession) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const chat = ai.chats.create({
                    model: 'gemini-flash-lite-latest',
                    config: {
                        systemInstruction: "You are a helpful renal health companion assistant named Rain Drop. You help users track physical activity, medication adherence, and provide education for transplant recovery. Keep answers concise, encouraging, and empathetic. Do not provide medical advice, always suggest consulting a doctor for medical issues."
                    },
                    history: [
                        { role: 'model', parts: [{ text: 'Hi! I\'m Rain Drop, your health companion. How can I help you today?' }] }
                    ]
                });
                setChatSession(chat);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
            }
        }
    }, [isOpen, chatSession]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const result = await chatSession.sendMessage({ message: userMsg });
            const responseText = result.text || "I didn't get a response. Please try again.";
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {showVoice && <LiveVoiceAssistant onClose={() => setShowVoice(false)} />}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-red-500 text-white rotate-45' : 'bg-primary text-[#102022]'}`}
                aria-label="Toggle AI Assistant"
            >
                <span className="material-symbols-outlined text-3xl">
                    {isOpen ? 'add' : 'smart_toy'}
                </span>
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-[400px] h-[500px] max-h-[70vh] bg-white dark:bg-[#152325] rounded-2xl shadow-2xl border border-border-light dark:border-[#223032] flex flex-col overflow-hidden animate-[slide-in_0.3s_ease-out]">
                    <div className="p-4 bg-primary/10 border-b border-border-light dark:border-[#223032] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-[#102022]">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#111718] dark:text-white">Rain Drop AI</h3>
                            <p className="text-xs text-text-muted">Health Companion</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background-light dark:bg-background-dark">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div 
                                        className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-primary text-[#102022] rounded-tr-none' 
                                                : 'bg-white dark:bg-[#1A2C2E] border border-border-light dark:border-[#223032] text-[#111718] dark:text-gray-200 rounded-tl-none'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
                                <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 w-fit shadow-sm">
                                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-lg text-primary animate-spin">
                                            sync
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-primary tracking-wide">AI Processing</span>
                                        <div className="flex gap-1 h-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-[#152325] border-t border-border-light dark:border-[#223032] flex items-center gap-2">
                        <button 
                            onClick={() => setShowVoice(true)}
                            className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-text-muted hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            title="Start Voice Chat"
                        >
                            <span className="material-symbols-outlined">mic</span>
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-background-light dark:bg-[#1A2C2E] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-[#111718] dark:text-white placeholder-text-muted"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-3 rounded-xl bg-primary text-[#102022] hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
