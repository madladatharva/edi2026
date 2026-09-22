import React, { useState, useEffect } from 'react';
import { Activity, Clock, FileDown, Languages } from 'lucide-react';
import { t } from '../dict';

export default function TopBar({ modelType, setModelType, lang, setLang, onDownload }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 z-[2000] relative shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-cyan-500/20 p-2 rounded">
          <Activity className="text-cyan-400 w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">{t('appTitle', lang)} <span className="font-normal text-zinc-400">| {t('punePilot', lang)}</span></h1>
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={onDownload}
          className="text-zinc-400 hover:text-white flex items-center space-x-2 text-sm transition-colors bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded"
        >
          <FileDown className="w-4 h-4" />
          <span>{t('downloadReport', lang)}</span>
        </button>

        <button 
          onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
          className="text-zinc-400 hover:text-white flex items-center space-x-2 text-sm transition-colors border border-zinc-700 px-3 py-1.5 rounded"
        >
          <Languages className="w-4 h-4" />
          <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
        </button>

        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
          <button 
            className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${modelType === 'rule_based' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => setModelType('rule_based')}
          >
            {t('ruleBased', lang)}
          </button>
          <button 
            className={`px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${modelType === 'ml' ? 'bg-cyan-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => setModelType('ml')}
          >
            {t('ml', lang)}
          </button>
        </div>

        <div className="flex items-center text-zinc-400 text-sm font-mono">
          <Clock className="w-4 h-4 mr-2" />
          {time}
        </div>
      </div>
    </header>
  );
}
