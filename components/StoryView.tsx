
import React, { useState } from 'react';
import { Send, Loader2, Wand2 } from 'lucide-react';
import { generateStory, generateImage } from '../services/geminiService';
import { StoryPage } from '../types';

const StoryView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [imageGeneratingIndex, setImageGeneratingIndex] = useState<number | null>(null);

  const handleGenerateStory = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const storyData = await generateStory(topic);
      setPages(storyData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (index: number) => {
    const page = pages[index];
    setImageGeneratingIndex(index);
    try {
      const url = await generateImage(page.imagePrompt);
      if (url) {
        const newPages = [...pages];
        newPages[index] = { ...page, imageUrl: url };
        setPages(newPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setImageGeneratingIndex(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight">AI Picture Book Studio</h2>
        <p className="text-gray-400 text-lg">Bring stories to life with AI-generated text and illustrations.</p>
      </div>

      <div className="max-w-2xl mx-auto relative group">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="A story about a brave cat explorer..."
          className="w-full glass p-8 rounded-[32px] outline-none focus:ring-4 focus:ring-indigo-500/20 text-xl"
        />
        <button
          onClick={handleGenerateStory}
          disabled={loading || !topic}
          className="absolute right-4 top-4 bottom-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl flex items-center gap-2 font-bold shadow-xl transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Write Story
        </button>
      </div>

      {pages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {pages.map((page, index) => (
            <div key={index} className="flex flex-col space-y-6 animate-in slide-in-from-bottom-8 fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="aspect-square glass rounded-[40px] overflow-hidden relative group border-2 border-transparent hover:border-indigo-500/30 transition-all">
                {page.imageUrl ? (
                  <img src={page.imageUrl} alt="Illustration" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Wand2 className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-300">Ready for Magic</h4>
                      <p className="text-gray-500 text-sm">Click below to generate the illustration for this page.</p>
                    </div>
                  </div>
                )}
                
                {imageGeneratingIndex === index && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <span className="text-white font-medium">Painting with pixels...</span>
                  </div>
                )}
              </div>

              <div className="glass p-8 rounded-[32px] flex-1">
                <span className="text-indigo-400 font-black text-sm uppercase tracking-widest mb-4 block">Page {index + 1}</span>
                <p className="text-xl text-gray-200 leading-relaxed italic">"{page.text}"</p>
                {!page.imageUrl && (
                  <button
                    onClick={() => handleGenerateImage(index)}
                    disabled={imageGeneratingIndex !== null}
                    className="mt-8 w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-indigo-400 font-bold border border-white/10 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-5 h-5" /> Generate Illustration
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryView;
