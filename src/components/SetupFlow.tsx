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
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Review Session</h1>
        <p className="text-slate-500">Upload your screens or provide URLs to start the AI-powered UX review.</p>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3"
        >
          <X className="w-5 h-5 cursor-pointer" onClick={() => onError(null)} />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition-colors group relative">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Upload Screens</p>
              <p className="text-sm text-slate-500">Drag and drop or click to browse</p>
            </div>
          </div>
        </div>

        {/* URL Section */}
        <div className="p-8 border border-slate-200 rounded-2xl bg-white space-y-4">
          <div className="flex items-center gap-3 text-indigo-600">
            <LinkIcon className="w-6 h-6" />
            <h3 className="font-semibold text-slate-900">Import from URL</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="https://example.com/design"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleAddUrl}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-slate-400 italic">Note: Real-time scraping is simulated for this MVP.</p>
        </div>
      </div>

      {/* Screen List */}
      {screens.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Screens ({screens.length})</h3>
            <p className="text-xs text-slate-500">Drag to reorder</p>
          </div>
          
          <Reorder.Group axis="y" values={screens} onReorder={onUpdateScreens} className="space-y-2">
            {screens.map((screen) => (
              <Reorder.Item 
                key={screen.id} 
                value={screen}
                className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm group"
              >
                <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing" />
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={screen.previewUrl} alt={screen.name} className="w-full h-full object-cover" />
                </div>
                <input 
                  type="text" 
                  value={screen.name}
                  onChange={(e) => renameScreen(screen.id, e.target.value)}
                  className="flex-1 font-medium text-slate-700 bg-transparent border-none focus:ring-0 p-0"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1 bg-slate-50 rounded border border-slate-100">
                    {screen.type}
                  </span>
                  <button 
                    onClick={() => removeScreen(screen.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
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
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
        <h3 className="font-semibold text-slate-900">Analysis Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Strictness Level</label>
              <span className="text-xs font-bold uppercase text-indigo-600">{options.strictness}</span>
            </div>
            <div className="flex gap-2">
              {(['light', 'normal', 'strict'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdateOptions({ ...options, strictness: level })}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                    options.strictness === level 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={options.sequential}
                  onChange={(e) => onUpdateOptions({ ...options, sequential: e.target.checked })}
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${options.sequential ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${options.sequential ? 'translate-x-4' : ''}`}></div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Analyze as Sequential Flow</p>
                <p className="text-xs text-slate-500">Check for consistency across screens</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={options.accessibilityFocus}
                  onChange={(e) => onUpdateOptions({ ...options, accessibilityFocus: e.target.checked })}
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${options.accessibilityFocus ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${options.accessibilityFocus ? 'translate-x-4' : ''}`}></div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Accessibility Focus</p>
                <p className="text-xs text-slate-500">Prioritize WCAG compliance checks</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onStart}
          disabled={screens.length === 0}
          className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Run AI Analysis
        </button>
      </div>
    </div>
  );
};
