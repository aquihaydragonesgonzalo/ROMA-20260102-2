import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
    CalendarClock, Map as MapIcon, Wallet, BookOpen, Anchor, 
    Headphones, X, Play, Square, Navigation, CheckCircle2, 
    Circle, MapPin, AlertTriangle, Clock, Send, Languages, 
    Volume2, Info, ChevronDown, PhoneCall, Thermometer, AlertCircle
} from 'lucide-react';
import { 
    SHIP_ONBOARD_TIME, INITIAL_ITINERARY, PRONUNCIATIONS, COORDS 
} from './constants.ts';

// --- MAIN APP COMPONENT ---
const App = () => {
    const [activeTab, setActiveTab] = useState('timeline');
    const [itinerary, setItinerary] = useState(INITIAL_ITINERARY);
    const [userLocation, setUserLocation] = useState(null);
    const [mapFocus, setMapFocus] = useState(null);
    const [audioActivity, setAudioActivity] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [countdown, setCountdown] = useState('00h 00m 00s');

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date();
            const [h, m] = SHIP_ONBOARD_TIME.split(':').map(Number);
            target.setHours(h, m, 0, 0);
            const diff = target.getTime() - now.getTime();
            if (diff <= 0) setCountdown("¡A BORDO!");
            else {
                const hrs = Math.floor(diff / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setCountdown(`${hrs.toString().padStart(2,'0')}h ${mins.toString().padStart(2,'0')}m ${secs.toString().padStart(2,'0')}s`);
            }
        }, 1000);

        // Geolocation
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                null,
                { enableHighAccuracy: true }
            );
        }

        // Hide loader
        const loader = document.getElementById('initial-loader');
        if (loader) setTimeout(() => loader.style.display = 'none', 800);

        return () => clearInterval(timer);
    }, []);

    const toggleComplete = (id) => {
        setItinerary(itinerary.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-roma-950 text-white p-4 shadow-xl z-20 flex justify-between items-center shrink-0 border-b border-gold-500/30">
                <div className="flex items-center gap-3">
                    <div className="bg-gold-500 p-2 rounded-xl shadow-lg shadow-gold-500/20">
                        <Anchor className="text-roma-950" size={20} />
                    </div>
                    <div>
                        <h1 className="text-[10px] font-black uppercase tracking-widest text-gold-500 leading-none mb-1">Roma 2026</h1>
                        <p className="text-xs font-bold">Escala Crucerista</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] uppercase font-black text-roma-400 tracking-tighter">Todos a Bordo</p>
                    <p className="text-lg font-mono font-black text-gold-500 leading-none">{countdown}</p>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 relative overflow-hidden">
                {activeTab === 'timeline' && (
                    <div className="h-full overflow-y-auto hide-scrollbar px-5 py-6 space-y-8 max-w-lg mx-auto">
                        <h2 className="text-2xl font-black text-roma-800 uppercase tracking-tighter">Itinerario</h2>
                        <div className="relative border-l-2 border-slate-200 ml-3">
                            {itinerary.map((act) => (
                                <div key={act.id} className="mb-8 ml-6 relative">
                                    <div 
                                        className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-4 cursor-pointer transition-all bg-white z-10 ${act.completed ? 'border-emerald-500' : 'border-roma-800'}`}
                                        onClick={() => toggleComplete(act.id)}
                                    >
                                        {act.completed && <div className="w-full h-full bg-emerald-500 rounded-full scale-50" />}
                                    </div>
                                    <div className={`p-4 rounded-3xl border bg-white shadow-sm transition-all ${act.completed ? 'opacity-50 grayscale' : 'border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-roma-800 bg-roma-50 px-2 py-0.5 rounded-full">{act.startTime} - {act.endTime}</span>
                                            {act.type === 'transport' && <Navigation size={14} className="text-roma-400" />}
                                        </div>
                                        <h3 className="font-bold text-base text-slate-800 mb-1">{act.title}</h3>
                                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{act.description}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setMapFocus(act.coords); setActiveTab('map'); }}
                                                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
                                            >
                                                <MapPin size={12} /> MAPA
                                            </button>
                                            <button 
                                                onClick={() => toggleComplete(act.id)}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold ${act.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-roma-800 text-white'}`}
                                            >
                                                {act.completed ? 'HECHO' : 'CHECK'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'map' && <div id="map-container" className="h-full w-full"></div>}

                {activeTab === 'budget' && (
                    <div className="p-8 max-w-lg mx-auto h-full overflow-y-auto hide-scrollbar">
                        <h2 className="text-2xl font-black text-roma-800 uppercase tracking-tighter mb-6">Gastos</h2>
                        <div className="bg-roma-950 text-white p-8 rounded-[2.5rem] shadow-xl text-center mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Estimado</p>
                            <p className="text-5xl font-black italic">12.00 €</p>
                            <p className="text-[10px] text-roma-400 mt-4 italic font-medium">Ticket BIRG Civitavecchia-Roma</p>
                        </div>
                    </div>
                )}

                {activeTab === 'guide' && <Guide userLocation={userLocation} />}
            </main>

            {/* Navbar */}
            <nav className="bg-white/95 backdrop-blur-md border-t border-slate-100 z-30 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] shrink-0">
                <div className="flex justify-around items-center h-20 px-2">
                    {[
                        { id: 'timeline', icon: CalendarClock, label: 'Itinerario' },
                        { id: 'map', icon: MapIcon, label: 'Mapa' },
                        { id: 'budget', icon: Wallet, label: 'Gastos' },
                        { id: 'guide', icon: BookOpen, label: 'Guía' }
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={`flex flex-col items-center w-full justify-center gap-1 transition-all ${activeTab === tab.id ? 'text-roma-800' : 'text-slate-300'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-roma-50 scale-110' : ''}`}>
                                <tab.icon size={22} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

// --- GUIDE COMPONENT ---
const Guide = ({ userLocation }) => {
    const [playing, setPlaying] = useState(null);

    const playAudio = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const ut = new SpeechSynthesisUtterance(word);
            ut.lang = 'it-IT';
            ut.onend = () => setPlaying(null);
            setPlaying(word);
            window.speechSynthesis.speak(ut);
        }
    };

    const handleSOS = () => {
        const msg = userLocation 
            ? `¡SOS! Ayuda en Roma. Ubicación: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
            : `¡SOS! Ayuda en Roma. No puedo obtener GPS.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // Categorize pronunciations
    const categorized = useMemo(() => {
        const cats = {};
        PRONUNCIATIONS.forEach(p => {
            if (!cats[p.category]) cats[p.category] = [];
            cats[p.category].push(p);
        });
        return cats;
    }, []);

    return (
        <div className="pb-32 px-5 pt-6 max-w-lg mx-auto h-full overflow-y-auto hide-scrollbar">
            <h2 className="text-2xl font-black text-roma-800 uppercase tracking-tighter mb-6">Guía Roma</h2>

            {/* Emergency SOS */}
            <div className="mb-8 bg-roma-900 rounded-[2.5rem] p-6 shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-500 p-2 rounded-xl animate-pulse">
                            <PhoneCall size={20} />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest">BOTÓN DE SOCORRO</h3>
                    </div>
                    <p className="text-[11px] text-roma-200 mb-6 leading-relaxed">Envía tu ubicación GPS exacta a tus contactos por WhatsApp si te pierdes.</p>
                    <button 
                        onClick={handleSOS}
                        className="w-full py-4 bg-white text-roma-900 font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Send size={16} /> ENVIAR SOS WHATSAPP
                    </button>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-roma-800 mb-2">
                        <AlertCircle size={14} /> <span className="text-[9px] font-black uppercase">Tickets</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Compra el BIRG (12€) en el estanco de Civitavecchia.</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-roma-800 mb-2">
                        <Thermometer size={14} /> <span className="text-[9px] font-black uppercase">Clima</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Abril en Roma es suave, pero fresco por la mañana en puerto.</p>
                </div>
            </div>

            {/* Italian Lexicon */}
            <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tighter flex items-center gap-2">
                <Languages className="text-roma-800" size={20} /> Italiano Básico
            </h3>

            {Object.keys(categorized).map(catName => (
                <div key={catName} className="mb-6">
                    <h4 className="text-[10px] font-black text-roma-400 uppercase tracking-widest mb-3 px-1">{catName}</h4>
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {categorized[catName].map((item) => (
                            <div key={item.word} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-roma-950 text-sm leading-none">{item.word}</p>
                                        <button 
                                            onClick={() => playAudio(item.word)}
                                            className={`p-1.5 rounded-full transition-all ${playing === item.word ? 'bg-roma-100 text-roma-800' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <Volume2 size={12} />
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1 italic">"{item.simplified}"</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-roma-800 bg-roma-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                                        {item.meaning}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);