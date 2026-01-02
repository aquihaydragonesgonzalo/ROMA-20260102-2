import React, { useState, useEffect } from 'react';
import { Activity } from '../types.ts';
import { CheckCircle2, Circle, MapPin, AlertTriangle, Clock, ExternalLink, Navigation, AlertCircle, Headphones } from 'lucide-react';
import { calculateDuration, calculateTimeProgress } from '../services/utils.ts';

interface TimelineProps {
  itinerary: Activity[];
  onToggleComplete: (id: string) => void;
  onLocate: (coords: { lat: number, lng: number }, endCoords?: { lat: number, lng: number }) => void;
  userLocation: { lat: number, lng: number } | null;
  onOpenAudioGuide: (act: Activity) => void;
}

const Timeline: React.FC<TimelineProps> = ({ itinerary, onToggleComplete, onLocate, userLocation, onOpenAudioGuide }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateGap = (endStrPrev: string, startStrNext: string) => {
    const [endH, endM] = endStrPrev.split(':').map(Number);
    const [startH, startM] = startStrNext.split(':').map(Number);
    const diffMins = (startH * 60 + startM) - (endH * 60 + endM);
    return diffMins > 0 ? diffMins : 0;
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m} min`;
  };

  const getStatusColor = (act: Activity) => {
    if (act.completed) return 'border-emerald-500 bg-emerald-50 bg-opacity-30';
    if (act.notes === 'CRITICAL') return 'border-red-500 bg-red-50';
    return 'border-slate-100 bg-white';
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-red-800 uppercase tracking-tight">Itinerario Roma</h2>
      </div>
      
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
        {itinerary.map((act, idx) => {
          const prevAct = idx > 0 ? itinerary[idx - 1] : null;
          const gap = prevAct ? calculateGap(prevAct.endTime, act.startTime) : 0;
          const isCritical = act.notes === 'CRITICAL';
          const duration = calculateDuration(act.startTime, act.endTime);
          const actProgress = calculateTimeProgress(act.startTime, act.endTime);
          
          return (
            <React.Fragment key={act.id}>
              {gap > 0 && prevAct && (
                <div className="relative ml-0 my-4">
                    <div className="ml-6 flex items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Intervalo: {formatMinutes(gap)}
                        </span>
                    </div>
                </div>
              )}

              <div className="mb-8 ml-6 relative">
                <div 
                    className={`absolute -left-[31px] top-0 rounded-full bg-white border-2 cursor-pointer transition-all z-10 ${
                    act.completed ? 'border-emerald-500 text-emerald-500 shadow-sm' : 'border-red-600 text-red-600 shadow-sm'
                    }`}
                    onClick={() => onToggleComplete(act.id)}
                >
                    {act.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>

                <div className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${getStatusColor(act)}`}>
                    <div className="w-full h-1 bg-slate-50 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${actProgress === 100 ? 'bg-slate-300' : 'bg-red-600'}`} 
                            style={{ width: `${actProgress}%` }}
                        ></div>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                              <div className="flex items-center space-x-2 mb-2">
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 tracking-tight">
                                  {act.startTime} - {act.endTime}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{duration}</span>
                              </div>
                              <h3 className="font-bold text-lg text-gray-800 leading-tight">{act.title}</h3>
                          </div>
                          {isCritical && <AlertTriangle className="text-red-500 animate-pulse" size={20} />}
                        </div>

                        <p className="text-xs text-gray-500 mb-2 flex items-center">
                          <MapPin size={12} className="mr-1 text-red-500" /> {act.locationName}
                        </p>

                        <p className="text-sm text-gray-600 mb-4">{act.description}</p>
                        
                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 italic border-l-4 border-red-500 mb-4">
                        "{act.keyDetails}"
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-4 border-t border-slate-50">
                            <button 
                                onClick={() => onLocate(act.coords, act.endCoords)}
                                className="flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-3 py-2 rounded-xl border border-red-100"
                            >
                                <Navigation size={12} className="mr-1.5" />
                                MAPA
                            </button>
                            
                            {act.audioGuideText && (
                                <button 
                                    onClick={() => onOpenAudioGuide(act)}
                                    className="flex items-center text-[10px] font-bold text-white bg-red-800 px-3 py-2 rounded-xl shadow-md"
                                >
                                    <Headphones size={12} className="mr-1.5" />
                                    AUDIO
                                </button>
                            )}
                            
                            <div className="ml-auto">
                                <button
                                onClick={() => onToggleComplete(act.id)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                    act.completed 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-red-800 text-white'
                                }`}
                                >
                                {act.completed ? 'Hecho' : 'Check'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;