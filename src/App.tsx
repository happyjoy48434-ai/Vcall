/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type ReactNode, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Sparkles, 
  MoreHorizontal, 
  Settings, 
  ShieldCheck,
  Cpu,
  Waves,
  Ghost,
  Bot,
  MessageSquare,
  X,
  Send,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askAura, generateAuraVoice } from './services/aiService';

// --- Types ---
type Filter = {
  id: string;
  name: string;
  image: string;
  type: 'face' | 'voice';
  icon?: ReactNode;
};

// --- Constants ---
const FILTERS: Filter[] = [
  {
    id: 'cyber',
    name: 'Cyber',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBspYuJ71jHkO1_7eEVrZishJFLVxjRsTDGx71y1rziDDHbujMjWD2o03-3AD9ktHkn-DY46KVHrcBsiGqCTWNHoOeRpCdaotPh6AcaBYPiKg8k_i_ei0_uD74IiMduYauO5yx7VkNDaw1Z8-h_tsJGP2zjTdM_djsqe5QHWMaN9LLFhubWVYEgmqFcl4QSKsGNiqyk47j0b8H_8y0Zk7NG46eFYAzgR5T-Lsd6ieGoElftgDrrv8YFNFRL5CtPtamMYJMKz4w1cas',
    type: 'face'
  },
  {
    id: 'classic',
    name: 'Classic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-y39_eyDAdEFifGzYtcwR57IPX3ZOpLg1n13JPKVI43G1aHb8hMPT7pCIzjpS_mBBTeG79EUJ99hIpTCYUznS7gwg9T8gBv2FfSHyhkoB0dmOVgb5flF0DVx_hkHw_T3vYMmFtm_bYLMrFGW9kdenOFOwcoMHXkTpspn_mRyBeMWwCNjNCqZTehlxixZogOXsBX3un5AfKqpawiwmi4AtRcIGjD4shnoGeNc2p9KbssQz9lUSArJAWo4aH73YFQtHCiAHtccOxeE',
    type: 'face'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl9X2r9vQ9KIGx8L0NKl30UhqNIFA7ngFZrSWVGNMU8Q24DbdHstz0S3UtjonvROw4wzv-RnKWAgR7DDe5ziy-Rvh3aBBOeGaoCIN-aKdlN-q1kh9egH3BgnBevCtUofo87Xv-tNu755T54CkXptffhmFjSgMT20KHD0xRDPKjPRhDiNME6l-vyr20qp1Z78hToIzuwfuH9ojNS0vhWJCgKOV7iprq6lwYROqATqWYi5NX4DpujmB63GoWwaEreoXJBLAISK2FMzc',
    type: 'face'
  },
  {
    id: 'synthesized',
    name: 'Synthesized',
    image: '',
    type: 'voice',
    icon: <Bot className="w-8 h-8 text-tertiary" />
  },
  {
    id: 'echo',
    name: 'Echo',
    image: '',
    type: 'voice',
    icon: <Waves className="w-8 h-8 text-secondary" />
  }
];

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showTransform, setShowTransform] = useState(true);
  const [activeFilter, setActiveFilter] = useState('cyber');
  const [isCallActive, setIsCallActive] = useState(true);
  
  // Assistant State
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'aura', text: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAskAura = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg = { role: 'user' as const, text };
    setChatHistory(prev => [...prev, newUserMsg]);
    setAssistantMessage('');
    setIsAssistantThinking(true);

    const response = await askAura(text);
    setIsAssistantThinking(false);
    
    if (response) {
      const auraMsg = { role: 'aura' as const, text: response };
      setChatHistory(prev => [...prev, auraMsg]);
      
      // Generate and play voice
      const audioData = await generateAuraVoice(response);
      if (audioData) {
        const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
      }
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition for demo purposes if real API isn't used
      setTimeout(() => {
        setIsListening(false);
        handleAskAura("Summarize the call highlights.");
      }, 3000);
    }
  };

  if (!isCallActive) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-on-surface">
        <h1 className="font-headline text-4xl mb-4 text-primary">Call Ended</h1>
        <button 
          onClick={() => setIsCallActive(true)}
          className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 transition-all"
        >
          Restart Call
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* --- Full Screen Video Feed --- */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1ZLuHYtgqUiwQoBlNFdFbYw1bejwYfxoZiAu3dSRtehWLtBBwccpZsNYaOtSQDt93VctMFOS-mpbIlX-NHbPQuKGOhAYK5zaEaqLH_6uX-tIql-NdcwuQexYRR3Pgh4XI6uM_AV0iZFMg38MESDXccpbotzrMePx1h-t3UkhwiuEcBp0NNRjEQbdproB393ZDph6dcJpH4N_cLoFFtzCEfT-Vp1ympgVwfTVlAEWcSG8qkEpZwjzF5oeRerKzE8sXk1F9OeS8fU4" 
          alt="Remote Participant"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/80" />
      </div>

      {/* --- Top App Bar --- */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXacKLkZXAWZMKgdP5F3cQKf8UNVx8SqYSeQ_Nz1_YRHSgw6qmra8T6ESJd02y79lOJTavxkMJmiRc_sGQ-L0PyFqsGCphU0Y4L2WnytLpnvFeMTPL_KMcTRaXLEg4fZ8YCcYke01FRjJL257JVQoBHn-3NQigDY84Y-CbLwUAImp5X_0u7GBKWEUD1ajFWefKwgDd6mAlhw1iCh87s94tA059MF111wTgPnGJC-akuAkQKRZi46fanJqoYm5akHv-7s9mv5mEE8w" 
              alt="User Profile"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="font-headline tracking-tighter text-2xl font-bold text-primary-fixed drop-shadow-[0_0_8px_rgba(0,222,236,0.5)]">
            AURA
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">
          <ShieldCheck className="w-4 h-4 text-tertiary fill-tertiary/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
            End-to-End Encrypted
          </span>
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-full text-outline-variant hover:bg-surface-container-high hover:text-primary transition-all duration-300">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* --- Picture in Picture (Self Feed) --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="fixed top-24 right-6 z-40 w-40 aspect-[9/16] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
      >
        <img 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTX_yqSFbxFW0PgPMESn2So943t6jEtpZv1Ba6-BHNbTcF1yNMeRdiOGgm3RjGcqOriDpL94ooR1VSg-DMe4SYlJ4XJJcz23499CeMuTcBv3roFrLxCwflKyh4u_TqYVWuotNEwxz2rlr9dLNqU_Qh8W6xOncUurN59_-Kpbs9-KpXLuHdNhehgv7zBPkzBVJsUroWOD6RW6zDTDgczxRLD5hyf8LstEowbskZOUm1FMeLoF1USZwc5_v370aU2a57dzkvXK_IQp4" 
          alt="Self Feed"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 glass px-2 py-1 rounded-md">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live</span>
        </div>
      </motion.div>

      {/* --- AURA Assistant Orb --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-32 right-6 z-50 w-14 h-14 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(143,245,255,0.3)] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-tertiary/20 animate-pulse" />
        <Bot className={`w-7 h-7 text-primary transition-all duration-500 ${showAssistant ? 'rotate-180 scale-0' : 'scale-100'}`} />
        <X className={`absolute w-7 h-7 text-primary transition-all duration-500 ${showAssistant ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`} />
      </motion.button>

      {/* --- Assistant Panel --- */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-48 right-6 z-50 w-80 h-[450px] glass rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-headline text-sm font-bold tracking-wider text-primary">AURA INTELLIGENCE</span>
              </div>
              <button onClick={() => setChatHistory([])} className="text-on-surface-variant hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                  <Bot className="w-12 h-12 text-primary/40" />
                  <p className="text-xs font-label px-6">
                    I am AURA. How can I assist your communication today?
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs font-label ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-surface-container-highest/60 text-on-surface border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isAssistantThinking && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-highest/60 p-3 rounded-xl border border-white/5 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-container/40 border-t border-white/5">
              <div className="relative flex items-center gap-2">
                <button 
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isListening ? 'bg-error text-white animate-pulse' : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {isListening ? <Waves className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input 
                  type="text" 
                  value={assistantMessage}
                  onChange={(e) => setAssistantMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAura(assistantMessage)}
                  placeholder={isListening ? "Listening..." : "Ask AURA..."}
                  className="flex-1 bg-surface-container-high border-none rounded-full px-4 py-2 text-xs font-label focus:ring-1 focus:ring-primary/40 outline-none"
                />
                <button 
                  onClick={() => handleAskAura(assistantMessage)}
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} hidden />

      {/* --- AI Transform Modal --- */}
      <AnimatePresence>
        {showTransform && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-36 left-1/2 z-50 w-full max-w-2xl px-6"
          >
            <div className="glass rounded-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-secondary font-headline font-medium tracking-wide flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  AI Transform Engine
                </h3>
                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase">
                  Active
                </span>
              </div>

              {/* Preview Carousel */}
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar mask-fade">
                {FILTERS.map((filter) => (
                  <button 
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className="flex-shrink-0 group cursor-pointer flex flex-col items-center"
                  >
                    <div className={`w-20 h-20 rounded-lg overflow-hidden mb-2 transition-all duration-300 ${
                      activeFilter === filter.id 
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container scale-105' 
                        : 'ring-1 ring-white/10 opacity-60 hover:opacity-100'
                    } flex items-center justify-center bg-surface-container-highest`}>
                      {filter.image ? (
                        <img 
                          className="w-full h-full object-cover" 
                          src={filter.image} 
                          alt={filter.name}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        filter.icon
                      )}
                    </div>
                    <p className={`text-[10px] text-center font-bold uppercase ${
                      activeFilter === filter.id ? 'text-primary' : 'text-on-surface-variant'
                    }`}>
                      {filter.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Floating Call Controls --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6">
        <div className="glass rounded-full py-4 px-8 flex justify-around items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5">
          {/* Mute Toggle */}
          <ControlBtn 
            icon={isMuted ? <MicOff /> : <Mic />} 
            label={isMuted ? "Unmute" : "Mute"} 
            onClick={() => setIsMuted(!isMuted)}
            active={isMuted}
          />
          
          {/* Video Toggle */}
          <ControlBtn 
            icon={isVideoOff ? <VideoOff /> : <Video />} 
            label={isVideoOff ? "Start" : "Stop"} 
            onClick={() => setIsVideoOff(!isVideoOff)}
            active={isVideoOff}
          />

          {/* End Call */}
          <button 
            onClick={() => setIsCallActive(false)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 rounded-full bg-error flex items-center justify-center text-on-error shadow-[0_0_20px_rgba(255,113,108,0.3)] transition-all duration-300 hover:scale-110 active:scale-95">
              <PhoneOff className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-error">End</span>
          </button>

          {/* AI Transform Button */}
          <button 
            onClick={() => setShowTransform(!showTransform)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(172,138,255,0.4)] transition-all duration-500 hover:rotate-12 ${
              showTransform ? 'bg-gradient-to-tr from-secondary to-tertiary' : 'bg-surface-container-high'
            }`}>
              <Sparkles className={`w-5 h-5 ${showTransform ? 'fill-current' : ''}`} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${showTransform ? 'text-secondary' : 'text-on-surface-variant'}`}>
              Transform
            </span>
          </button>

          {/* More */}
          <ControlBtn 
            icon={<MoreHorizontal />} 
            label="More" 
            onClick={() => {}} 
          />
        </div>
      </div>
    </div>
  );
}

function ControlBtn({ 
  icon, 
  label, 
  onClick, 
  active = false 
}: { 
  icon: ReactNode; 
  label: string; 
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-surface-bright group-active:scale-90 ${
        active ? 'bg-error/20 text-error' : 'bg-surface-container-high text-on-surface'
      }`}>
        {icon}
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-widest ${
        active ? 'text-error' : 'text-on-surface-variant'
      }`}>
        {label}
      </span>
    </button>
  );
}
