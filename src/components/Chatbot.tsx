import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Volume2, VolumeX, ImagePlus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

type MessageContent = string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
export type Message = { role: 'user' | 'assistant'; content: MessageContent; imagePreview?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const containsTamil = (text: string): boolean => {
  return /[\u0B80-\u0BFF]/.test(text);
};

const getTextContent = (content: MessageContent): string => {
  if (typeof content === 'string') return content;
  const textPart = content.find(p => p.type === 'text');
  return textPart && 'text' in textPart ? textPart.text : '';
};

const speakText = (text: string, onStart?: () => void, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[•\-\*]/g, '').replace(/\n+/g, '. ').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const isTamil = containsTamil(cleanText);
  utterance.lang = isTamil ? 'ta-IN' : 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(isTamil ? 'ta' : 'en'));
  if (matchingVoice) utterance.voice = matchingVoice;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
};

const formatMessage = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map((line, i) => {
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
    return <p key={i} className={isBullet ? 'pl-2' : ''}>{line}</p>;
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const voicesInitializedRef = useRef(false);
  const recognitionInitializedRef = useRef(false);

  // Load chat history when chat opens and user is authenticated
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadHistory = async () => {
      const history = await chatService.loadChatHistory(user.id);
      setMessages(history);
    };

    loadHistory();
  }, [isOpen, user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Lazy initialize speech synthesis only when chat is opened
  useEffect(() => {
    if (!isOpen || voicesInitializedRef.current) return;
    
    voicesInitializedRef.current = true;
    if ('speechSynthesis' in window) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        });
      } else {
        setTimeout(() => {
          window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }, 500);
      }
    }
  }, [isOpen]);

  // Lazy initialize speech recognition only when chat is opened
  useEffect(() => {
    if (!isOpen || recognitionInitializedRef.current) return;
    
    recognitionInitializedRef.current = true;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) { alert('Speech recognition not supported'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); return; }
    recognitionRef.current.lang = 'ta-IN';
    try { recognitionRef.current.start(); setIsListening(true); } catch {
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.start(); setIsListening(true);
    }
  };

  const toggleSpeak = (index: number, content: MessageContent) => {
    const text = getTextContent(content);
    if (speakingIndex === index) { window.speechSynthesis.cancel(); setSpeakingIndex(null); }
    else speakText(text, () => setSpeakingIndex(index), () => setSpeakingIndex(null));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    const base64 = await fileToBase64(file);
    setPendingImage(base64);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || isLoading) return;

    let userContent: MessageContent;
    let imagePreview: string | undefined;

    if (pendingImage) {
      const parts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [];
      parts.push({ type: 'image_url', image_url: { url: pendingImage } });
      parts.push({ type: 'text', text: text || 'What disease does this plant have? Do you have products to treat it?' });
      userContent = parts;
      imagePreview = pendingImage;
    } else {
      userContent = text;
    }

    const userMsg: Message = { role: 'user', content: userContent, imagePreview };
    setMessages(prev => [...prev, userMsg]);
    
    // Save user message to database
    if (user) {
      await chatService.saveMessage(user.id, userMsg);
    }
    
    setInput('');
    setPendingImage(null);
    setIsLoading(true);

    let assistantContent = '';

    // Build API messages (strip imagePreview field)
    const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Chat response error:', resp.status, errText);
        throw new Error(`Failed: ${resp.status}`);
      }
      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = { role: 'assistant' as const, content: '• மன்னிக்கவும், பிழை ஏற்பட்டது\n• Sorry, something went wrong. Please try again.' };
      setMessages(prev => [...prev, errorMsg]);
      if (user) {
        await chatService.saveMessage(user.id, errorMsg);
      }
    } finally {
      // Save assistant message to database
      if (assistantContent && user) {
        const assistantMsg: Message = { role: 'assistant', content: assistantContent };
        await chatService.saveMessage(user.id, assistantMsg);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageSelect} className="hidden" />

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 z-50 h-16 w-16 rounded-full shadow-2xl bg-primary text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'hidden' : ''}`}
        aria-label="Open chat"
      >
        <MessageCircle className="h-7 w-7" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-2 left-2 sm:left-auto sm:right-4 sm:w-[22rem] z-50 h-[32rem] sm:h-[30rem] bg-background border-2 border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🌾</div>
              <div>
                <h3 className="font-semibold text-base leading-tight">AgriMart Assistant</h3>
                <p className="text-xs opacity-90 mt-0.5">📷 Photo | 🎤 Voice | தமிழ்</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center mt-6 space-y-3 px-4">
                <div className="text-4xl">🌱</div>
                <p className="text-foreground font-semibold text-base">வணக்கம்! Hello!</p>
                <div className="space-y-2">
                  <div className="bg-muted rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                    💬 Ask about products & prices
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                    📷 Upload crop photo for disease check
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                    🎤 Speak in Tamil or English
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-[15px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md space-y-1'
                  }`}
                >
                  {msg.role === 'user' && msg.imagePreview && (
                    <img src={msg.imagePreview} alt="Uploaded crop" className="rounded-xl mb-2 max-h-36 w-auto" />
                  )}
                  {msg.role === 'assistant' ? (
                    <>
                      {formatMessage(getTextContent(msg.content))}
                      <div className="flex justify-end mt-2 pt-1 border-t border-border/50">
                        <button
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-background/50"
                          onClick={() => toggleSpeak(i, msg.content)}
                        >
                          {speakingIndex === i ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          {speakingIndex === i ? 'Stop' : 'Listen'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <span>{getTextContent(msg.content)}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="mb-3 max-w-[85%] mr-auto">
                <div className="flex items-center gap-2 text-muted-foreground text-sm bg-muted p-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing... 🔍</span>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Pending image preview */}
          {pendingImage && (
            <div className="mx-3 mb-1 flex items-center gap-2 bg-muted rounded-xl p-2">
              <img src={pendingImage} alt="Preview" className="h-14 w-14 rounded-lg object-cover border border-border" />
              <span className="text-sm text-muted-foreground flex-1">Image ready ✅</span>
              <button className="h-7 w-7 rounded-full hover:bg-background flex items-center justify-center" onClick={() => setPendingImage(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2.5 border-t border-border/50 bg-background">
            {/* Action buttons row */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 active:scale-95 transition-all text-sm text-muted-foreground disabled:opacity-50"
                title="Take photo"
              >
                <Camera className="h-4 w-4" />
                <span className="text-xs font-medium">Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 active:scale-95 transition-all text-sm text-muted-foreground disabled:opacity-50"
                title="Upload image"
              >
                <ImagePlus className="h-4 w-4" />
                <span className="text-xs font-medium">Gallery</span>
              </button>
              <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full active:scale-95 transition-all text-sm disabled:opacity-50 ${
                  isListening
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="text-xs font-medium">{isListening ? 'Stop' : 'Speak'}</span>
              </button>
            </div>
            {/* Text input row */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isListening ? "🎤 Listening..." : "Type your message..."}
                disabled={isLoading}
                className="flex-1 rounded-full h-11 px-4 text-[15px] border-2 border-border focus-visible:border-primary"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && !pendingImage)}
                className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
