'use client';

import React, { useState } from 'react';
import { Calculator, X, Delete, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CalculatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const constraintsRef = React.useRef(null);
  const calcRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen && 
        calcRef.current && 
        !calcRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNum = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval((equation + display).replace('×', '*').replace('÷', '/'));
      setDisplay(String(Number(result.toFixed(4))));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const del = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100]" />
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all z-50 group pointer-events-auto"
      >
        <Calculator size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={calcRef}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 overflow-hidden cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calculator size={16} className="text-blue-500" />
                Quick Calc
              </span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-4 text-right border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 h-4 mb-1 overflow-hidden">{equation}</div>
              <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight overflow-hidden truncate">
                {display}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={clear} className="col-span-2 py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 transition-colors">AC</button>
              <button onClick={del} className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex justify-center items-center"><Delete size={18} /></button>
              <button onClick={() => handleOp('/')} className="py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors">÷</button>
              
              <button onClick={() => handleNum('7')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">7</button>
              <button onClick={() => handleNum('8')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">8</button>
              <button onClick={() => handleNum('9')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">9</button>
              <button onClick={() => handleOp('*')} className="py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors">×</button>
              
              <button onClick={() => handleNum('4')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">4</button>
              <button onClick={() => handleNum('5')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">5</button>
              <button onClick={() => handleNum('6')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">6</button>
              <button onClick={() => handleOp('-')} className="py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors">-</button>
              
              <button onClick={() => handleNum('1')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">1</button>
              <button onClick={() => handleNum('2')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">2</button>
              <button onClick={() => handleNum('3')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">3</button>
              <button onClick={() => handleOp('+')} className="py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors">+</button>
              
              <button onClick={() => handleNum('0')} className="col-span-2 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">0</button>
              <button onClick={() => handleNum('.')} className="py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">.</button>
              <button onClick={calculate} className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors">=</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
