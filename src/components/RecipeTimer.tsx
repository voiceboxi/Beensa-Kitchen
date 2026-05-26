import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Timer, Bell, Zap, ChevronUp, ChevronDown } from 'lucide-react';

interface RecipeTimerProps {
  prepTime: number; // in minutes
  cookTime: number; // in minutes
}

export function RecipeTimer({ prepTime, cookTime }: RecipeTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(prepTime * 60);
  const [initialSeconds, setInitialSeconds] = useState(prepTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activePreset, setActivePreset] = useState<'prep' | 'cook' | 'custom'>('prep');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Play procedural sound using Web Audio API when countdown is finished
  const playDing = () => {
    if (!audioEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      // Make a retro double-bell sound
      const playTone = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      playTone(now, 880, 0.4); // A5
      playTone(now + 0.15, 1046.5, 0.5); // C6
      playTone(now + 0.3, 1318.5, 0.8); // E6
    } catch (e) {
      console.warn("Audio Context could not start:", e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            playDing();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, audioEnabled]);

  const selectPreset = (type: 'prep' | 'cook', minutes: number) => {
    setIsRunning(false);
    setActivePreset(type);
    const secs = minutes * 60;
    setInitialSeconds(secs);
    setSecondsLeft(secs);
  };

  const adjustTime = (amountSeconds: number) => {
    setIsRunning(false);
    setActivePreset('custom');
    setSecondsLeft((prev) => {
      const newVal = Math.max(0, prev + amountSeconds);
      setInitialSeconds(newVal);
      return newVal;
    });
  };

  const togglePlay = () => {
    if (secondsLeft <= 0) {
      // If completed or at zero, reset first
      const defaultDuration = activePreset === 'prep' ? prepTime * 60 : activePreset === 'cook' ? cookTime * 60 : initialSeconds;
      setSecondsLeft(defaultDuration || 60);
      setInitialSeconds(defaultDuration || 60);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  // Helper formats
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialSeconds > 0 ? (secondsLeft / initialSeconds) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-slate-950/25 border border-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-brand-orange/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-brand-blue/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
        
        {/* Left column: Context & quick presets */}
        <div className="space-y-4 max-w-sm text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/5 text-xs font-bold text-brand-orange">
            <Timer className="w-4 h-4" />
            <span>MINUTEUR EN CUISINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Activez votre minuteur</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Lancez un compte à rebours précis pour ne jamais manquer la cuisson parfaite de votre recette !
          </p>

          {/* Presets Grid */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => selectPreset('prep', prepTime)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${activePreset === 'prep' ? 'bg-brand-orange text-white border-brand-orange shadow-lg' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
            >
              <span>Préparation ({prepTime} min)</span>
              <span className="opacity-80">Presets</span>
            </button>
            <button
              onClick={() => selectPreset('cook', cookTime)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${activePreset === 'cook' ? 'bg-brand-blue text-white border-brand-blue shadow-lg' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
            >
              <span>Cuisson ({cookTime} min)</span>
              <span className="opacity-80">Presets</span>
            </button>
          </div>
        </div>

        {/* Center/Right column: Interactive Clock Display */}
        <div className="flex flex-col items-center gap-4 bg-slate-900/60 p-6 rounded-[28px] border border-white/5 w-full max-w-xs shrink-0 relative">
          
          {/* Audio toggle button */}
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${audioEnabled ? 'bg-white/10 text-brand-orange border-white/10' : 'bg-slate-900 text-slate-500 border-white/5'}`}
            title={audioEnabled ? "Désactiver le son" : "Activer le son"}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Time display wheel emulation */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Elegant SVG radial timer bar */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="72"
                className="stroke-brand-orange transition-all duration-300"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 72}
                strokeDashoffset={2 * Math.PI * 72 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Time reading */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Increments controls when paused */}
              {!isRunning && (
                <button 
                  onClick={() => adjustTime(60)} 
                  className="text-slate-500 hover:text-white transition-colors p-1"
                  title="+1 minute"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
              
              <span className="text-3xl font-extrabold tracking-tight font-mono text-white select-none">
                {formatTime(secondsLeft)}
              </span>

              {!isRunning && (
                <button 
                  onClick={() => adjustTime(-60)} 
                  className="text-slate-500 hover:text-white transition-colors p-1"
                  title="-1 minute"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={handleReset}
              disabled={secondsLeft === initialSeconds}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={togglePlay}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${isRunning ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-brand-orange hover:bg-orange-600 text-white shadow-lg shadow-brand-orange/20'}`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Démarrer'}</span>
            </button>
          </div>

          {/* State Feedback message */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-center select-none flex items-center gap-1.5 justify-center">
            {secondsLeft === 0 ? (
              <span className="text-rose-400 flex items-center gap-1">
                <Bell className="w-3 h-3 animate-bounce" /> Recette prête ! 🍽️
              </span>
            ) : isRunning ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3 animate-pulse" /> Cuisson en cours...
              </span>
            ) : (
              <span className="text-slate-400">Prêt à démarrer</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
