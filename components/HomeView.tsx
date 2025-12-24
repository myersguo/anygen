
import React, { useState } from 'react';
import { 
  Presentation, FileText, BookOpen, BarChart3, Mic2, Search, 
  Plus, ArrowUp, Globe, PlayCircle, Languages 
} from 'lucide-react';
import { AppView } from '../types';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onStartAgent: (prompt: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onStartAgent }) => {
  const [inputValue, setInputValue] = useState('');

  const taskPills = [
    { id: 'slides', label: '生成幻灯片', icon: Presentation },
    { id: 'docs', label: '撰写文档', icon: FileText },
    { id: 'stories', label: '创建故事绘本', icon: BookOpen },
    { id: 'research', label: '批量调研', icon: Search },
    { id: 'data', label: '分析数据', icon: BarChart3 },
    { id: 'agent', label: '创建网页', icon: Globe },
    { id: 'docs', label: '翻译 PDF', icon: Languages },
    { id: 'agent', label: '总结视频', icon: PlayCircle },
    { id: 'audio', label: '转写音频', icon: Mic2 },
  ];

  const handleSend = () => {
    if (inputValue.trim()) {
      onStartAgent(inputValue);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4">
      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl font-light text-gray-200 mb-12 tracking-tight">
        今天可以帮你做什么？
      </h1>

      {/* Central Input Box */}
      <div className="w-full max-w-3xl glass bg-white/[0.04] rounded-[32px] p-6 shadow-2xl border border-white/10 mb-10 transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="收集并分析 X 平台上关于某产品的讨论"
            className="w-full bg-transparent border-none outline-none resize-none text-xl text-gray-200 placeholder-gray-500 h-20 px-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-0 top-0 text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">tab</div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-3 bg-gray-400/20 text-gray-300 rounded-full hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Pills */}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {taskPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(pill.id as AppView)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
          >
            <pill.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
            <span className="text-sm text-gray-300 font-medium group-hover:text-white">{pill.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeView;
