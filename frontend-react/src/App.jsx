import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import RightPanel from './components/RightPanel';

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [modelType, setModelType] = useState('ml');
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simRainfall, setSimRainfall] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [highlightedBand, setHighlightedBand] = useState(null);
  const [lang, setLang] = useState('en');
  
  // Playback/Replay State
  const [playbackData, setPlaybackData] = useState(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Nowcast Timeline State
  const [nowcastData, setNowcastData] = useState(null);
  const [nowcastIndex, setNowcastIndex] = useState(0);
  
  // Routing State
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routePath, setRoutePath] = useState(null);

  const fetchZones = async (model, rain = 0) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE}/zones?model=${model}`;
      let options = {};

      if (rain > 0) {
        url = `${API_BASE}/simulate?model=${model}`;
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ added_rainfall_mm: rain })
        };
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setZones(data);
      
      if (selectedZone) {
        const updated = data.find(z => z.zone_id === selectedZone.zone_id);
        if (updated) setSelectedZone(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones(modelType, simRainfall);
  }, []);

  const handleModelSwitch = (newModel) => {
    setModelType(newModel);
    fetchZones(newModel, simRainfall);
    showToast(newModel === 'ml' ? 'Switched to ML (RF) Engine - 96.7% Test Accuracy' : 'Switched to Rule-Based Engine');
  };

  const debouncedSimulate = useDebouncedCallback((val) => {
    setSimRainfall(val);
    fetchZones(modelType, val);
  }, 150);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    debouncedSimulate(val);
  };

  const handleDownloadReport = () => {
    window.open(`${API_BASE}/report?model=${modelType}`, '_blank');
  };

  const startReplay = async () => {
    setIsLoading(true);
    setNowcastData(null); // Clear nowcast if active
    try {
      const res = await fetch(`${API_BASE}/replay?model=${modelType}`);
      if (!res.ok) throw new Error("Replay fetch failed");
      const data = await res.json();
      setPlaybackData(data);
      setPlaybackIndex(0);
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
      showToast("Failed to load replay data.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopReplay = () => {
    setIsPlaying(false);
    setPlaybackData(null);
    fetchZones(modelType, simRainfall);
  };

  const fetchNowcast = async () => {
    setIsLoading(true);
    stopReplay(); // Clear replay if active
    try {
      const res = await fetch(`${API_BASE}/nowcast?model=${modelType}`);
      if (!res.ok) throw new Error("Nowcast fetch failed");
      const data = await res.json();
      setNowcastData(data);
      setNowcastIndex(0);
      showToast("Fetched 0-3 Hour Open-Meteo Nowcast.");
    } catch (e) {
      console.error(e);
      showToast("Failed to load nowcast timeline.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearNowcast = () => {
    setNowcastData(null);
    fetchZones(modelType, simRainfall);
  };

  // Replay interval
  useEffect(() => {
    let timer;
    if (isPlaying && playbackData) {
      timer = setInterval(() => {
        setPlaybackIndex(prev => {
          if (prev >= playbackData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackData]);
  
  // Calculate Routing when origin/dest/timeline change
  useEffect(() => {
    if (routeOrigin && routeDest && routeOrigin !== routeDest) {
      const fetchRoute = async () => {
        try {
          // If in nowcast mode, use the slider index as offset_hours
          const offset = nowcastData ? nowcastIndex : 0;
          const res = await fetch(`${API_BASE}/route?origin_id=${routeOrigin}&dest_id=${routeDest}&offset_hours=${offset}&model=${modelType}`);
          const data = await res.json();
          if (data.status === "success") {
            setRoutePath(data.route);
            showToast("Flood-aware route calculated.");
          } else {
            setRoutePath(null);
            showToast(data.message || "Failed to find route.");
          }
        } catch (e) {
          console.error(e);
          setRoutePath(null);
        }
      };
      fetchRoute();
    } else {
      setRoutePath(null);
    }
  }, [routeOrigin, routeDest, modelType, nowcastIndex, nowcastData]);

  // Which data to display on the map?
  let displayZones = zones;
  if (playbackData) {
    displayZones = playbackData[playbackIndex].zones;
  } else if (nowcastData) {
    displayZones = nowcastData[nowcastIndex].zones;
  }

  const handleLiveWeather = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/live?model=${modelType}`);
      if (!res.ok) throw new Error("Failed to fetch live weather");
      const data = await res.json();
      setZones(data);
      showToast('Fetched live Open-Meteo rainfall for Pune.');
      setSimRainfall(0);
    } catch (e) {
      console.error(e);
      showToast('Live weather fetch failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 font-sans">
      <TopBar 
        modelType={modelType} 
        setModelType={handleModelSwitch} 
        lang={lang} 
        setLang={setLang}
        onDownload={handleDownloadReport}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          zones={displayZones} 
          isLoading={isLoading} 
          onSliderChange={handleSliderChange} 
          fetchLive={handleLiveWeather}
          setHighlightedBand={setHighlightedBand}
          highlightedBand={highlightedBand}
          lang={lang}
          
          // Replay
          onStartReplay={startReplay}
          onStopReplay={stopReplay}
          isPlaying={isPlaying}
          playbackProgress={playbackData ? `${playbackIndex + 1}/${playbackData.length}` : null}
          playbackTime={playbackData ? playbackData[playbackIndex].timestamp : null}
          
          // Nowcast
          nowcastData={nowcastData}
          nowcastIndex={nowcastIndex}
          setNowcastIndex={setNowcastIndex}
          fetchNowcast={fetchNowcast}
          clearNowcast={clearNowcast}
          
          // Routing
          allZones={zones}
          routeOrigin={routeOrigin}
          setRouteOrigin={setRouteOrigin}
          routeDest={routeDest}
          setRouteDest={setRouteDest}
        />
        
        <main className="flex-1 relative">
          <MapView 
            zones={displayZones} 
            selectedZone={selectedZone} 
            setSelectedZone={setSelectedZone} 
            highlightedBand={highlightedBand}
            route={routePath}
          />
          
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-4 py-2 rounded shadow-lg transition-all duration-300 z-[1000] ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            {toastMessage}
          </div>
          
          {/* Nowcast Timeline Scrubber (Bottom Center) */}
          {nowcastData && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur border border-zinc-800 p-4 rounded-xl z-[1000] shadow-xl w-96">
               <h4 className="text-xs text-zinc-400 uppercase font-bold mb-3 tracking-wider text-center">0-3 Hour Forward Nowcast</h4>
               <div className="flex justify-between text-xs text-zinc-300 mb-2 font-mono">
                  <span>Now</span>
                  <span>+1h</span>
                  <span>+2h</span>
                  <span>+3h</span>
               </div>
               <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="1"
                  value={nowcastIndex}
                  onChange={(e) => setNowcastIndex(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          )}
        </main>

        <RightPanel 
          selectedZone={selectedZone} 
          onClose={() => setSelectedZone(null)} 
          lang={lang}
          allZones={displayZones}
        />
      </div>
    </div>
  );
}

export default App;
