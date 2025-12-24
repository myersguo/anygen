
import React, { useState } from 'react';
import { Send, Loader2, BarChart, LineChart, PieChart as PieIcon, Table } from 'lucide-react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { analyzeData } from '../services/geminiService';
import { AnalysisResult } from '../types';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#3b82f6'];

const DataView: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeData(input);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!result) return null;

    const commonProps = {
      data: result.chartData,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    };

    switch (result.chartType) {
      case 'bar':
        return (
          <RechartsBar {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </RechartsBar>
        );
      case 'line':
        return (
          <RechartsLine {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </RechartsLine>
        );
      case 'pie':
        return (
          <RechartsPie>
            <Pie
              data={result.chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
            >
              {result.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
          </RechartsPie>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Data Analyst</h2>
        <p className="text-gray-400">Paste your data or insights, and I'll visualize them.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-6 rounded-[32px] space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-400" /> Input Data
            </h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw data, CSV text, or a list of values..."
              className="w-full h-64 bg-black/20 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-sm font-mono"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !input}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Analyze & Chart
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="h-[400px] glass rounded-[32px] flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-400">Processing datasets...</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="glass p-8 rounded-[32px]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart className="w-6 h-6 text-indigo-400" /> Visualization
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart() || <div>Chart type not supported</div>}
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass p-8 rounded-[32px]">
                <h3 className="text-xl font-bold mb-4">Key Insights</h3>
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{result.summary}</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px] glass rounded-[32px] flex flex-col items-center justify-center text-gray-500 border-dashed border-2 border-white/5">
              <BarChart className="w-16 h-16 mb-4 opacity-20" />
              <p>Your analysis will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataView;
