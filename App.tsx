import React, { useState, useEffect } from 'react';
import { Activity, AppTab, Coordinates } from './types.ts';
import { INITIAL_ITINERARY, SHIP_ONBOARD_TIME } from './constants.ts';
import Timeline from './components/Timeline.tsx';
import Budget from './components/Budget.tsx';
import Guide from './components/Guide.tsx';
import MapComponent from './components/Map.tsx';
import { CalendarClock, Map as MapIcon, Wallet, BookOpen, Anchor, Headphones, X, Play, Square } from 'lucide-react';

const STORAGE_KEY = 'roma_guide_v6_storage';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<Activity[]>(INITIAL_ITINERARY);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TIMELINE);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [mapFocus, setMapFocus] = useState<Coordinates | null>(null);
  const [countdown, setCountdown] = useState<string>('00h 00m 00s');
  
  // Audio Guide State
  const [audioGuideActivity, setAudioGuideActivity] = useState<Activity | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = INITIAL_ITINERARY.map(initItem => {
          const savedItem = parsed.find((p: Activity) => p.id === initItem.id);
          return savedItem ? { ...initItem, completed: savedItem.completed } : initItem;
        });
        setItinerary(merged);
      }
    } catch (e) {
      console.warn("Storage fallido, usando valores por defecto", e);
    }
  }, []);

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
        (err) => console.log("Geolocalización no disponible", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
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
        setCountdown("¡A BORDO!");
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
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

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="bg-red-950 text-white p-4 shadow-xl z-20 flex justify-between items-center shrink-0">
        <div className="flex items-center">
          <Anchor className="mr-3 text-red-500" size={24} />
          <div>
            <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-red-400">Escala Roma</h1>
            <p className="text-[12px] font-bold text-white/90">MSC Explorer 2026</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">Cuenta atrás</span>
          <div className="text-lg font-black font-mono text-red-400 leading-none">{countdown}</div>
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
        
        {/* Modal Audioguía */}
        {audioGuideActivity && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 bg-red-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Headphones size={24} className="text-red-400" />
                  <h2 className="font-bold text-lg">{audioGuideActivity.title}</h2>
                </div>
                <button onClick={() => { window.speechSynthesis.cancel(); setAudioGuideActivity(null); setIsPlaying(false); }} className="p-2 bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                {audioGuideActivity.audioGuideText}
              </div>
              <div className="p-8 bg-slate-50 flex items-center gap-6">
                 <button 
                  onClick={toggleSpeech} 
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-red-800 text-white'}`}
                 >
                   {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                 </button>
                 <p className="text-xs font-bold text-slate-800 tracking-tight">{isPlaying ? 'Reproduciendo...' : 'Pulsa para escuchar la guía'}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="bg-white/95 backdrop-blur-md border-t border-slate-100 z-30 shrink-0">
        <div className="flex justify-around items-center h-20 px-2 pb-safe">
          {[
            { id: AppTab.TIMELINE, icon: CalendarClock, label: 'Itinerario' },
            { id: AppTab.MAP, icon: MapIcon, label: 'Mapa' },
            { id: AppTab.BUDGET, icon: Wallet, label: 'Gastos' },
            { id: AppTab.GUIDE, icon: BookOpen, label: 'Guía' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center w-full justify-center ${activeTab === tab.id ? 'text-red-800' : 'text-slate-400'}`}>
              <div className={`p-2 rounded-xl mb-1 ${activeTab === tab.id ? 'bg-red-50' : ''}`}>
                <tab.icon size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;