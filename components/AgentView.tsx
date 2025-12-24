
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Loader2, CheckCircle2, Circle, Activity, 
  Layers, Send, X, ExternalLink, 
  Presentation, FileText, Search, Copy, Check,
  ChevronDown, ChevronUp, Square,
  List
} from 'lucide-react';
import { createInitialPlan, executeAgentStep } from '../services/geminiService';
import { AgentTask, Slide, ResearchResult } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'plan' | 'thinking';
  thinking?: string;
  plan?: AgentTask[];
}

interface AgentViewProps {
  initialInput?: string | null;
  onClearInitialInput?: () => void;
}

const AgentView: React.FC<AgentViewProps> = ({ initialInput, onClearInitialInput }) => {
  const [input, setInput] = useState(initialInput || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AgentTask[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<any>(null);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialInput) {
      handleSend(initialInput);
      onClearInitialInput?.();
    }
  }, [initialInput]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentPlan]);

  const handleCopy = () => {
    if (!activeArtifact) return;
    const content = typeof activeArtifact.data === 'string' 
      ? activeArtifact.data 
      : JSON.stringify(activeArtifact.data, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || isProcessing) return;

    setInput('');
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const initial = await createInitialPlan(text);
      setCurrentPlan(initial.tasks.map((t: any) => ({ ...t, status: 'pending' })));
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `好的，我已经根据你的需求制定了计划：${initial.objective}`,
        type: 'thinking',
        thinking: `目标识别: ${initial.objective}。正在启动自主执行流程，共包含 ${initial.tasks.length} 个步骤。`
      }]);

      let context = `Initial User Prompt: ${text}\n`;
      const updatedPlan = initial.tasks.map((t: any) => ({ ...t, status: 'pending' }));

      for (let i = 0; i < updatedPlan.length; i++) {
        const task = updatedPlan[i];
        task.status = 'running';
        setCurrentPlan([...updatedPlan]);

        const result = await executeAgentStep(task.description, task.tool!, context);
        
        task.status = 'completed';
        task.result = result;
        setCurrentPlan([...updatedPlan]);
        
        // Logical Switch: directResponse goes to Chat, others to Artifact Workspace
        if (task.tool === 'directResponse') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: typeof result === 'string' ? result : JSON.stringify(result)
          }]);
        } else {
          setActiveArtifact({ tool: task.tool, data: result, description: task.description });
        }
        
        context += `\nStep ${i+1} (${task.tool}) Result Summary: Success.\n`;
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "处理请求时遇到一点问题，请稍后再试。" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderWorkspaceContent = () => {
    if (!activeArtifact) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-20 p-20 text-center">
          <Layers className="w-24 h-24 mb-6" />
          <h2 className="text-2xl font-bold">工作台就绪</h2>
          <p>生成的文件、幻灯片或调研结果将在此处显示。</p>
        </div>
      );
    }

    const { tool, data } = activeArtifact;

    switch (tool) {
      case 'generateSlides':
        const slides = data as Slide[];
        return (
          <div className="space-y-12 max-w-3xl mx-auto py-12 px-6">
            {slides.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[40px] p-12 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-500">
                <div className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-8">幻灯片 {i+1}</div>
                <h2 className="text-4xl font-bold text-white mb-10 leading-tight">{s.title}</h2>
                <ul className="space-y-6">
                  {s.content.map((point, j) => (
                    <li key={j} className="flex items-start gap-4 text-xl text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-3 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'researchWeb':
        const res = data as ResearchResult;
        return (
          <div className="max-w-4xl mx-auto py-12 px-10">
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
              {res.text}
            </div>
            {res.sources?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6">来源引用</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {res.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                      <span className="text-xs text-gray-400 truncate">{s.title}</span>
                      <ExternalLink className="w-3 h-3 group-hover:text-indigo-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="max-w-4xl mx-auto py-12 px-10 prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
             <h1 className="text-4xl font-bold text-white mb-8">生成的文档</h1>
             {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] -mt-4 -mx-4 overflow-hidden">
      {/* Left Column: Chat & Reasoning */}
      <div className="w-[35%] min-w-[400px] flex flex-col border-r border-white/5 bg-black/20">
        <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Bot className="w-5 h-5 text-indigo-400" />
             <span className="font-bold text-sm">AnyGen 对话</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'user' ? (
                <div className="bg-indigo-600 text-white p-4 rounded-3xl rounded-tr-none max-w-[90%] shadow-lg">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1">
                      <Bot className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 space-y-4">
                      {msg.thinking && (
                        <div className="glass rounded-2xl overflow-hidden border-white/5">
                          <button 
                            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                            className="w-full flex items-center justify-between p-3 bg-white/5 text-xs text-indigo-400 font-bold uppercase tracking-wider"
                          >
                            <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> {isProcessing ? '思考中...' : '逻辑推导过程'}</span>
                            {isThinkingExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          {isThinkingExpanded && (
                            <div className="p-4 bg-black/40 text-xs font-mono text-gray-400 leading-relaxed border-t border-white/5">
                              {msg.thinking}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {currentPlan.length > 0 && (
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <List className="w-3 h-3" /> 任务执行协议
              </h4>
              <div className="space-y-4">
                {currentPlan.map((task, i) => (
                  <div key={task.id} className={`flex items-start gap-3 transition-opacity ${task.status === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="mt-1">
                      {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                       task.status === 'running' ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /> : 
                       <Circle className="w-4 h-4 text-gray-700" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${task.status === 'running' ? 'text-indigo-400' : 'text-gray-400'}`}>{task.tool}</p>
                      <p className="text-[10px] text-gray-500 leading-tight">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4">
          <div className="relative glass bg-white/[0.05] rounded-3xl border border-white/10 p-2 shadow-xl focus-within:border-indigo-500/50 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="继续补充需求或与 AnyGen 对话..."
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-200 placeholder-gray-500 h-16 p-3"
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center justify-end px-2 pb-1">
              <button 
                onClick={() => handleSend()}
                disabled={isProcessing || !input.trim()}
                className={`p-2 rounded-xl transition-all ${isProcessing ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                {isProcessing ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-2">AnyGen 正在为你创造。请注意核实关键信息。</p>
        </div>
      </div>

      {/* Right Column: Artifact Workspace */}
      <div className="flex-1 flex flex-col bg-[#050810]">
        {activeArtifact && (
          <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-white/5 rounded-lg">
                 {activeArtifact.tool === 'generateSlides' ? <Presentation className="w-5 h-5 text-indigo-400" /> : <FileText className="w-5 h-5 text-indigo-400" />}
               </div>
               <div>
                 <h3 className="font-bold text-sm tracking-tight truncate max-w-[300px]">{activeArtifact.description || "任务产出"}</h3>
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest">{activeArtifact.tool || "文档"}</p>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <button onClick={() => setActiveArtifact(null)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
             </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {renderWorkspaceContent()}
        </div>

        {activeArtifact && (
          <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between px-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex-1 px-12">
               <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: '100%' }}></div>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-all flex items-center gap-2 px-3"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  <span className="text-xs font-bold">{copied ? '已复制' : '复制内容'}</span>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentView;
