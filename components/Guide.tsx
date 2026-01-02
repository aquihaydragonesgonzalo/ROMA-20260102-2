import React, { useState } from 'react';
import { PRONUNCIATIONS } from '../constants';
import { Volume2, Thermometer, AlertCircle, ShoppingBag, PhoneCall, Send, Languages } from 'lucide-react';
import { Coordinates } from '../types';

interface GuideProps {
  userLocation: Coordinates | null;
}

const Guide: React.FC<GuideProps> = ({ userLocation }) => {
  const [playing, setPlaying] = useState<string | null>(null);

  const playSimulatedAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'it-IT';
      utterance.rate = 0.85;
      setPlaying(word);
      utterance.onend = () => setPlaying(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlaying(word);
      setTimeout(() => setPlaying(null), 1000);
    }
  };

  const handleSOS = () => {
    const message = userLocation 
      ? `¡SOS! Necesito ayuda en Roma. Mi ubicación actual es: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : `¡SOS! Necesito ayuda en Roma. No puedo obtener mi ubicación GPS en este momento.`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold text-red-800 mb-6 uppercase tracking-tight">Guía Roma</h2>

      {/* SOS SECTION */}
      <div className="mb-8 bg-red-600 rounded-[2rem] p-6 shadow-xl shadow-red-900/20 text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <div className="bg-white/20 p-2 rounded-xl mr-3">
              <PhoneCall size={24} className="text-white animate-pulse" />
            </div>
            <h3 className="font-black text-lg uppercase tracking-widest">EMERGENCIA SOS</h3>
          </div>
          <p className="text-xs text-red-100 mb-6 leading-relaxed font-medium">
            Si te pierdes o necesitas asistencia inmediata, pulsa el botón para enviar tu ubicación GPS por WhatsApp.
          </p>
          <button 
            onClick={handleSOS}
            className="w-full py-4 bg-white text-red-700 font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg uppercase tracking-widest text-sm"
          >
            <Send size={18} />
            Enviar SOS por WhatsApp
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
          <div className="flex items-center mb-3 text-red-800 font-black text-xs uppercase tracking-widest">
             <AlertCircle size={16} className="mr-2 text-red-600"/> Reserva Online
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Reserva tickets (tren, Coliseo) online con antelación. Roma está saturada en 2026.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
          <div className="flex items-center mb-3 text-red-800 font-black text-xs uppercase tracking-widest">
             <Thermometer size={16} className="mr-2 text-red-600"/> El Clima (Abril)
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            La mañana en el puerto es fresca (12°C). En Roma hará calor caminando. Vístete por capas.
          </p>
        </div>
      </div>

      {/* Pronunciation Table */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center uppercase tracking-widest px-1">
        <Languages size={20} className="mr-2.5 text-red-600"/> Italiano Básico
      </h3>
      <div className="bg-white rounded-3xl shadow-md border border-slate-50 overflow-hidden mb-8">
        {PRONUNCIATIONS.map((item, idx) => (
          <div key={item.word} className={`p-5 flex justify-between items-center group ${idx !== PRONUNCIATIONS.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
            <div>
              <div className="flex items-center gap-3">
                <p className="font-black text-red-900 text-lg tracking-tight">{item.word}</p>
                <button 
                  onClick={() => playSimulatedAudio(item.word)}
                  className={`p-2 rounded-full transition-all active:scale-90 ${playing === item.word ? 'bg-red-100 text-red-600 shadow-inner' : 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-400'}`}
                >
                  <Volume2 size={16} className={playing === item.word ? 'animate-pulse' : ''} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic mt-1 font-medium tracking-tight opacity-75">"{item.simplified}"</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block uppercase tracking-widest border border-slate-200">
                {item.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guide;