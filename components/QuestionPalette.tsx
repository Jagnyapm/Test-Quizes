
import React from 'react';
import { QuestionStatus, UserProgress } from '../types';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  progress: Record<number, UserProgress>;
  onNavigate: (index: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({ totalQuestions, currentIndex, progress, onNavigate }) => {
  const getStatusColor = (index: number) => {
    const status = progress[index + 1]?.status || QuestionStatus.UNVISITED;
    switch (status) {
      case QuestionStatus.ANSWERED: return 'bg-emerald-500 text-white border-emerald-400';
      case QuestionStatus.NOT_ANSWERED: return 'bg-rose-500 text-white border-rose-400';
      case QuestionStatus.MARKED_FOR_REVIEW: return 'bg-amber-500 text-white border-amber-400';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
        Question Palette
      </h3>
      <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 custom-scrollbar">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 hover:scale-110 ${getStatusColor(i)} ${
              currentIndex === i ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-blue-500/20' : ''
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3 pt-6 border-t border-slate-700/50">
        <div className="flex items-center text-xs text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
          Answered
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
          Not Answered
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
          Marked for Review
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <div className="w-3 h-3 rounded-full bg-slate-700/50 mr-2 border border-slate-600"></div>
          Not Visited
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
