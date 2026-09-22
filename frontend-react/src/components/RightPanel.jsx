import React from 'react';
import { X, Navigation, CloudRain, Mountain, TrendingUp, Droplet, ArrowDownToLine } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { t } from '../dict';

export default function RightPanel({ selectedZone, onClose, lang, allZones }) {
  if (!selectedZone) {
    return (
      <aside className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full transform transition-transform duration-300 translate-x-full absolute right-0 z-[1000] shadow-2xl">
      </aside>
    );
  }

  const { risk_breakdown, risk_band, risk_score } = selectedZone;
  const currentRain = selectedZone.current_rainfall_mm || 0;

  const mockTrend = [
    { hour: '-6h', rain: Math.max(0, currentRain - 15 + Math.random()*10) },
    { hour: '-5h', rain: Math.max(0, currentRain - 5 + Math.random()*10) },
    { hour: '-4h', rain: Math.max(0, currentRain + 5 + Math.random()*10) },
    { hour: '-3h', rain: Math.max(0, currentRain - 2 + Math.random()*10) },
    { hour: '-2h', rain: Math.max(0, currentRain + 8 + Math.random()*10) },
    { hour: 'Now', rain: currentRain }
  ].map(d => ({ ...d, rain: Number(d.rain.toFixed(1)) }));

  const bandColors = {
    Low: 'text-emerald-500',
    Medium: 'text-amber-400',
    High: 'text-orange-500',
    Severe: 'text-red-500'
  };

  const getNearestSaferZone = () => {
    if (risk_band !== 'Severe' || !allZones) return null;
    let nearest = null;
    let minDist = Infinity;
    for (const z of allZones) {
      if (z.zone_id !== selectedZone.zone_id && z.risk_band !== 'Severe') {
        const dx = z.longitude - selectedZone.longitude;
        const dy = z.latitude - selectedZone.latitude;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = z;
        }
      }
    }
    return nearest ? { ...nearest, distKm: (minDist * 111).toFixed(1) } : null;
  };

  const saferZone = getNearestSaferZone();

  return (
    <aside className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full transform transition-transform duration-300 translate-x-0 absolute right-0 z-[1000] shadow-2xl">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <h2 className="font-bold text-zinc-100 truncate">{selectedZone.name}</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 mb-6 flex items-center justify-between relative">
          <div>
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">{t('currentRisk', lang)}</p>
            <p className={`text-2xl font-bold ${bandColors[risk_band]}`}>{risk_band}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">{t('score', lang)}</p>
            <p className="text-2xl font-mono text-zinc-200">{risk_score.toFixed(1)}</p>
          </div>
          {selectedZone.confidence && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-900 border border-cyan-500 text-cyan-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              {t('confidence', lang)}: {selectedZone.confidence}%
            </div>
          )}
        </div>
        
        {saferZone && (
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 mb-6 flex items-start space-x-3">
             <div className="bg-emerald-500/20 p-1.5 rounded text-emerald-400">
               <Navigation className="w-4 h-4" />
             </div>
             <div>
               <p className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-0.5">{t('nearestSafer', lang)}</p>
               <p className="text-zinc-300 text-sm">{saferZone.name} <span className="text-zinc-500">({saferZone.distKm} km)</span></p>
             </div>
          </div>
        )}

        <h3 className="text-zinc-400 uppercase tracking-wider text-xs font-bold mb-3">Model Breakdown</h3>
        
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 mb-6 overflow-hidden">
           <div className="divide-y divide-zinc-800/50">
             
             <div className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
               <div className="flex items-center text-zinc-300 text-sm">
                 <CloudRain className="w-4 h-4 mr-3 text-cyan-400" />
                 Rainfall
               </div>
               <div className="text-zinc-100 font-mono text-sm">{risk_breakdown.Rainfall}</div>
             </div>
             
             <div className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
               <div className="flex items-center text-zinc-300 text-sm">
                 <Mountain className="w-4 h-4 mr-3 text-emerald-400" />
                 Elevation
               </div>
               <div className="text-zinc-100 font-mono text-sm">{risk_breakdown.Elevation}</div>
             </div>
             
             <div className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
               <div className="flex items-center text-zinc-300 text-sm">
                 <TrendingUp className="w-4 h-4 mr-3 text-orange-400" />
                 Slope
               </div>
               <div className="text-zinc-100 font-mono text-sm">{risk_breakdown.Slope}</div>
             </div>
             
             <div className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
               <div className="flex items-center text-zinc-300 text-sm">
                 <Droplet className="w-4 h-4 mr-3 text-blue-500" />
                 Surface Accumulation
               </div>
               <div className="text-zinc-100 font-mono text-sm">{risk_breakdown["Surface Accumulation"]}</div>
             </div>
             
             <div className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
               <div className="flex items-center text-zinc-300 text-sm">
                 <ArrowDownToLine className="w-4 h-4 mr-3 text-purple-400" />
                 Drainage Capacity
               </div>
               <div className="text-zinc-100 font-mono text-sm">{risk_breakdown["Drainage Capacity"]}</div>
             </div>
             
           </div>
        </div>

        <h3 className="text-zinc-400 uppercase tracking-wider text-xs font-bold mb-3">{t('trend', lang)}</h3>
        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTrend} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line type="monotone" dataKey="rain" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#18181b', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </aside>
  );
}
