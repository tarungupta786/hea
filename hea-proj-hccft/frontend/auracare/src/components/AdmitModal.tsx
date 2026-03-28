import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { admitPatient } from '../lib/api';

interface AdmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitted: () => void;
}

export function AdmitModal({ isOpen, onClose, onAdmitted }: AdmitModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = fd.get('name') as string;
    const age = Number(fd.get('age'));
    const gender = fd.get('gender') as string;
    const condition = fd.get('condition') as string;
    const priority = fd.get('priority') as string;
    const ward = fd.get('ward') as string;

    if (!name || !age || !condition) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const res = await admitPatient({ name, age, gender, condition, priority, ward: ward || undefined });
      toast.success(res.message + (res.bed ? ` — Bed: ${res.bed.bed_number}` : ''));
      onClose();
      onAdmitted();
    } catch (e: any) {
      toast.error('Failed to admit', { description: e.message });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">Admit New Patient</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="relative z-0 w-full">
                <input name="name" type="text" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer" placeholder=" " />
                <label className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Patient Name *</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative z-0 w-full">
                  <input name="age" type="number" min="0" max="150" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer" placeholder=" " />
                  <label className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Age *</label>
                </div>
                <select name="gender" defaultValue="male" className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="relative z-0 w-full">
                <input name="condition" type="text" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer" placeholder=" " />
                <label className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Condition *</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="priority" defaultValue="normal" className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500">
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
                <select name="ward" defaultValue="" className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500">
                  <option value="">Auto-assign ward</option>
                  <option value="General">General</option>
                  <option value="ICU">ICU</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Maternity">Maternity</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-700">Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">Admit Patient</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
