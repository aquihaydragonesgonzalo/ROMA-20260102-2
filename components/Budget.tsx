import React, { useMemo, useState } from 'react';
import { Activity } from '../types';
import { Wallet, TrendingDown, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BudgetProps {
  itinerary: Activity[];
}

const COLORS = ['#2A5B87', '#3A7D44', '#FFB347', '#94a3b8'];

const Budget: React.FC<BudgetProps> = ({ itinerary }) => {
  const [currency, setCurrency] = useState<'EUR' | 'NOK'>('EUR');

  const paidActivities = useMemo(() => itinerary.filter(a => a.priceEUR > 0), [itinerary]);
  
  const total = useMemo(() => {
    return paidActivities.reduce((acc, curr) => acc + (currency === 'EUR' ? curr.priceEUR : curr.priceNOK), 0);
  }, [paidActivities, currency]);

  const chartData = useMemo(() => {
    return paidActivities.map(act => ({
      name: act.title,
      value: currency === 'EUR' ? act.priceEUR : act.priceNOK
    }));
  }, [paidActivities, currency]);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-fjord-500 flex items-center">
          <Wallet className="mr-2" /> Presupuesto
        </h2>
        <div className="flex bg-slate-200 rounded-lg p-1">
          <button 
            className={`px-3 py-1 text-sm rounded-md font-bold transition-colors ${currency === 'EUR' ? 'bg-white shadow text-fjord-600' : 'text-slate-500'}`}
            onClick={() => setCurrency('EUR')}
          >
            EUR €
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md font-bold transition-colors ${currency === 'NOK' ? 'bg-white shadow text-fjord-600' : 'text-slate-500'}`}
            onClick={() => setCurrency('NOK')}
          >
            NOK kr
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-fjord-500 to-fjord-600 rounded-xl p-6 text-white shadow-lg mb-8">
        <p className="text-fjord-100 text-sm mb-1 uppercase tracking-wide">Total Estimado</p>
        <div className="text-4xl font-bold">
          {currency === 'EUR' ? `€${total}` : `${total} kr`}
        </div>
        <p className="text-xs text-fjord-200 mt-2 flex items-center">
          <Info size={12} className="mr-1"/> Incluye transporte, entradas y comida.
        </p>
      </div>

      {/* Breakdown List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
        <h3 className="px-4 py-3 border-b border-slate-100 font-bold text-gray-700">Desglose</h3>
        {paidActivities.map((act, index) => (
          <div key={act.id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <div>
                <p className="text-sm font-medium text-gray-800">{act.title}</p>
                <p className="text-xs text-gray-500 capitalize">{act.type}</p>
              </div>
            </div>
            <div className="font-bold text-gray-700">
              {currency === 'EUR' ? `€${act.priceEUR}` : `${act.priceNOK} kr`}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 w-full mb-8">
         <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => currency === 'EUR' ? `€${value}` : `${value} kr`} />
            </PieChart>
         </ResponsiveContainer>
      </div>

      {/* Saving Tip */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start">
        <TrendingDown className="text-emerald-600 mt-1 mr-3 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-bold text-emerald-800 text-sm">Consejo de Ahorro</h4>
          <p className="text-xs text-emerald-700 mt-1">
            Si omites el Mirador Stegastein y almuerzas en el barco, podrías ahorrar aprox. 
            <span className="font-bold"> {currency === 'EUR' ? '€79' : '910 kr'}</span> por persona.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Budget;
