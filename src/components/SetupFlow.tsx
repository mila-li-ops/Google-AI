"use client";

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, X, GripVertical, FileText, Trash2 } from 'lucide-react';
import { ScreenInput, AnalysisOptions } from '../domain/types';
import { motion, Reorder } from 'motion/react';

interface SetupFlowProps {
  screens: ScreenInput[];
  options: AnalysisOptions;
  onUpdateScreens: (screens: ScreenInput[]) => void;
  onUpdateOptions: (options: AnalysisOptions) => void;
  onStart: () => void;
  error: string | null;
  onError: (msg: string | null) => void;
}

export const SetupFlow: React.FC<SetupFlowProps> = ({
  screens,
  options,
  onUpdateScreens,
  onUpdateOptions,
  onStart,
  error,
  onError
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newScreens: ScreenInput[] = Array.from(files).map((fileObj, index) => {
      const file = fileObj as File;
      // Basic validation
      if (!file.type.startsWith('image/')) {
        onError(`File "${file.name}" is not an image.`);
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        onError(`File "${file.name}" is too large (max 5MB).`);
        return null;
      }

      return {
        id: crypto.randomUUID(),
        name: file.name.split('.')[0],
        type: 'upload',
        previewUrl: URL.createObjectURL(file),
        order: screens.length + index
      };
    }).filter(Boolean) as ScreenInput[];

    onUpdateScreens([...screens, ...newScreens]);
    onError(null);
  };

  const handleAddUrl = () => {
    if (!urlInput) return;
    
    // Simple URL validation
    try {
      new URL(urlInput);
    } catch (e) {
      onError("Please enter a valid public URL.");
      return;
    }

    const newScreen: ScreenInput = {
      id: crypto.randomUUID(),
      name: new URL(urlInput).hostname,
      type: 'url',
      previewUrl: 'https://picsum.photos/seed/url/400/600', // Mock preview for URL
      order: screens.length
    };

    onUpdateScreens([...screens, newScreen]);
    setUrlInput('');
    onError(null);
  };

  const removeScreen = (id: string) => {
    onUpdateScreens(screens.filter(s => s.id !== id));
  };

  const renameScreen = (id: string, newName: string) => {
    onUpdateScreens(screens.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 p-12">
      <header className="space-y-3 border-b border-white/5 pb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">New Review Session</h1>
        <p className="text-slate-500 text-sm font-medium">Upload your screens or provide URLs to start the AI-powered UX review.</p>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-4 text-sm font-medium"
        >
          <X className="w-5 h-5 cursor-pointer hover:text-red-300 transition-colors" onClick={() => onError(null)} />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="p-12 border-2 border-dashed border-white/10 bg-[#151922]/50 rounded-[2rem] hover:border-blue-500/50 transition-all group relative cursor-pointer flex flex-col items-center justify-center min-h-[280px]">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-5 bg-blue-500/10 rounded-full text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all ring-1 ring-blue-500/20">
              <Upload className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Upload Screens</p>
              <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-widest">Drag and drop or click to browse</p>
            </div>
          </div>
        </div>

        {/* URL Section */}
        <div className="p-12 border border-white/5 bg-[#151922] rounded-[2rem] space-y-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 text-blue-500 relative z-10">
            <LinkIcon className="w-5 h-5" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Import from URL</h3>
          </div>
          <div className="flex gap-3 relative z-10">
            <input 
              type="text" 
              placeholder="https://example.com/design"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-800 font-medium"
            />
            <button 
              onClick={handleAddUrl}
              className="px-6 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95"
            >
              Add
            </button>
          </div>
          <p className="text-[10px] text-slate-600 italic font-medium relative z-10">Note: Real-time scraping is simulated for this MVP.</p>
        </div>
      </div>

      {/* Screen List */}
      {screens.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Screens ({screens.length})</h3>
            <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">Drag to reorder</p>
          </div>
          
          <Reorder.Group axis="y" values={screens} onReorder={onUpdateScreens} className="space-y-4">
            {screens.map((screen) => (
              <Reorder.Item 
                key={screen.id} 
                value={screen}
                className="flex items-center gap-6 p-5 bg-[#151922] border border-white/5 rounded-2xl shadow-2xl shadow-black/20 group cursor-default"
              >
                <GripVertical className="w-5 h-5 text-slate-800 cursor-grab active:cursor-grabbing hover:text-slate-600 transition-colors" />
                <div className="w-14 h-14 rounded-xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0">
                  <img src={screen.previewUrl} alt={screen.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                </div>
                <input 
                  type="text" 
                  value={screen.name}
                  onChange={(e) => renameScreen(screen.id, e.target.value)}
                  className="flex-1 font-bold text-slate-200 bg-transparent border-none focus:ring-0 p-0 text-sm"
                />
                <div className="flex items-center gap-4">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-600 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">
                    {screen.type}
                  </span>
                  <button 
                    onClick={() => removeScreen(screen.id)}
                    className="p-2.5 text-slate-800 hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Options Section */}
      <div className="p-12 bg-[#151922] rounded-[2rem] border border-white/5 space-y-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.01] to-transparent pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Analysis Options</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strictness Level</label>
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{options.strictness}</span>
            </div>
            <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
              {(['light', 'normal', 'strict'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdateOptions({ ...options, strictness: level })}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    options.strictness === level 
                      ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' 
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <label className="flex items-center gap-5 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={options.sequential}
                  onChange={(e) => onUpdateOptions({ ...options, sequential: e.target.checked })}
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${options.sequential ? 'bg-blue-600' : 'bg-white/10'}`}></div>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-xl ${options.sequential ? 'translate-x-6' : ''}`}></div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Analyze as Sequential Flow</p>
                <p className="text-[10px] text-slate-600 mt-1 font-medium uppercase tracking-widest">Check for consistency across screens</p>
              </div>
            </label>

            <label className="flex items-center gap-5 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={options.accessibilityFocus}
                  onChange={(e) => onUpdateOptions({ ...options, accessibilityFocus: e.target.checked })}
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${options.accessibilityFocus ? 'bg-blue-600' : 'bg-white/10'}`}></div>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-xl ${options.accessibilityFocus ? 'translate-x-6' : ''}`}></div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Accessibility Focus</p>
                <p className="text-[10px] text-slate-600 mt-1 font-medium uppercase tracking-widest">Prioritize WCAG compliance checks</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-12">
        <button
          onClick={onStart}
          disabled={screens.length === 0}
          className="px-16 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Run AI Analysis
        </button>
      </div>
    </div>
  );
};
