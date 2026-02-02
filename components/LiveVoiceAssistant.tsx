
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";

// Fix for process is not defined in browser/vite context for TS
declare var process: {
  env: {
    API_KEY: string;
  };
};

interface LiveVoiceAssistantProps {
    onClose: () => void;
}

interface GroundingSource {
    title: string;
    uri: string;
}

// Helper: Convert Float32Array to 16-bit PCM standard used by the model
function floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
}

// Helper: Base64 Encode manually
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Helper: Base64 Decode manually
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Tool Declaration for Navigation
const navigationFunctionDeclaration: FunctionDeclaration = {
    name: 'navigate',
    parameters: {
        type: Type.OBJECT,
        description: 'Navigate the user to a specific page in the app.',
        properties: {
            page: {
                type: Type.STRING,
                description: 'The path to navigate to. Valid options: "/dashboard", "/log-activity", "/activity-history", "/medications", "/analytics", "/achievements", "/hub", "/settings".',
            },
        },
        required: ['page'],
    },
};

export const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [volume, setVolume] = useState(0); 
    const [isUserTalking, setIsUserTalking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sources, setSources] = useState<GroundingSource[]>([]);

    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const PLAYBACK_LOOKAHEAD = 0.15;
    const VAD_THRESHOLD = 0.008;

    useEffect(() => {
        let mounted = true;

        const startSession = async () => {
            try {
                const InputAudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                inputContextRef.current = new InputAudioContextClass({ sampleRate: 16000 });

                const OutputAudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                outputContextRef.current = new OutputAudioContextClass({ sampleRate: 24000 });
                
                const outputNode = outputContextRef.current.createGain();
                outputNode.connect(outputContextRef.current.destination);

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                        },
                        thinkingConfig: { thinkingBudget: 0 },
                        systemInstruction: `You are CareBot (Rain Drop), a world-class renal health specialist and intelligent app companion.

CAPABILITIES:
1. APP NAVIGATION: You can navigate the user to specific screens using the 'navigate' tool.
   - Dashboard: Summary, daily tip. Path: "/dashboard"
   - Log Activity: Track exercise. Path: "/log-activity"
   - History: View past logs. Path: "/activity-history"
   - Medications: Med tracker. Path: "/medications"
   - Analytics: Charts/graphs. Path: "/analytics"
   - Education/Hub: Articles. Path: "/hub"
   - Achievements: Trophies. Path: "/achievements"
   - Settings: Preferences. Path: "/settings"

   If a user says "I want to log a run", say "Taking you to the activity logger" and call navigate("/log-activity").
   If a user asks about their meds, call navigate("/medications").

2. HEALTH EXPERTISE (Google Search):
   - Answer multiple questions about post-transplant recovery, immunosuppressants, diet, and lifestyle.
   - Use Google Search to verify specific medical facts or recent studies.
   - Be proactive: If they ask about exercise, suggest a safe routine and offer to take them to the logging screen.

INTERACTION STYLE:
- Professional, empathetic, and encouraging.
- Answer clearly and concisely.
- Allow for continuous conversation (multiple questions).
- Always verify medical info.
- NOT A DOCTOR: Preface medical advice with "Verify with your transplant team."

Example:
User: "Can I eat grapefruit?"
You: "Grapefruit can interfere with immunosuppressants like tacrolimus. It is generally advised to avoid it. Would you like to read more in the Education Hub?"
User: "Yes, take me there."
You: (Call navigate("/hub")) "Opening the Education Hub now."`,
                        tools: [
                            { googleSearch: {} },
                            { functionDeclarations: [navigationFunctionDeclaration] }
                        ],
                    },
                    callbacks: {
                        onopen: async () => {
                            if (!mounted) return;
                            setStatus('connected');
                            
                            try {
                                streamRef.current = await navigator.mediaDevices.getUserMedia({ 
                                    audio: {
                                        echoCancellation: true,
                                        noiseSuppression: true,
                                        autoGainControl: true,
                                        channelCount: 1
                                    } 
                                });
                                if (!inputContextRef.current) return;

                                sourceRef.current = inputContextRef.current.createMediaStreamSource(streamRef.current);
                                processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);

                                processorRef.current.onaudioprocess = (e) => {
                                    if (!inputContextRef.current) return;
                                    const inputData = e.inputBuffer.getChannelData(0);
                                    
                                    let sum = 0;
                                    for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                                    const rms = Math.sqrt(sum / inputData.length);
                                    setVolume(rms);

                                    const isAiSpeaking = activeSourcesRef.current.size > 0;
                                    const adaptiveThreshold = isAiSpeaking ? VAD_THRESHOLD * 5 : VAD_THRESHOLD; 

                                    if (rms < adaptiveThreshold) {
                                        setIsUserTalking(false);
                                        for(let i = 0; i < inputData.length; i++) inputData[i] = 0;
                                    } else {
                                        setIsUserTalking(true);
                                    }

                                    const pcm16 = floatTo16BitPCM(inputData);
                                    const sampleRate = inputContextRef.current.sampleRate;
                                    
                                    const pcmBlob = {
                                        data: arrayBufferToBase64(pcm16.buffer),
                                        mimeType: `audio/pcm;rate=${sampleRate}`
                                    };

                                    sessionPromise.then(session => {
                                        session.sendRealtimeInput({ media: pcmBlob });
                                    });
                                };

                                sourceRef.current.connect(processorRef.current);
                                processorRef.current.connect(inputContextRef.current.destination);

                            } catch (err) {
                                console.error("Mic Error:", err);
                                setErrorMessage("Could not access microphone.");
                                setStatus('error');
                            }
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (!mounted) return;

                            // Handle Tool Calls (Navigation)
                            if (message.toolCall) {
                                for (const fc of message.toolCall.functionCalls) {
                                    if (fc.name === 'navigate') {
                                        const page = (fc.args as any).page;
                                        if (page) {
                                            navigate(page);
                                            // Send response back to model to confirm navigation
                                            sessionPromise.then(session => {
                                                session.sendToolResponse({
                                                    functionResponses: [{
                                                        id: fc.id,
                                                        name: fc.name,
                                                        response: { result: `Navigated to ${page}` }
                                                    }]
                                                });
                                            });
                                        }
                                    }
                                }
                            }

                            // Handle Grounding Metadata (Search Sources)
                            const groundingMetadata = (message.serverContent as any)?.modelTurn?.groundingMetadata;
                            if (groundingMetadata?.groundingChunks) {
                                const newSources: GroundingSource[] = groundingMetadata.groundingChunks
                                    .filter((chunk: any) => chunk.web)
                                    .map((chunk: any) => ({
                                        title: chunk.web.title,
                                        uri: chunk.web.uri
                                    }));
                                
                                if (newSources.length > 0) {
                                    setSources(prev => {
                                        const existingUris = new Set(prev.map(s => s.uri));
                                        const filtered = newSources.filter(s => !existingUris.has(s.uri));
                                        return [...prev, ...filtered];
                                    });
                                }
                            }

                            if (!outputContextRef.current) return;

                            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (audioData) {
                                try {
                                    const rawBytes = base64ToUint8Array(audioData);
                                    const data16 = new Int16Array(rawBytes.buffer);
                                    const float32 = new Float32Array(data16.length);
                                    for (let i = 0; i < data16.length; i++) {
                                        float32[i] = data16[i] / 32768.0;
                                    }

                                    const buffer = outputContextRef.current.createBuffer(1, float32.length, 24000);
                                    buffer.getChannelData(0).set(float32);

                                    const source = outputContextRef.current.createBufferSource();
                                    source.buffer = buffer;
                                    source.connect(outputContextRef.current.destination);

                                    const currentTime = outputContextRef.current.currentTime;
                                    
                                    if (nextStartTimeRef.current < currentTime) {
                                        nextStartTimeRef.current = currentTime + PLAYBACK_LOOKAHEAD;
                                    }

                                    const startTime = nextStartTimeRef.current;
                                    source.start(startTime);
                                    
                                    nextStartTimeRef.current = startTime + buffer.duration;
                                    
                                    activeSourcesRef.current.add(source);
                                    source.onended = () => {
                                        activeSourcesRef.current.delete(source);
                                        if (activeSourcesRef.current.size === 0) {
                                            nextStartTimeRef.current = 0;
                                        }
                                    };
                                } catch (e) {
                                    console.error("Audio Decode Error", e);
                                }
                            }

                            if (message.serverContent?.interrupted) {
                                activeSourcesRef.current.forEach(src => {
                                    try { src.stop(); } catch(e){}
                                });
                                activeSourcesRef.current.clear();
                                nextStartTimeRef.current = 0; 
                            }
                        },
                        onerror: (err) => {
                            console.error("Gemini Live Error:", err);
                            setErrorMessage("Connection lost.");
                            setStatus('error');
                        },
                        onclose: () => {
                            console.log("Gemini Live Closed");
                        }
                    }
                });
                
            } catch (error) {
                console.error("Init Error:", error);
                setErrorMessage("Failed to start session.");
                setStatus('error');
            }
        };

        startSession();

        return () => {
            mounted = false;
            if (processorRef.current) {
                processorRef.current.disconnect();
                processorRef.current.onaudioprocess = null;
            }
            if (sourceRef.current) sourceRef.current.disconnect();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (inputContextRef.current) inputContextRef.current.close();
            if (outputContextRef.current) outputContextRef.current.close();
        };
    }, [onClose, navigate]);

    const scale = 1 + Math.min(volume * 6, 0.7);
    const glowOpacity = Math.min(volume * 3, 0.9) + 0.1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102022]/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
            <div className="relative w-full max-w-md p-8 flex flex-col items-center gap-10">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Web-Grounding & App Control Active
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">CareBot Expert</h2>
                    <p className={`font-bold uppercase tracking-[0.2em] text-[10px] transition-colors duration-300 ${isUserTalking ? 'text-primary' : 'text-white/40'}`}>
                        {status === 'connecting' ? 'Calibrating...' : status === 'error' ? 'Error' : isUserTalking ? 'Listening Carefully' : 'Listening...'}
                    </p>
                </div>

                <div className="relative w-56 h-56 flex items-center justify-center">
                    <div 
                        className={`absolute inset-0 rounded-full border border-primary/20 transition-all duration-300 ease-out ${isUserTalking ? 'scale-125' : ''}`}
                        style={{ transform: `scale(${scale * 1.3})`, opacity: glowOpacity * 0.4 }}
                    ></div>
                    <div 
                        className={`absolute inset-8 rounded-full border border-primary/40 transition-all duration-200 ease-out ${isUserTalking ? 'scale-110' : ''}`}
                        style={{ transform: `scale(${scale * 1.15})`, opacity: glowOpacity * 0.6 }}
                    ></div>
                    
                    <div 
                        className={`w-32 h-32 rounded-full bg-gradient-to-br from-primary to-[#20b8c5] shadow-[0_0_80px_rgba(43,222,238,0.5)] flex items-center justify-center transition-all duration-200 ${status === 'connecting' ? 'animate-pulse scale-90' : ''} ${isUserTalking ? 'shadow-[0_0_120px_rgba(43,222,238,0.8)]' : ''}`}
                        style={{ transform: `scale(${scale})` }}
                    >
                        <span className={`material-symbols-outlined text-4xl text-[#102022] transition-transform duration-300 ${isUserTalking ? 'scale-110' : 'scale-100'}`}>
                            {isUserTalking ? 'graphic_eq' : 'mic'}
                        </span>
                    </div>

                    {status === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-full backdrop-blur-sm text-center p-6 z-20">
                            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">warning</span>
                            <p className="text-white text-sm font-bold">{errorMessage}</p>
                            <button onClick={onClose} className="mt-4 text-xs text-primary font-black uppercase">Close</button>
                        </div>
                    )}
                </div>

                {/* Search Sources Display */}
                {sources.length > 0 && (
                    <div className="w-full max-h-32 overflow-y-auto bg-white/5 rounded-xl border border-white/10 p-4 scrollbar-hide animate-[fadeIn_0.3s_ease-out]">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">search</span>
                            Sources found
                        </h4>
                        <div className="flex flex-col gap-2">
                            {sources.map((source, i) => (
                                <a 
                                    key={i} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-white/60 hover:text-primary truncate transition-colors border-b border-white/5 pb-1"
                                >
                                    {source.title || source.uri}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
                    <div className="flex items-center gap-4 w-full">
                         <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden relative">
                            <div 
                                className="absolute inset-y-0 left-0 bg-primary transition-all duration-75"
                                style={{ width: `${Math.min(volume * 1000, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="w-14 h-14 rounded-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 border border-white/10 hover:border-red-500/50 flex items-center justify-center transition-all group"
                    >
                        <span className="material-symbols-outlined text-2xl group-hover:scale-90 transition-transform">close</span>
                    </button>
                    
                    <p className="text-white/30 text-[11px] text-center font-medium leading-relaxed">
                        I can search the web and navigate the app to help you manage your post-transplant health.
                    </p>
                </div>
            </div>
        </div>
    );
};
