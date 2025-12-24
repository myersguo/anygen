
import React, { useState } from 'react';
import { Send, Loader2, Layout, Type as TypeIcon, Image as ImageIcon } from 'lucide-react';
import { generateSlides } from '../services/geminiService';
import { Slide } from '../types';

const SlidesView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateSlides(topic);
      setSlides(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Presentation Generator</h2>
        <p className="text-gray-400">Outline, draft, and visualize your slides in seconds.</p>
      </div>

      <div className="relative group">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a presentation topic (e.g., 'The Future of Quantum Computing')"
          className="w-full glass p-6 pr-32 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-2xl flex items-center gap-2 transition-all font-bold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Generate
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-20 animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-400">GenAI is crafting your slides...</p>
        </div>
      )}

      {slides.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Slides Preview</h3>
            <span className="text-gray-400 text-sm">{slides.length} Slides</span>
          </div>
          <div className="grid gap-8">
            {slides.map((slide, index) => (
              <div key={index} className="glass rounded-[32px] overflow-hidden group hover:scale-[1.01] transition-transform shadow-2xl">
                <div className="bg-indigo-600/10 p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-indigo-400 font-bold text-sm uppercase tracking-widest">Slide {index + 1}</span>
                  <Layout className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="p-12 min-h-[300px] flex flex-col justify-center">
                  <h4 className="text-4xl font-bold mb-8 text-white">{slide.title}</h4>
                  <ul className="space-y-4">
                    {slide.content.map((point, i) => (
                      <li key={i} className="flex items-start gap-4 text-xl text-gray-300">
                        <div className="mt-2.5 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidesView;
