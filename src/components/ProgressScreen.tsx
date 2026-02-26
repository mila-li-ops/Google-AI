import React from 'react';
import { Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const ProgressScreen: React.FC = () => {
  const steps = [
    { icon: Sparkles, label: "Extracting visual hierarchy...", delay: 0 },
    { icon: Zap, label: "Analyzing interaction patterns...", delay: 1 },
    { icon: ShieldCheck, label: "Evaluating accessibility standards...", delay: 2 },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-20 p-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sharp Engineered Loader */}
      <div className="relative z-10">
        <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-[spin_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite]"></div>
          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-b-2 border-blue-400 animate-[spin_1s_linear_infinite_reverse]"></div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-4xl font-bold text-white tracking-tight">Analyzing your designs</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium opacity-60">Reviewing against 40+ UX heuristics.</p>
      </div>

      <div className="w-full max-w-sm space-y-3 relative z-10">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step.delay * 0.3 }}
            className="flex items-center gap-4 p-4 bg-[#151922] border border-white/5 rounded-xl shadow-2xl shadow-black/40 group hover:border-blue-500/20 transition-colors"
          >
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20 transition-colors">
              <step.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{step.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
