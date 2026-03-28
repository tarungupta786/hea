import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCircle2, Plus, X, Stethoscope, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { getStaff, StaffMember } from '../lib/api';

export function StaffTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaff()
      .then(setStaff)
      .catch((e: any) => toast.error('Failed to load staff', { description: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const roleColor: Record<string, string> = {
    Doctor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    Nurse: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800',
  };

  const shiftColor: Record<string, string> = {
    Morning: 'bg-amber-50 text-amber-700 border-amber-200',
    Afternoon: 'bg-sky-50 text-sky-700 border-sky-200',
    Night: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading staff...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 min-h-[60vh] flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">Staff Management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Hospital personnel and shift assignments</p>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl py-20">
          <Users className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-xl font-medium">No staff members found</p>
          <p className="text-sm mt-1">Staff data will appear from backend</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((s) => (
            <motion.div key={s.id} whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 flex flex-col items-center text-center transition-all shadow-sm">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800/50">
                {s.role === 'Doctor' ? <Stethoscope className="h-10 w-10 text-blue-600 dark:text-blue-400" /> : <UserCircle2 className="h-10 w-10 text-teal-600 dark:text-teal-400" />}
              </div>
              <h4 className="font-display font-bold text-slate-800 dark:text-slate-100">{s.name}</h4>
              <Badge variant="outline" className={`mt-2 ${roleColor[s.role] || 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                {s.role}
              </Badge>
              <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 uppercase tracking-wider font-bold">Ward</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{s.department || (s as any).ward || '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 uppercase tracking-wider font-bold">Shift</span>
                  <Badge variant="outline" className={`text-[10px] ${shiftColor[s.shift] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    <Clock className="h-3 w-3 mr-1" /> {s.shift}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 uppercase tracking-wider font-bold">Status</span>
                  <span className={`font-semibold ${s.status === 'on_duty' || (s as any).on_duty ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {s.status === 'on_duty' || (s as any).on_duty ? '● On Duty' : '○ Off Duty'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
