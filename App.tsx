import React, { useState, useEffect } from 'react';
import { Activity, AppTab, Coordinates } from './types';
import { INITIAL_ITINERARY, SHIP_ONBOARD_TIME } from './constants';
import Timeline from './components/Timeline';
import Budget from './components/Budget';
import Guide from './components/Guide';
import MapComponent from './components/Map';
import { CalendarClock, Map as MapIcon, Wallet, BookOpen, Anchor, Headphones, X, Play, Square } from 'lucide-react';

const STORAGE_KEY = 'roma_guide_v4_storage';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<Activity[]>(INITIAL_ITINERARY);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TIMELINE);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [mapFocus, setMapFocus] = useState<Coordinates | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  
  // Audio Guide State
  const [audioGuideActivity, setAudioGuideActivity] = useState<Activity | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = INITIAL_ITINERARY.map(initItem => {
          const savedItem = parsed.find((p: Activity) => p.id === initItem.id);
          return savedItem ? { ...initItem, completed: savedItem.completed } : initItem;
        });
        setItinerary(merged);
      } catch (e) {
        console.error("Failed to load itinerary", e);
      }
    }
  }, []);

  // Bridge for Map Popups
  useEffect(() => {
    const handleMapAudio = (e: any) => {
      const actId = e.detail;
      const act = itinerary.find(a => a.id === actId);
      if (act && act.audioGuideText) {
        setAudioGuideActivity(act);
      }
    };
    window.addEventListener('open-audio-guide', handleMapAudio);
    return () => window.removeEventListener('open-audio-guide', handleMapAudio);
  }, [itinerary]);

  const handleToggleComplete = (id: string) => {
    const newItinerary = itinerary.map(act => 
      act.id === id ? { ...act, completed: !act.completed } : act
    );
    setItinerary(newItinerary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItinerary));
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        null,
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = SHIP_ONBOARD_TIME.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown("¡EMBARQUE!");
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Formato: 00h 00m 00s con padding
        const hStr = h.toString().padStart(2, '0');
        const mStr = m.toString().padStart(2, '0');
        const sStr = s.toString().padStart(2, '0');
        
        setCountdown(`${hStr}h ${mStr}m ${sStr}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLocate = (coords: Coordinates) => {
    setMapFocus(coords);
    setActiveTab(AppTab.MAP);
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (audioGuideActivity?.audioGuideText) {
      const utterance = new SpeechSynthesisUtterance(audioGuideActivity.audioGuideText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const closeAudioGuide = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setAudioGuideActivity(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="bg-red-950 text-white p-4 shadow-xl z-20 flex justify-between items-center border-b border-red-900/50">
        <div className="flex items-center">
          <Anchor className="mr-3 text-red-500 animate-pulse" size={24} />
          <div>
            <h1 className="font-black text-[10px] uppercase tracking-[0.25em] text-red-400 mb-0.5">Escala Roma</h1>
            <p className="text-[12px] font-bold tracking-tight text-white/90">A Bordo: {SHIP_ONBOARD_TIME}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black uppercase text-red-500 tracking-widest mb-0.5">Límite</span>
          <div className="text-lg font-black font-mono text-red-400 tracking-tighter tabular-nums leading-none">{countdown}</div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === AppTab.TIMELINE && (
          <div className="h-full overflow-y-auto no-scrollbar">
             <Timeline 
               itinerary={itinerary} 
               onToggleComplete={handleToggleComplete}
               onLocate={handleLocate}
               userLocation={userLocation}
               onOpenAudioGuide={(act) => setAudioGuideActivity(act)}
             />
          </div>
        )}
        
        {activeTab === AppTab.MAP && (
          <MapComponent 
            activities={itinerary} 
            userLocation={userLocation}
            focusedLocation={mapFocus}
          />
        )}

        {activeTab === AppTab.BUDGET && <Budget itinerary={itinerary} />}
        {activeTab === AppTab.GUIDE && <Guide userLocation={userLocation} />}
        
        {/* Modal Audioguía - Diseño Premium */}
        {audioGuideActivity && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
              <div className="p-6 bg-red-950 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2 rounded-full">
                    <Headphones size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-red-400">Guía de Audio</h3>
                    <h2 className="font-bold text-lg leading-tight">{audioGuideActivity.title}</h2>
                  </div>
                </div>
                <button onClick={closeAudioGuide} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium border-b border-slate-50">
                {audioGuideActivity.audioGuideText}
              </div>
              <div className="p-8 bg-slate-50 shrink-0 flex items-center gap-6">
                 <button 
                  onClick={toggleSpeech} 
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${isPlaying ? 'bg-red-100 text-red-600 ring-4 ring-red-200' : 'bg-red-800 text-white hover:bg-red-900'}`}
                 >
                   {isPlaying ? <Square size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                 </button>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isPlaying ? 'Escuchando ahora...' : 'Pulsa para reproducir'}</p>
                    <p className="text-xs font-bold text-slate-800 tracking-tight">Voz: Español (Castellano)</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="bg-white/90 backdrop-blur-md border-t border-slate-100 z-30 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center h-20 px-2">
          {[
            { id: AppTab.TIMELINE, icon: CalendarClock, label: 'Itinerario' },
            { id: AppTab.MAP, icon: MapIcon, label: 'Mapa' },
            { id: AppTab.BUDGET, icon: Wallet, label: 'Gastos' },
            { id: AppTab.GUIDE, icon: BookOpen, label: 'Guía' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center w-full h-full justify-center transition-all ${activeTab === tab.id ? 'text-red-800' : 'text-slate-400'}`}>
              <div className={`p-2 rounded-2xl mb-1 transition-colors ${activeTab === tab.id ? 'bg-red-50 shadow-inner' : 'bg-transparent'}`}>
                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;