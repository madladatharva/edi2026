import React, { useState } from 'react';
import { CloudRain, CloudLightning, Loader2, Play, Square, FastForward, Clock, Route, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { t } from '../dict';

export default function Sidebar({ 
  zones, 
  isLoading, 
  onSliderChange, 
  fetchLive, 
  setHighlightedBand, 
  highlightedBand, 
  lang, 
  onStartReplay, 
  onStopReplay, 
  isPlaying, 
  playbackProgress, 
  playbackTime,
  nowcastData,
  fetchNowcast,
  clearNowcast,
  allZones,
  routeOrigin,
  setRouteOrigin,
  routeDest,
  setRouteDest
}) {
  const [sliderValue, setSliderValue] = useState(0);
  const [broadcastState, setBroadcastState] = useState('idle');

  const handleBroadcast = () => {
    setBroadcastState('broadcasting');
    setTimeout(() => {
      setBroadcastState('sent');
      setTimeout(() => setBroadcastState('idle'), 3000);
    }, 2500);
  };

  const handleSlider = (e) => {
    setSliderValue(e.target.value);
    onSliderChange(e);
  };

  const getCounts = () => {
    const counts = { Low: 0, Medium: 0, High: 0, Severe: 0 };
    zones.forEach(z => {
      if (counts[z.risk_band] !== undefined) counts[z.risk_band]++;
    });
    return counts;
  };

  const counts = getCounts();

  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full z-[1000] relative">
      <div className="p-5 flex-1 overflow-y-auto">
        
        <h2 className="text-zinc-400 uppercase tracking-wider text-xs font-bold mb-4">{t('simControls', lang)}</h2>
        
        {/* Synthetic Burst */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-zinc-200 text-sm font-semibold">
              <CloudRain className="w-4 h-4 mr-2 text-cyan-400" /> {t('rainBurst', lang)}
            </div>
            <span className="text-cyan-400 font-mono text-sm">+{sliderValue} mm</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1"
            value={sliderValue}
            onChange={handleSlider}
            className="w-full accent-cyan-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Live Weather */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-4 shadow-sm">
           <button 
            onClick={fetchLive}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 mb-2"
           >
             {isLoading && !isPlaying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CloudLightning className="w-4 h-4 mr-2" />}
             {t('fetchLive', lang)}
           </button>
           
           {!nowcastData ? (
             <button 
              onClick={fetchNowcast}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
             >
               <Clock className="w-4 h-4 mr-2" />
               Start 3-Hour Nowcast
             </button>
           ) : (
             <button 
              onClick={clearNowcast}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
             >
               <Square className="w-4 h-4 mr-2" />
               Stop Nowcast
             </button>
           )}
        </div>

        {/* Flood Aware Routing */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-4 shadow-sm">
           <div className="flex items-center text-zinc-200 text-sm font-semibold mb-3">
             <Route className="w-4 h-4 mr-2 text-indigo-400" /> Flood-Aware Routing
           </div>
           <div className="flex flex-col space-y-2 mb-2">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-1">
                 <MapPin className="w-3 h-3 text-emerald-400 mx-2" />
                 <select 
                   value={routeOrigin} 
                   onChange={(e) => setRouteOrigin(e.target.value)}
                   className="bg-transparent text-xs text-zinc-300 w-full outline-none"
                 >
                   <option value="">Select Origin...</option>
                   {allZones.map(z => <option key={`o-${z.zone_id}`} value={z.zone_id}>{z.name}</option>)}
                 </select>
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-1">
                 <MapPin className="w-3 h-3 text-red-400 mx-2" />
                 <select 
                   value={routeDest} 
                   onChange={(e) => setRouteDest(e.target.value)}
                   className="bg-transparent text-xs text-zinc-300 w-full outline-none"
                 >
                   <option value="">Select Destination...</option>
                   {allZones.map(z => <option key={`d-${z.zone_id}`} value={z.zone_id}>{z.name}</option>)}
                 </select>
              </div>
           </div>
        </div>

        {/* Emergency Actions */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-red-900/50 mb-6 shadow-[0_0_15px_rgba(220,38,38,0.1)] relative overflow-hidden">
           <div className="flex items-center text-red-400 text-sm font-bold mb-3">
             <AlertTriangle className="w-4 h-4 mr-2" /> Emergency Actions
           </div>
           
           <button 
            onClick={handleBroadcast}
            disabled={broadcastState !== 'idle' || counts.Severe === 0}
            className={`w-full font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors text-sm ${counts.Severe === 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : broadcastState === 'sent' ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'}`}
           >
             {broadcastState === 'broadcasting' && <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Broadcasting SMS...</>}
             {broadcastState === 'sent' && <><CheckCircle className="w-4 h-4 mr-2" /> Alerts Sent ({counts.Severe * 12500} citizens)</>}
             {broadcastState === 'idle' && <><AlertTriangle className="w-4 h-4 mr-2" /> Broadcast Evacuation SMS</>}
           </button>
           {counts.Severe === 0 && <p className="text-[10px] text-zinc-500 mt-2 text-center">No severe zones detected.</p>}
        </div>

        {/* Historical Replay */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6 shadow-sm">
           <div className="flex justify-between items-center mb-3">
             <div className="flex items-center text-zinc-200 text-sm font-semibold">
               <FastForward className="w-4 h-4 mr-2 text-purple-400" /> {t('replayEvent', lang)}
             </div>
             {playbackProgress && <span className="text-purple-400 font-mono text-xs">{playbackProgress}</span>}
           </div>
           
           {playbackTime && (
             <div className="text-center text-xs text-zinc-400 font-mono mb-3 py-1 bg-zinc-900 rounded border border-zinc-800">
               {playbackTime}
             </div>
           )}
           
           {!isPlaying ? (
             <button 
              onClick={onStartReplay}
              disabled={isLoading || nowcastData}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
               Start Replay
             </button>
           ) : (
             <button 
              onClick={onStopReplay}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
             >
               <Square className="w-4 h-4 mr-2" />
               Stop Replay
             </button>
           )}
        </div>

        <h2 className="text-zinc-400 uppercase tracking-wider text-xs font-bold mb-4">{t('summaryStats', lang)}</h2>
        <div className="grid grid-cols-2 gap-3">
           <StatBox band="Low" count={counts.Low} color="bg-emerald-500" text="text-emerald-500" active={highlightedBand === 'Low'} onClick={() => setHighlightedBand(highlightedBand === 'Low' ? null : 'Low')} />
           <StatBox band="Medium" count={counts.Medium} color="bg-amber-400" text="text-amber-400" active={highlightedBand === 'Medium'} onClick={() => setHighlightedBand(highlightedBand === 'Medium' ? null : 'Medium')} />
           <StatBox band="High" count={counts.High} color="bg-orange-500" text="text-orange-500" active={highlightedBand === 'High'} onClick={() => setHighlightedBand(highlightedBand === 'High' ? null : 'High')} />
           <StatBox band="Severe" count={counts.Severe} color="bg-red-500" text="text-red-500" active={highlightedBand === 'Severe'} onClick={() => setHighlightedBand(highlightedBand === 'Severe' ? null : 'Severe')} />
        </div>

      </div>
    </aside>
  );
}

function StatBox({ band, count, color, text, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-zinc-950 p-3 rounded-lg border cursor-pointer transition-all ${active ? 'border-zinc-400 scale-105 shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}`}
    >
      <div className="flex items-center space-x-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-zinc-400 text-xs font-semibold uppercase">{band}</span>
      </div>
      <div className={`text-2xl font-bold font-mono ${text}`}>{count}</div>
    </div>
  );
}
