"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Pause, Play, RefreshCcw, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

const MeditationTimer = () => {
  const [duration, setDuration] = useState(300); // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [bellVolume, setBellVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [enableOneMinTimer, setEnableOneMinTimer] = useState(true);
  const [enableBreathReminders, setEnableBreathReminders] = useState(false);
  const [reminderCount, setReminderCount] = useState(3);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);
  const reminderTimeouts = useRef
   useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const playSound = async (type = 'start') => {
    const ctx = audioContext.current;
    
    // Different configurations for different sound types
    const sounds = {
      start: { baseFreq: 320, harmonics: [1, 1.5, 2, 2.667], duration: 4 },
      end: { baseFreq: 280, harmonics: [1, 1.25, 1.5, 2], duration: 5 },
      oneMin: { baseFreq: 360, harmonics: [1, 1.25, 1.5, 1.667], duration: 3 },
      breath: { baseFreq: 400, harmonics: [1, 1.2, 1.33, 1.5], duration: 2 }
    };
    
    const config = sounds[type];
    
    // Create oscillators for harmonics
    const oscillators = config.harmonics.map((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.frequency.value = config.baseFreq * harmonic;
      osc.type = 'sine';
      
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.2;
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Very gentle attack
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        (bellVolume * (0.7 ** i)) * 0.5,
        ctx.currentTime + 0.5
      );
      
      // Natural decay
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + config.duration
      );
      
      return { osc, gainNode };
    });
    
    oscillators.forEach(({ osc }) => {
      osc.start();
      osc.stop(ctx.currentTime + config.duration);
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const setupReminders = () => {
    reminderTimeouts.current.forEach(timeout => clearTimeout(timeout));
    reminderTimeouts.current = [];

    if (enableOneMinTimer) {
      reminderTimeouts.current.push(
        setTimeout(() => {
          if (isRunning) playSound('oneMin');
        }, 60000)
      );
    }

    if (enableBreathReminders && reminderCount > 0) {
      const startTime = 60; // 1-minute mark
      const endTime = duration - 10; // 10 seconds before end
      const availableTime = endTime - startTime;
      const intervalTime = availableTime / (reminderCount + 1);
      
      for (let i = 1; i <= reminderCount; i++) {
        const reminderTime = startTime + (intervalTime * i);
        reminderTimeouts.current.push(
          setTimeout(() => {
            if (isRunning) playSound('breath');
          }, reminderTime * 1000)
        );
      }
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      playSound('start');
      setupReminders();
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
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
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-semibold mb-2">{formatTime(timeLeft)}</h2>
          <div className="space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustDuration(5)}
              className={duration === 300 ? 'bg-blue-100' : ''}
            >
              5m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustDuration(7.5)}
              className={duration === 450 ? 'bg-blue-100' : ''}
            >
              7.5m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustDuration(10)}
              className={duration === 600 ? 'bg-blue-100' : ''}
            >
              10m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustDuration(15)}
              className={duration === 900 ? 'bg-blue-100' : ''}
            >
              15m
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={isRunning ? pauseTimer : startTimer}
            className="w-24"
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            className="w-24"
          >
            <RefreshCcw className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
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
                <label className="text-sm font-medium">One minute timer</label>
                <Switch
                  checked={enableOneMinTimer}
                  onCheckedChange={setEnableOneMinTimer}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Breath reminders</label>
                <Switch
                  checked={enableBreathReminders}
                  onCheckedChange={setEnableBreathReminders}
                />
              </div>
              
              {enableBreathReminders && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of reminders: {reminderCount}
                  </label>
                  <Slider
                    value={[reminderCount]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setReminderCount(value[0])}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Test Sounds</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => playSound('start')}>
                  Start Sound
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('oneMin')}>
                  One Minute Sound
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('breath')}>
                  Breath Reminder
                </Button>
                <Button size="sm" variant="outline" onClick={() => playSound('end')}>
                  End Sound
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeditationTimer;
