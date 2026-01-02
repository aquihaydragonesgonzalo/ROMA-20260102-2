import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { CheckCircle2, Circle, MapPin, AlertTriangle, Clock, ArrowRight, ExternalLink, Navigation, AlertCircle, Headphones } from 'lucide-react';
import { calculateDuration, calculateTimeProgress } from '../services/utils';

interface TimelineProps {
  itinerary: Activity[];
  onToggleComplete: (id: string) => void;
  onLocate: (coords: { lat: number, lng: number }, endCoords?: { lat: number, lng: number }) => void;
  userLocation: { lat: number, lng: number } | null;
  onOpenAudioGuide: (act: Activity) => void;
}

const Timeline: React.FC<TimelineProps> = ({ itinerary, onToggleComplete, onLocate, userLocation, onOpenAudioGuide }) => {
  // Estado para forzar re-render cada minuto y actualizar las barras de progreso
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
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">Real-Time Sync</span>
      </div>
      
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
        {itinerary.map((act, idx) => {
          const prevAct = idx > 0 ? itinerary[idx - 1] : null;
          const gap = prevAct ? calculateGap(prevAct.endTime, act.startTime) : 0;
          const isCritical = act.notes === 'CRITICAL';
          const duration = calculateDuration(act.startTime, act.endTime);
          
          // Cálculo de progreso para actividad e intervalo
          const actProgress = calculateTimeProgress(act.startTime, act.endTime);
          const gapProgress = prevAct ? calculateTimeProgress(prevAct.endTime, act.startTime) : 0;
          
          return (
            <React.Fragment key={act.id}>
              {gap > 0 && prevAct && (
                <div className="relative ml-0 my-8">
                    <div className="absolute left-[-2px] top-[-20px] bottom-[-20px] border-l-2 border-dashed border-slate-300"></div>
                    <div className="ml-6 flex items-center">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-slate-100 flex flex-col shadow-sm w-full max-w-[240px]">
                            <div className="flex items-center mb-2">
                                <div className="bg-slate-100 p-1.5 rounded-full mr-3 border border-slate-200">
                                    <Clock size={12} className="text-slate-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Intervalo</span>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                                        {formatMinutes(gap)} — {gap > 30 ? 'Tiempo Libre' : 'Traslado'}
                                    </span>
                                </div>
                            </div>
                            {/* Progress Bar del Intervalo */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-slate-400 transition-all duration-1000" 
                                    style={{ width: `${gapProgress}%` }}
                                ></div>
                            </div>
                        </div>
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

                <div className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${getStatusColor(act)} ${act.completed ? 'opacity-70' : 'shadow-md'}`}>
                    {/* Progress Bar de la Actividad */}
                    <div className="w-full h-1.5 bg-slate-50 overflow-hidden">
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
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {duration}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 leading-tight">{act.title}</h3>
                        </div>
                        {isCritical && <AlertTriangle className="text-red-500 animate-pulse" size={20} />}
                        </div>

                        <div className="mb-3 text-sm text-gray-600 flex items-center flex-wrap gap-1">
                            <span className="font-medium flex items-center">
                                <MapPin size={14} className="mr-0.5 text-red-500"/> 
                                {act.locationName}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 leading-relaxed whitespace-pre-line">{act.description}</p>
                        
                        <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 italic border-l-4 border-red-500 mb-4 shadow-inner">
                        "{act.keyDetails}"
                        </div>

                        {act.contingencyNote && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-3 flex items-start gap-2 shadow-sm">
                                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-tighter mb-1">AVISO DE CONTINGENCIA</p>
                                    <p className="text-[11px] text-amber-950 font-medium leading-tight">{act.contingencyNote}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-4 border-t border-slate-50">
                            <button 
                                onClick={() => onLocate(act.coords, act.endCoords)}
                                className="flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-3 py-2 rounded-xl border border-red-100 hover:bg-red-100 shadow-sm transition-colors"
                            >
                                <Navigation size={12} className="mr-1.5" />
                                UBICACIÓN
                            </button>
                            
                            {act.audioGuideText && (
                                <button 
                                    onClick={() => onOpenAudioGuide(act)}
                                    className="flex items-center text-[10px] font-bold text-white bg-red-800 px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
                                >
                                    <Headphones size={12} className="mr-1.5" />
                                    AUDIOGUÍA
                                </button>
                            )}
                            
                            {act.googleMapsUrl && (
                                <a 
                                href={act.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-[10px] font-bold text-white bg-emerald-600 px-3 py-2 rounded-xl shadow-sm hover:bg-emerald-700"
                                >
                                <ExternalLink size={12} className="mr-1.5" />
                                GOOGLE MAPS
                                </a>
                            )}
                            
                            <div className="ml-auto">
                                <button
                                onClick={() => onToggleComplete(act.id)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    act.completed 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-red-800 text-white shadow-md active:scale-95'
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