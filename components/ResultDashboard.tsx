
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell as RechartsCell } from 'recharts';
import { QuizResult, Subject } from '../types';

interface ResultDashboardProps {
  result: QuizResult;
  subject: Subject;
  onRestart: () => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, subject, onRestart }) => {
  const pieData = [
    { name: 'Correct', value: result.correct, color: '#10b981' },
    { name: 'Wrong', value: result.wrong, color: '#f43f5e' },
    { name: 'Unattempted', value: result.unattempted, color: '#64748b' },
  ];

  const statCards = [
    { label: 'Total Score', value: result.score.toFixed(2), icon: '🏆', color: 'text-blue-400' },
    { label: 'Accuracy', value: `${result.accuracy.toFixed(1)}%`, icon: '🎯', color: 'text-emerald-400' },
    { label: 'Time Taken', value: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`, icon: '⏱️', color: 'text-amber-400' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">Quiz Performance Analysis</h2>
        <p className="text-slate-400">Subject: {subject}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl text-center">
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-slate-400 text-sm font-medium uppercase mb-1">{card.label}</div>
            <div className={`text-4xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Question Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                <span className="text-sm text-slate-400">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-100 mb-6">AI Mentor's Analysis</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed italic">
              {result.analysis || "Analyzing your performance patterns..."}
            </p>
          </div>
          {result.analysis && (
            <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">UPSC Prelims Pattern</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold">Topic Specific Analysis</span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold">Strategic Feedback</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onRestart}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultDashboard;
