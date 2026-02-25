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
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 p-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Analyzing your designs</h2>
        <p className="text-slate-500 max-w-xs mx-auto">Our AI is reviewing your screens against 40+ UX heuristics.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay * 0.5 }}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
          >
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <step.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">{step.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
