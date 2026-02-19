
import React, { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ seconds, onTimeUp }) => {
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = seconds <= 600; // 10 mins
  const isDanger = seconds <= 300; // 5 mins
  const isCritical = seconds <= 60; // 1 min

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 ${
      isCritical ? 'bg-red-500/20 border-red-500 animate-pulse' :
      isDanger ? 'bg-orange-500/20 border-orange-500' :
      isWarning ? 'bg-yellow-500/20 border-yellow-500' :
      'bg-blue-500/20 border-blue-500'
    }`}>
      <span className="text-sm font-medium uppercase tracking-wider text-slate-300">Time Remaining:</span>
      <span className={`text-xl font-bold font-mono ${isCritical ? 'text-red-400' : 'text-blue-400'}`}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default Timer;
