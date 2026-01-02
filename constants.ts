
import { Activity, Pronunciation, Coordinates } from './types.ts';

export const SHIP_DEPARTURE_TIME = "19:00";
export const SHIP_ONBOARD_TIME = "18:30";

export const COORDS = {
    CIVITAVECCHIA_DOCK: { lat: 42.097499, lng: 11.788778 },
    COLOSSEO: { lat: 41.890246, lng: 12.492374 },
    TREVI: { lat: 41.9009, lng: 12.4833 },
    VATICANO: { lat: 41.9022, lng: 12.4539 }
};

// --- Missing exports required by Map.tsx ---
export const ROMAN_WALK_TRACK: [number, number][] = [
    [41.890246, 12.492374], // Colosseo
    [41.8945, 12.4830],    // Piazza Venezia
    [41.8986, 12.4769],    // Pantheon
    [41.9009, 12.4833]     // Trevi
];

export const GPX_WAYPOINTS = [
    { lat: 41.890246, lng: 12.492374, name: 'Colosseo' },
    { lat: 41.9009, lng: 12.4833, name: 'Fontana di Trevi' },
    { lat: 41.9022, lng: 12.4539, name: 'Vaticano' }
];

export const PRONUNCIATIONS: (Pronunciation & { category: string })[] = [
    // Saludos y Cortesía
    { category: 'Saludos', word: 'Buongiorno', phonetic: "Bwon-jor-no", simplified: 'Bwon-yor-no', meaning: 'Buenos días' },
    { category: 'Saludos', word: 'Buonasera', phonetic: "Bwo-na-se-ra", simplified: 'Bwo-na-se-ra', meaning: 'Buenas tardes' },
    { category: 'Saludos', word: 'Ciao', phonetic: "Chao", simplified: 'Chao', meaning: 'Hola / Adiós' },
    { category: 'Saludos', word: 'Per favore', phonetic: "Per fa-vo-re", simplified: 'Per fa-bo-re', meaning: 'Por favor' },
    { category: 'Saludos', word: 'Grazie', phonetic: "Grat-zye", simplified: 'Grat-sie', meaning: 'Gracias' },
    { category: 'Saludos', word: 'Prego', phonetic: "Pre-go", simplified: 'Pre-go', meaning: 'De nada / Adelante' },
    { category: 'Saludos', word: 'Scusi', phonetic: "Sku-zi", simplified: 'Sku-si', meaning: 'Perdone (formal)' },
    
    // Restaurante
    { category: 'Comida', word: 'Il conto, per favore', phonetic: "Il kon-to per fa-vo-re", simplified: 'Il kon-to per fa-bo-re', meaning: 'La cuenta, por favor' },
    { category: 'Comida', word: 'Dov\'è il baño?', phonetic: "Do-ve il ba-nyo", simplified: 'Do-be il ba-nyo', meaning: '¿Dónde está el baño?' },
    { category: 'Comida', word: 'Un gelato, per favore', phonetic: "Un je-la-to", simplified: 'Un ye-la-to', meaning: 'Un helado, por favor' },
    { category: 'Comida', word: 'Acqua naturale', phonetic: "Ak-kwa", simplified: 'A-kwa na-tu-ra-le', meaning: 'Agua sin gas' },
    { category: 'Comida', word: 'Vino rosso', phonetic: "Vi-no ros-so", simplified: 'Bi-no ro-so', meaning: 'Vino tinto' },
    { category: 'Comida', word: 'Posso pagare con carta?', phonetic: "Pos-so pa-ga-re", simplified: 'Po-so pa-ga-re kon kar-ta', meaning: '¿Puedo pagar con tarjeta?' },
    
    // Transporte
    { category: 'Transporte', word: 'Quanto costa?', phonetic: "Kwan-to kos-ta", simplified: 'Kwan-to kos-ta', meaning: '¿Cuánto cuesta?' },
    { category: 'Transporte', word: 'Un biglietto per Roma', phonetic: "Un bi-lye-to", simplified: 'Un bi-lye-to per Ro-ma', meaning: 'Un billete para Roma' },
    { category: 'Transporte', word: 'Dov\'è la stazione?', phonetic: "Do-ve la sta-tsio-ne", simplified: 'Do-be la sta-tsio-ne', meaning: '¿Dónde está la estación?' },
    { category: 'Transporte', word: 'Binario', phonetic: "Bi-na-rio", simplified: 'Bi-na-rio', meaning: 'Vía / Andén' },
    
    // Emergencias
    { category: 'Emergencia', word: 'Parla spagnolo?', phonetic: "Par-la spa-nyo-lo", simplified: 'Par-la spa-nyo-lo', meaning: '¿Habla español?' },
    { category: 'Emergencia', word: 'Non capisco', phonetic: "Non ka-pis-ko", simplified: 'Non ka-pis-ko', meaning: 'No entiendo' },
    { category: 'Emergencia', word: 'Aiuto!', phonetic: "A-yu-to", simplified: 'A-yu-to', meaning: '¡Ayuda!' },
    { category: 'Emergencia', word: 'Ho perso il treno', phonetic: "O per-so il tre-no", simplified: 'O per-so il tre-no', meaning: 'He perdido el tren' }
];

export const INITIAL_ITINERARY: Activity[] = [
    { 
      id: '1', title: 'Desembarque', startTime: '07:00', endTime: '07:30', 
      locationName: 'Muelle Civitavecchia', coords: COORDS.CIVITAVECCHIA_DOCK, 
      description: 'Salida rápida del barco para evitar colas.', priceEUR: 0, type: 'logistics', completed: false,
      keyDetails: 'El barco atraca en el muelle de cruceros.'
    },
    { 
      id: '2', title: 'Tren a Roma', startTime: '08:30', endTime: '09:40', 
      locationName: 'Estación Civitavecchia', coords: COORDS.CIVITAVECCHIA_DOCK, 
      description: 'Trayecto en tren regional hacia Termini o San Pietro.', priceEUR: 12, type: 'transport', completed: false,
      keyDetails: 'Ticket BIRG de 12€ incluye todo el transporte en Roma.'
    },
    { 
      id: '3', title: 'Coliseo', startTime: '10:15', endTime: '11:15', 
      locationName: 'Colosseo', coords: COORDS.COLOSSEO, 
      description: 'Visita exterior y fotos del Anfiteatro Flavio.', priceEUR: 0, type: 'sightseeing', completed: false,
      keyDetails: 'Mejor vista desde Via Nicola Salvi.'
    },
    { 
      id: '4', title: 'Fontana di Trevi', startTime: '12:00', endTime: '12:45', 
      locationName: 'Trevi', coords: COORDS.TREVI, 
      description: 'Lanzar moneda y disfrutar de la fuente barroca.', priceEUR: 0, type: 'sightseeing', completed: false,
      keyDetails: '¡Cuidado con los carteristas en esta zona!'
    }
];
