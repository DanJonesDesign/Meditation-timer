"use client";

import React, { useState, useEffect, useRef } from 'react';

const MeditationTimer = () => {
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [bellVolume, setBellVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [enableOneMinTimer, setEnableOneMinTimer] = useState(true);
  const [enableBreathReminders, setEnableBreathReminders] = useState(false);


// Add these functions after the state declarations
const toggleOneMinTimer = () => {
  console.log('Toggling one minute timer from:', enableOneMinTimer, 'to:', !enableOneMinTimer);
  setEnableOneMinTimer(!enableOneMinTimer);
};

const toggleBreathReminders = () => {
  console.log('Toggling breath reminders from:', enableBreathReminders, 'to:', !enableBreathReminders);
  setEnableBreathReminders(!enableBreathReminders);
};
  
  const [reminderCount, setReminderCount] = useState(3);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);
  const reminderTimeouts = useRef([]);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playSound = async (type = 'start') => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    
    const sounds = {
      start: { baseFreq: 320, harmonics: [1, 1.5, 2, 2.667], duration: 4 },
      end: { baseFreq: 280, harmonics: [1, 1.25, 1.5, 2], duration: 5 },
      oneMin: { baseFreq: 360, harmonics: [1, 1.25, 1.5, 1.667], duration: 3 },
      breath: { baseFreq: 400, harmonics: [1, 1.2, 1.33, 1.5], duration: 2 }
    };
    
    const config = sounds[type];
    const oscillators = config.harmonics.map((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.frequency.value = config.baseFreq * harmonic;
      osc.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        bellVolume * (0.5 ** i) * 0.3,
        ctx.currentTime + 0.5
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + config.duration
      );
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      return { osc, gainNode };
    });
    
    oscillators.forEach(({ osc }) => {
      osc.start();
      osc.stop(ctx.currentTime + config.duration);
    });
  };

  const setupReminders = () => {
  console.log('Setting up reminders:', {
    enableOneMinTimer,
    enableBreathReminders,
    reminderCount,
    duration
  });
  
  reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
  reminderTimeouts.current = [];

  if (enableOneMinTimer) {
    console.log('Setting up one minute reminder');
    reminderTimeouts.current.push(
      setTimeout(() => {
        console.log('One minute reminder triggered');
        if (isRunning) playSound('oneMin');
      }, 60000)
    );
  }

  if (enableBreathReminders && reminderCount > 0) {
    console.log('Setting up breath reminders:', reminderCount);
    const startTime = 60;
    const endTime = duration - 10;
    const availableTime = endTime - startTime;
    const intervalTime = availableTime / (reminderCount + 1);
    
    for (let i = 1; i <= reminderCount; i++) {
      const reminderTime = startTime + (intervalTime * i);
      console.log(`Setting breath reminder ${i} for ${reminderTime} seconds`);
      reminderTimeouts.current.push(
        setTimeout(() => {
          console.log(`Breath reminder ${i} triggered`);
          if (isRunning) playSound('breath');
        }, reminderTime * 1000)
      );
    }
  }
};

  const startTimer = () => {
    if (!isRunning) {
      initAudioContext();
      setIsRunning(true);
      playSound('start');
      setupReminders();
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
            setIsRunning(false);
            playSound('end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const adjustDuration = (minutes) => {
    const newDuration = minutes * 60;
    setDuration(newDuration);
    setTimeLeft(newDuration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-semibold mb-2">{formatTime(timeLeft)}</h2>
        <div className="space-x-2 mb-4">
          {[5, 7.5, 10, 15].map((mins) => (
            <button
              key={mins}
              onClick={() => adjustDuration(mins)}
              className={`px-3 py-1 rounded-md text-sm ${
                duration === mins * 60
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Settings
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={bellVolume}
            onChange={(e) => setBellVolume(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

{showSettings && (
  <div className="mt-4 space-y-4 border-t pt-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm">One minute timer</label>
        <button
          type="button"
          onClick={toggleOneMinTimer}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
            enableOneMinTimer ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
              enableOneMinTimer ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <label className="text-sm">Breath reminders</label>
        <button
          type="button"
          onClick={toggleBreathReminders}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
            enableBreathReminders ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
              enableBreathReminders ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <label className="text-sm">Breath reminders</label>
        <button
          type="button"
          onClick={() => setEnableBreathReminders(!enableBreathReminders)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
            enableBreathReminders ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
              enableBreathReminders ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
            
            {enableBreathReminders && (
              <div className="space-y-2">
                <label className="text-sm block">
                  Number of reminders: {reminderCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reminderCount}
                  onChange={(e) => setReminderCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-2">Test Sounds</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  initAudioContext();
                  playSound('start');
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                Start Sound
              </button>
              <button
                onClick={() => {
                  initAudioContext();
                  playSound('oneMin');
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                One Minute Sound
              </button>
              <button
                onClick={() => {
                  initAudioContext();
                  playSound('breath');
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                Breath Reminder
              </button>
              <button
                onClick={() => {
                  initAudioContext();
                  playSound('end');
                }}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                End Sound
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationTimer;
